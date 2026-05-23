const bcrypt = require("bcrypt");
const User = require('../models/user_model')
const { ConflictError, BadRequestError } = require('../utils/error');
const { sendOTPEmail, verifyOtpEmail} = require('../utils/email')
const { generateAndStoreOtp, verifyOTP: verifyStoreOTP } = require('../utils/otp')

const sendOTP = async (firstName, lastName, email, password) => {

    const existUser = await User.query().select('*').where("email", email).first();

    if (existUser) {
        throw new ConflictError("user already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const meta = { firstName, lastName, email, hashedPassword };
    const { otp, otpSessionId } = await generateAndStoreOtp(meta);
    //sync email send
    await sendOTPEmail(email,otp);
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
    await verifyOtpEmail(meta)
    return user
}


module.exports = { sendOTP, verifyOTP }