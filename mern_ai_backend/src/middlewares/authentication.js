const asyncHandler=require('express-async-handler');
const jwt=require('jsonwebtoken');
const User = require('../models/User');

const isAutenticated=asyncHandler(async(req,res,next)=>{
    if(req.cookies.token){
        const payload=jwt.verify(req.cookies.token,process.env.JWT_SECRET);
        // console.log(payload,'payload');
        const user=await User.findById(payload.id);
        req.user=user; //setting to req boject to access user details across all controllers or anywhere in backend.
        return next();

    }
    else{
        return res.status(401).json({message:'unauthorised access'});
    }
});

module.exports=isAutenticated;