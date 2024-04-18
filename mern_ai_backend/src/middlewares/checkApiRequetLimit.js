const asyncHandler=require('express-async-handler');
const User=require('../models/User.js');

const checkApiRequestLimit=asyncHandler(async(req,res,next)=>{
    if(!req.user){
        return res.status(401).json({
            message:"aunthorized"
        })
    }
    // find the user
    const user=await User.findById(req.user?.id);
    if(!user){
        return res.status(404).json({
            message:"user not found"
        })
    }
    let requestLimit=0;
    //check whether user is on free trial period or not
    if(user?.trialActive){
        requestLimit=user?.monthlyRequestCount;

    }
    //check if api requart count exceeded the monthly request count or not.
    if(user?.apiRequestCount>=requestLimit){
        throw new Error("APi request limit reached!!!");

    }
    //call the next middleware in the pipeline
    next();

});

module.exports=checkApiRequestLimit
