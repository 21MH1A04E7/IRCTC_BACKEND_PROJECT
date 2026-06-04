const winston = require('winston');
const {config}=require('./index');

const logger=winston.createLogger({
    level: config.LOG_LEVEL,
    defaultMeta: {service:config.SERVICE_NAME},
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({level,message,timestamp,service})=>{
            return `[${timestamp} [${level.toUpperCase()}] [${service}]: ${message}]`;
        })
    ),
    transports:[
        new winston.transports.Console(),
        // new winston.transports.File({filename:'combined.log'})
    ]
})

module.exports=logger