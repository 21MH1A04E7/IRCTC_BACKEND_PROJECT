const logger= require('../config/logger');
const User=require('../models/user_model');
const { NotFoundError } = require('../utils/error');
const { redis } = require('../config/redis');
const { config } = require('../config');


const getProfile=async(userId)=>{   
    logger.info(`First check the user profile in redis`);
    const storedUser=await redis.get(`user:${userId}`);
    if(storedUser){
        logger.info(`User profile found in redis`);
        return JSON.parse(storedUser);
    }
    // if not found in redis, fetch from database
    logger.info(`User profile not found in redis, fetching from database`);
    const userProfile=await User.query().where('id',userId).first();

    if(!userProfile){
        logger.error(`User profile not found in database`);
        throw new NotFoundError('User profile not found');
    }
    const {password:_passoword,...safeUser}=userProfile;
    // store the user profile in redis
    await redis.set(`user:${userId}`,JSON.stringify(safeUser),'EX',config.REDIS_USER_TTL);
    return safeUser;
}

const deleteProfile=async(userId)=>{
    //delete user from database
    await User.query().where('id',userId).delete();
    //delete user from redis
    await redis.del(`user:${userId}`);
}

module.exports={
    getProfile,
    deleteProfile
}