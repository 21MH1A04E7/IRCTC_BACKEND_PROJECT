const { producer, connectProducer, disconnectProducer } = require('../../config/kafka');
const logger = require('../../config/logger');
const { KAFKA_TOPICS } =require('../../../../shared/constants/kafka-topics')


class NotificationProducer {
    constructor() {
        this.isIntialized = false;
    }
    async initialize() {
        if (!this.isIntialized) {
            await connectProducer();
            this.isIntialized = true;
            logger.info("Producer initialized successfully for the notification")
        }
    }
    async sendMessage(topic, key, data) {
        try {
            await this.initialize();
            const value = typeof data === 'string' ? data : JSON.stringify(data)
            const message = {
                topic,
                messages: [{
                    key: key || `${topic}-${Date.now()}`,
                    value: value,
                    timeStamp: Date.now().toString()
                }]
            }
            console.log("message=============>",message)
            const result = await producer.send(message)

            logger.info(`Message sent to kafka topic:${topic}`, {
                key,
                partition: result[0].partition,
                offset: result[0].offset
            })

            return result;
        } catch (error) {
            logger.error(`Failed to send message to kafka topic: ${topic}`, {
                error: error.message,
                stack: error.stack,
                key
            })
            throw error;
        }
    }
     async sendOtpEmail(email, otp, ttlMinutes = 5){
          return this.sendMessage(
               KAFKA_TOPICS.OTP_EMAIL,
               `otp-${email}`,
               {email, otp, ttlMinutes}
          )
     }

     async sendWelcomeEmail(email, firstName){
          return this.sendMessage(
               KAFKA_TOPICS.WELCOME_EMAIL,
               `welcome-${email}`,
               {email, firstName}
          )
     }

}


module.exports=new NotificationProducer();