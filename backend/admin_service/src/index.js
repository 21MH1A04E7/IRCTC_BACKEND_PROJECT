require('dotenv').config();
const express = require('express');
const db=require('./db/knex')
// const helmet = require('helmet');
const logger = require('./config/logger');
const { config } = require('./config');
const cookieParser = require('cookie-parser');


// Middlewares
const corsMiddleware  = require('./middlewares/cors_middleware');
const errorMiddleware = require('./middlewares/error_middleware');
const reqLogger  = require('./middlewares/req_middleware');

const stationRoutes=require('../src/routes/station_route')
const trainRoutes=require('../src/routes/train_route')


const app = express();

app.use(corsMiddleware);
// app.use(helmet({
//      crossOriginOpenerPolicy: false,
//      crossOriginEmbedderPolicy: false
// }));
app.use(reqLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // Request logging
// app.use((req, res, next) => {
//      logger.info(`${req.method} ${req.path}`, {
//           ip: req.ip,
//           userAgent: req.get('user-agent')
//      });
//      next();
// });

app.get("/", (req, res) => {
     res.send("Hello from index.js of admin-service");
})

// Health check
app.get('/health', (req, res) => {
     res.status(200).json({
          success: true,
          message: 'Admin Service is healthy',
          timestamp: new Date().toISOString()
     });
});


app.use("/stations", stationRoutes);
app.use("/trains", trainRoutes);

// Error handler (must be last)
app.use(errorMiddleware);

const startServer = async () => {
     try {
        await db.raw('SELECT 1')
        .then(()=>console.log('database connnected sucessfully'))
          const server = app.listen(config.PORT, () => {
               logger.info(
                    `${config.SERVICE_NAME} is running on port ${config.PORT}`
               );
          });

          // Graceful shutdown
          const shutdown = async () => {
               logger.info('Shutting down gracefully...');

               server.close(async () => {
                    await disconnectProducer();
                    logger.info('Server closed');
                    process.exit(0);
               });
          };

          process.on('SIGTERM', shutdown);
          process.on('SIGINT', shutdown);

     } catch (error) {
          logger.error('Failed to start server', error);
          process.exit(1);
     }
};

startServer();

module.exports = app;