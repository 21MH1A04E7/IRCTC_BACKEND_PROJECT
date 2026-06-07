const express=require('express');
const { getProfile ,deleteProfile,updateProfile} = require('../controllers/user_controller');
const { requireAuth } = require('../middlewares/auth_middleware');
const {getUserContext}=require('../middlewares/getUserContext_middleware')



const router=express.Router();

router.post('/profile',getUserContext,getProfile);
router.delete('/profile',getUserContext,deleteProfile);


module.exports=router