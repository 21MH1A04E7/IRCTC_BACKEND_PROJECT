const bcrypt = require("bcrypt");
const User = require('../models/user_model')
const { ConflictError, BadRequestError, ForbiddenError, UnauthorizedError } = require('../utils/error');
const { sendOTPEmail, verifyOtpEmail} = require('../utils/email')
const { generateAndStoreOtp, verifyOTP: verifyStoreOTP } = require('../utils/otp');
const { generateAccessToken, generateRefreshToken, verfiyRefreshToken } = require("../utils/auth");
const jwt  = require("jsonwebtoken");
const { config } = require("../config");
const {redis} = require("../config/redis");
const { OAuth2Client } = require("google-auth-library");
const AuthProvider = require("../models/auth_provider");
const notification_producer = require("../kafka/producer/notification_producer");

const sendOTP = async (firstName, lastName, email, password) => {

    const existUser = await User.query().select('*').where("email", email).first();

    if (existUser) {
        throw new ConflictError("user already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const meta = { firstName, lastName, email, hashedPassword };
    const { otp, otpSessionId } = await generateAndStoreOtp(meta);
    //sync email send
    await notification_producer.sendOtpEmail(email,otp,(config.OTP_TTL)/60)
    // await sendOTPEmail(email,otp);
    
    console.log(otp, otpSessionId)
    return { otpSessionId }

}


const verifyOTP = async (otp, otpSessionId) => {
    const meta = await verifyStoreOTP(otp, otpSessionId);
    if (meta == null) {
        throw new BadRequestError("Invalid or expired otp", "OTP_INVALID")
    }
    //create the user
    const user = {
        firstName: meta.firstName,
        lastName: meta.lastName,
        email: meta.email,
        password: meta.hashedPassword,
        emailVerified: true
    }

    await User.query().insert(user)
    // await verifyOtpEmail(meta)
    await notification_producer.sendWelcomeEmail(meta.email,meta.firstName)
    return user
}

const login=async(email,password,deviceId)=>{
    const user = await User.query().where('email', email).first();
    if (!user) {
        throw new BadRequestError("Email not found");
    }
    const mathPassword=await bcrypt.compare(password,user.password);
    if(!mathPassword){
        throw new BadRequestError("Password is worng ,pls try again");
    }

    // console.log("user--------->",user)
    const accessToken=generateAccessToken(user.id)
    const refreshToken=generateRefreshToken(user.id)

    const {jti}=jwt.decode(refreshToken)
    await redis.set(`refresh:${user.id}:${deviceId}`,jti,'EX',config.REFRESH_TOKEN_EXP_SEC);
    const {password:_passoword,...safeUser}=user;
    await redis.set(`user:${user.id}`,JSON.stringify(safeUser),'EX',config.REDIS_USER_TTL)
   return {accessToken,refreshToken,loggedInUser:safeUser}
    
}

const rotateRefreshToken=async(refreshToken,deviceId)=>{
    const payload=verfiyRefreshToken(refreshToken);
    const {id:userId,jti}=payload;
    const storedJti=await redis.get(`refresh:${userId}:${deviceId}`);
    // console.log("comming")
    if(!storedJti){
        throw new ForbiddenError("Session Expired","LOGIN AGAIN");
    }
    // console.log("stored",storedJti,jti)
    if(storedJti!==jti){
        // console.log("jti------------->",jti)
        await redis.del(`refresh:${userId}:${deviceId}`);
        throw new ForbiddenError("Refresh Token reused","LOGIN AGAIN");
    }
    const newAccessToken=generateAccessToken(payload.id);
    const newRefreshToken=generateRefreshToken(payload.id);
    const {jti:newJti}=jwt.decode(newRefreshToken);
    await redis.set(`refresh:${userId}:${deviceId}`,newJti,'EX',
        config.REFRESH_TOKEN_EXP_SEC);

    return {newAccessToken,newRefreshToken};
}

const verifyGoogleIdToken=async(idToken,deviceId)=>{
    const client=new OAuth2Client(config.GOOGLE_CLIENT_ID)
    const ticket=await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload=ticket.getPayload();
    console.log("gogole payload",payload)
    if(!payload.sub || !payload.email){
        throw new UnauthorizedError("Invalid Google token payload");
    }

    const googleUser= {
        provider:payload.iss,
        prividerId:payload.sub,
        email:payload.email,
        firstName:payload.given_name,
        lastName:payload.family_name,
        emailVerified:payload.email_verified || false
    }
    console.log("google user",googleUser)
    let user={}
    await User.transaction(async(trx)=>{
        // console.log("log2========>")
        let googleAuth=await AuthProvider.query(trx)
        .withGraphFetched('user')
        .where('provider',googleUser.provider)
        .andWhere('providerId',googleUser.prividerId)
        .first()
        // console.log("log3======>",googleAuth)
        //already user has create the account through google auth
        if(googleAuth){
            user= googleAuth.user;
            return;
        }
        console.log('log1======>')
        let existUser=await User.query(trx).where('email',googleUser.email).first();
        console.log(existUser)
        //user already created singin manually
        if(existUser){
            await AuthProvider.query(trx).insert({
                provider:googleUser.provider,
                providerId:googleUser.prividerId,
                userId:existUser.id
            })
            user= existUser;
            return;
        }

        const newuser=await User.query(trx).insertAndFetch({
            email:googleUser.email,
            firstName:googleUser.firstName,
            lastName:googleUser.lastName,
            emailVerified:googleUser.emailVerified
        }).first()
        await AuthProvider.query(trx).insert({
            provider:googleUser.provider,
            providerId:googleUser.prividerId,
            userId:newuser.id
        })
        user= newuser
        return;
    })
    const accessToken=generateAccessToken(user.id);
    const refreshToken=generateRefreshToken(user.id);

    const {jti}=jwt.decode(refreshToken)
    await redis.set(`refresh:${user.id}:${deviceId}`,jti,'EX',config.REFRESH_TOKEN_EXP_SEC);
    const {password:_passoword,...safeUser}=user;
    await redis.set(`user:${user.id}`,JSON.stringify(safeUser),'EX',config.REDIS_USER_TTL)
    
    return {accessToken,refreshToken,loggedInUser:safeUser};
}
module.exports = { sendOTP, verifyOTP,login,rotateRefreshToken ,verifyGoogleIdToken}