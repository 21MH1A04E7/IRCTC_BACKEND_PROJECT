const {AppError} = require('../utils/error');

const errorMiddleware=(err,req,res,next)=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            error:true,
            message: err.message,
            code: err.statusCode,
        });
    }
    console.log("Unexpected error", err);
    return res.status(500).json({
        success:false,
        error:true,
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
    });
}

module.exports=errorMiddleware;