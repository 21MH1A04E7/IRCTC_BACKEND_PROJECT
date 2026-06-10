const { config } = require('../config');
const crypto = require("crypto");
const { redis } = require('../config/redis');
const otpGenerator = require('otp-generator')
const { ToManyRequestsError } = require('./error');


function hmacFor(email,otp){
    return crypto.createHmac('sha256',config.HMAC_SECRET).update(email+":"+otp).digest('hex')
}
const generateAndStoreOtp = async (meta) => {
    const rateKey = `otp:rate:${meta.email}`;
    const sendCount = parseInt(await redis.get(rateKey) || '0', 10)
    if (sendCount >= config.OTP_RATE_MAX_PER_HOUR) {
        throw new ToManyRequestsError(
            "Too may OTP request. Try Again later",
            "TOO_MANY_REQUESTS"
        )
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const otpSessionId=crypto.randomUUID();
    const hashedOtp=hmacFor(meta.email,otp);
    await redis.set(`otp:session:${otpSessionId}`,JSON.stringify({
        hashedOtp:hashedOtp,
        meta:meta
    }),'EX',config.OTP_TTL)
    await redis.incr(rateKey)
    await redis.expire(rateKey,3600);
    return {otp,otpSessionId}
}

const verifyOTP=async(otp,otpSessionId)=>{
    const rawData=await redis.get(`otp:session:${otpSessionId}`)
    if(!rawData) return null;

    const {hashedOtp:storedOtp,meta}=JSON.parse(rawData);

    const attemptsKey=`otp:attempts:${meta.email}`;
    const attemptsCount=parseInt(await redis.get(attemptsKey)||'0',10);
    if(attemptsCount>=config.OTP_MAX_VERIFY_ATTEMPT){
        throw new ToManyRequestsError("too many attemps to verify otp")
    }
    const hashedOtp=hmacFor(meta.email,otp);

    if(!crypto.timingSafeEqual(
        Buffer.from(hashedOtp,'hex'),
        Buffer.from(storedOtp,'hex')
    )){
        await redis.incr(attemptsKey);
        await redis.expire(attemptsKey,config.OTP_TTL)
        return null;
    }

    await redis.del(`otp:session:${otpSessionId}`);
    await redis.del(`otp:rate:${meta.email}`),
    await redis.del(attemptsKey);
    return meta;

}

module.exports = { generateAndStoreOtp,verifyOTP }