const express=require('express');
const {sendOTP}=require('../controllers/auth_controller');


const router=express.Router();

router.post('/send-otp',sendOTP);

module.exports=router