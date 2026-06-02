const asyncHandler=require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/error');
const userService=require('../services/user_services');



const getProfile=asyncHandler(async(req,res)=>{
    const userId=req.user.id
    if(!userId){
        throw new BadRequestError('User id is missing');
    }
    const user=await userService.getProfile(userId);
    return res.status(200).json({
        success:true,
        message:"User fetched successfully",
        data:user
    })
})

module.exports={
    getProfile
}