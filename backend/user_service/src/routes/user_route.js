const express=require('express');
const { getProfile } = require('../controllers/user_controller');
const { requireAuth } = require('../middlewares/auth_middleware');


const router=express.Router();

router.post('/profile',requireAuth,getProfile);

module.exports=router