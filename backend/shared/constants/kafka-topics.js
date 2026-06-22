

const KAFKA_TOPICS=Object.freeze({
    //notication service for the email
     OTP_EMAIL: 'notification-otp-email',
     WELCOME_EMAIL: 'notification-welcome-email',
     STATION_CREATED:'station_created',
     TRAIN_CREATED: 'train_created',
     ROUTE_CREATED: 'route_created',

})

module.exports = { KAFKA_TOPICS };