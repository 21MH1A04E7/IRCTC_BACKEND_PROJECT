const express=require('express')
const {config}=require('../config');
const { requireAuth } = require('../middlewares/auth_middleware');
const { createProxy } = require('../services/proxy');






const router=express.Router();


const userServiceProxy=createProxy('userService',config.USER_SERVICE_URL)


//public route

router.post(
    '/users/auth/login',
    requireAuth,
    userServiceProxy
)


// private route

router.post(
    '/users/user/profile',
    requireAuth,
    userServiceProxy
)

router.get('/health', (req, res) => {
    res.status(200).json({
         success: true,
         message: 'API Gateway is running',
         timestamp: new Date().toISOString(),
         environment: config.NODE_ENV,
    });
});

module.exports=router;