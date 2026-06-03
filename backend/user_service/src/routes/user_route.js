const express=require('express');
const { getProfile ,deleteProfile,updateProfile} = require('../controllers/user_controller');
const { requireAuth } = require('../middlewares/auth_middleware');



const router=express.Router();

router.post('/profile',requireAuth,getProfile);
router.delete('/profile',requireAuth,deleteProfile);


module.exports=router