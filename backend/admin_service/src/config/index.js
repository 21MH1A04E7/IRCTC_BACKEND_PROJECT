require('dotenv').config();

const config={
    SERVICE_NAME:require('../../package.json').name,
    PORT: Number(process.env.PORT) || 3002,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS|| "http://localhost:3002",
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_USER:process.env.DATABASE_USER,
    DATABASE_PASSWORD:process.env.DATABASE_PASSWORD,
    DATABASE_NAME:process.env.DATABASE_NAME,
    DATABASE_PORT:Number(process.env.DATABASE_PORT),
    OTP_TTL: Number(process.env.OTP_TTL) || 300,
    OTP_RATE_MAX_PER_HOUR:Number(process.env.OTP_RATE_MAX_PER_HOUR) || 5,
    HMAC_SECRET:String(process.env.HMAC_SECRET)|| 'hac_secret',
    NODE_MAILEREMAIL_USER:String(process.env.NODE_MAILEREMAIL_USER.trim()),
    NODE_MAILEREMAIL_PASS:String(process.env.NODE_MAILEREMAIL_PASS.trim()),
    NODE_MAILER_VERIFIED_EMAIL:String(process.env.NODE_MAILER_VERIFIED_EMAIL.trim()),
    OTP_MAX_VERIFY_ATTEMPT:Number(process.env.OTP_MAX_VERIFY_ATTEMPT) || 5,
    ACCESS_TOKEN_EXP_SEC:process.env.ACCESS_TOKEN_EXP_SEC,
    REFRESH_TOKEN_EXP_SEC:process.env.REFRESH_TOKEN_EXP_SEC,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXP:process.env.ACCESS_TOKEN_EXP,
    REFRESH_TOKEN_EXP:process.env.REFRESH_TOKEN_EXP,
    REDIS_USER_TTL:process.env.REDIS_USER_TTL,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    KAFKA_BROKER:process.env.KAFKA_BROKER,
    KAFKA_CLIENT_ID:process.env.KAFKA_CLIENT_ID

}

module.exports={config};