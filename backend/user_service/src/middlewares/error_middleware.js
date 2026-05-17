const {AppError} = require('../utils/error');

const errorMiddleware=(err,req,res,next)=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            error:err.code,
            message: err.message,
            code: err.code,
        });
    }
    console.log("Unexpected error", err);
    return res.status(500).json({
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
    });
}

module.exports=errorMiddleware;