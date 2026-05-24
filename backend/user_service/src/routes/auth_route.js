const express=require('express');
const {sendOTP,verifyOTP,login}=require('../controllers/auth_controller');



const router=express.Router();

router.post('/send-otp',sendOTP);
router.post('/verify-otp',verifyOTP)
router.post('/login',login)

module.exports=router