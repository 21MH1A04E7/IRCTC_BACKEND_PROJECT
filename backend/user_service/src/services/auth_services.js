const bcrypt = require("bcryptjs");
const User = require('../models/user_model')
const asyncHandler=require('../utils/asyncHandler');
const { ConflictError } = require('../utils/error');
const {sendOTPEmail}=require('../utils/email')

const sendOTP=async(firstName,lastName,email , password)=>{

    const existUser=await User.query().select('*').where("email",email).first();

    if(existUser){
        throw new ConflictError("user already exists");
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const meta={firstName,lastName,email,hashedPassword};
    const {otp,optSessionId}=await generateAndStoreOtp(meta);
    //sync email send
    await sendOTPEmail(email,otp);
    return {optSessionId}

}


module.exports={sendOTP}