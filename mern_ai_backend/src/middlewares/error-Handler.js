const errorHandler=(err,req,res,next)=>{
    return res.status(500).json({
        message:err.message,
        stack:process.env.NODE_ENV==='development'?err.stack:{}
    });
}
module.exports=errorHandler;