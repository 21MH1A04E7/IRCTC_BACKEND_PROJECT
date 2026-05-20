const { config } = require('../config');
const crypto = require("crypto");
const { redis } = require('../config/redis');
const otpGenerator = require('otp-generator')
const { ToManyRequestsError } = require('./error');


function hmacFor(email,otp){
    return crypto.createHmac('sha256',config.HMAC_SECRET).update(email+":"+otp).digest('hex')
}
const generateAndStoreOtp = async (meta) => {
    const rateKey = `opt:rate:${meta.email}`;
    const sendCount = parseInt(await redis.get(rateKey) || '0', 10)
    if (sendCount >= config.OTP_RATE_MAX_PER_HOUR) {
        throw new ToManyRequestsError(
            "Too may OTP request. Try Again later",
            "TOO_MANY_REQUESTS"
        )
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    const optSessionId=crypto.randomUUID();
    const hashedOtp=hmacFor(meta.email,otp);
    await redis.set(`opt:session:${optSessionId}`,JSON.stringify({
        hashedOtp,
        email:meta.email
    }),'EX',config.OTP_TTL)
    await redis.incr(rateKey)
    await redis.expire(rateKey,3600);
    return {otp,optSessionId}
}

module.exports = { generateAndStoreOtp }