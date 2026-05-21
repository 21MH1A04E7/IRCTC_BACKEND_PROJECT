require('dotenv').config();

const config={
    SERVICE_NAME:require('../../package.json').name,
    port: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS|| "http://localhost:3000",
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
    NODE_MAILER_VERIFIED_EMAIL:String(process.env.NODE_MAILER_VERIFIED_EMAIL.trim())

}

module.exports={config};