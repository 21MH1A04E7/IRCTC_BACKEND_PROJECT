require('dotenv').config();

const config = {
     SERVICE_NAME: require('../../package.json').name,
     PORT: Number(process.env.PORT) || 4004,
     NODE_ENV: process.env.NODE_ENV || "development",
     LOG_LEVEL: process.env.LOG_LEVEL || "info",
     ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
     KAFKA_BROKER: process.env.KAFKA_BROKER,
     KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID,
     NODE_MAILER_VERIFIED_EMAIL:process.env.NODE_MAILER_VERIFIED_EMAIL,
     NODE_MAILEREMAIL_PASS:process.env.NODE_MAILEREMAIL_PASS,
     NODE_MAILEREMAIL_USER:process.env.NODE_MAILEREMAIL_USER
}
module.exports = { config };