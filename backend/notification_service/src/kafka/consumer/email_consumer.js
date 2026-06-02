const { consumer } = require('../../config/kafka')
const { KAFKA_TOPICS } = require('../../../../shared/constants/kafka-topics');
const logger = require('../../config/logger');
const emailService = require('../../services/email_service');


class EmailConsumer {
    async start() {
          try {
               await consumer.connect();
               logger.info('Email consumer connected to Kafka');

               await consumer.subscribe({
                    topics: Object.values(KAFKA_TOPICS),
                    fromBeginning: false
               });

               await consumer.run({
                    eachMessage: async ({ topic, message }) => {
                         logger.info(`Processing message from topic: ${topic}`);

                         const rawValue = message?.value?.toString?.();
                         if (!rawValue) {
                              logger.warn(`Skipping message with empty value (topic: ${topic})`);
                              return;
                         }

                         let parsedValue;
                         try {
                              parsedValue = JSON.parse(rawValue);
                         } catch (e) {
                              logger.error(`Failed to parse message value as JSON (topic: ${topic})`, {
                                   error: e?.message,
                                   rawValue,
                              });
                              return;
                         }

                         await this.handleMessage(topic, parsedValue);
                    },
               });

               logger.info('Email consumer is running and listening for messages...');
          } catch (error) {
               console.log(error)
               logger.error('Failed to start email consumer', { error: error.message });
               throw error;
          }
     }

     async handleMessage(topic, data) {
          switch (topic) {
               case KAFKA_TOPICS.OTP_EMAIL:
                    await this.handleOtpEmail(data);
                    break;

               case KAFKA_TOPICS.WELCOME_EMAIL:
                    await this.handleWelcomeEmail(data);
                    break;
               default:
                    logger.warn(`Unknown topic: ${topic}`);
          }
     }
      async handleOtpEmail(data) {
          const { email, otp, ttlMinutes } = data;

          if (!email || !otp) {
               throw new Error('Missing required fields: email or otp');
          }

          await emailService.sendOtpEmail(email, otp, ttlMinutes || 5);
          logger.info(`OTP email sent to ${email}`);
     }

     async handleWelcomeEmail(data) {
          const { email, firstName } = data;

          if (!email || !firstName) {
               throw new Error('Missing required fields: email or firstName');
          }

          await emailService.sendWelcomeEmail(email, firstName);
          logger.info(`Welcome email sent to ${email}`);
     }

     async stop() {
          await consumer.disconnect();
          logger.info('Email consumer disconnected');
     }
}


module.exports=new EmailConsumer();