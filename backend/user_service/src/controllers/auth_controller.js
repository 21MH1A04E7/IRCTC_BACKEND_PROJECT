const asyncHandler=require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/error');
const authService=require('../services/auth_services')
const {config}=require('../config')
const Joi=require('joi')

const sendOTPSchema = Joi.object({
    firstName: Joi.string().alphanum().min(3).max(255).required(),
    lastName: Joi.string().min(1).max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(55).required(),
    confirmPassword: Joi.string().required()
});

const sendOTP = asyncHandler(async (req, res) => {
    const { error, value } = sendOTPSchema.validate(req.body);
    if (error) {
        throw new BadRequestError(error.details.map((d) => d.message).join(', '));
    }
    const { firstName, lastName, email, password,confirmPassword } = value;
    if(password!==confirmPassword){
        throw new BadRequestError("password misMatch")
    }
    const {otpSessionId}= await authService.sendOTP(firstName,lastName,email,password);

    return res.cookie("otp_session",otpSessionId,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:config.OTP_TTL * 1000
    }).status(200).json({
        success:true,
        message:"OTP sent successfully"
    })
})

const verifyOTP=asyncHandler(async(req,res)=>{
    const {otp}=req.body;
    const otpSessionId=req.cookies.otp_session;
    console.log(otpSessionId,otp)
    if(!otp || !otpSessionId){
        throw new BadRequestError("OTP or otpSessionId is missing");
    }
    const user=await authService.verifyOTP(otp,otpSessionId);
    return res.status(201).json({
        success:true,
        message:"user account created succesfully ",
        meata:user
    })

})
module.exports={
    sendOTP,
    verifyOTP
}