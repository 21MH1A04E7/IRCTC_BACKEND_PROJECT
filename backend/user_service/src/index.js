const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const {config}=require('./config');
const logger=require('./config/logger')
const db=require('./db/knex')

const authRoutes=require('./routes/auth_route')
const userRoutes=require('./routes/user_route')


const corsMiddleware=require('./middlewares/cors_middleware');
const reqLogger=require('./middlewares/req_middleware');
const errorMiddleware=require('./middlewares/error_middleware');

const app = express();


app.use(helmet());
app.use(corsMiddleware);
app.use(reqLogger);
app.use(cookieParser());
app.use(express.json());

app.use("/auth",authRoutes)
app.use("/user",userRoutes)


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get("/health", (req, res) => {
    res.status(200).json({ message: 'OK' });
});

app.use(errorMiddleware);

const startServer=async()=>{
    try {
        await db.raw('SELECT 1')
        .then(()=>console.log('database connnected sucessfully'))
        const server=app.listen(config.port, () => {
            logger.info(
                `${config.SERVICE_NAME} is running on port ${config.port}`
            )
        });
        server.on('error', (error) => {
            logger.error(`Failed to start the server ${error}`)
            process.exit(1);
        });
    } catch (error) {
        logger.error(`Failed to start the server ${error}`)
        process.exit(1);
    }
}
startServer();