const express=require('express');
const {sendOTP}=require('../controllers/auth_controller');


const router=express.Router();

router.post('/send-opt',sendOTP);

module.exports=router