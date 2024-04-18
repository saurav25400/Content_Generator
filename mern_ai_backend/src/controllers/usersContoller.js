const bcrypt=require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt=require('jsonwebtoken');
const User=require('../models/User.js');


 const register=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        console.log(username,email,password);
        //validate
        if(!username ||!email ||!password){
            res.status(400);
            throw new Error("please fill all the details");
        }
        //check if user exist exist or not 
        const userExist=await User.findOne({email});
        if(userExist){
              res.status(400);
              throw new Error("User is already exist");
        } 
        //Hash the Password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new User({
            username,
            password:hashedPassword,
            email
        });
        //Add the date trial will end ..future date when trial will end

        newUser.trialExpires=new Date(
            new Date().getTime()+newUser.trialPeriod*24*60*60*100
        );

        //Save the user
        await newUser.save();
        return res.status(201).json({
            status:true,
            message:"Registration was successfull",
             username:username,
             email:email
            
        })

    }
    catch(error){
        //throw new Error(error);
        next(error);
    }
    
}
// login function

const login=asyncHandler(async(req,res,next)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
        res.status(401);
        throw new Error('Invalid credentials!!!');

    }
    const passwords=await bcrypt.compare(password,user?.password);
    if(!passwords){
        res.status(401);
        throw new Error('Invalid credentials!!!');
    }
    //generate token and send to client using cookie in http only
    const token=jwt.sign({id:user?._id,email:user?.email,username:user?.username},process.env.JWT_SECRET,{
        expiresIn:'3d' //will expire in 3days
    });

    //set the token in cookie in http only mode
    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:"strict",
        maxAge:24*60*60*1000 //1 day
    })


    return res.status(200).json({
        status:"success",
        message:"login successfully",
        id:user?._id,
        email:user?.email,
        username:user?.username
    });

});

//logout
const logout=(req,res,next)=>{
    res.cookie('token','',{maxAge:1});
    res.status(200).json({
        message:"Logout successfully!!!"
    })
}

//user-profile
const  userProfile=asyncHandler(async(req,res,next)=>{
    const user=await User.findById(req.user._id).select('-password').populate('payment').populate('history');
    if(!user){
        res.status(400);
        throw new Error("user not found");
    }
    return res.status(200).json({
        status:"success",
        user
    })
})

// check  user authentication status when you get to client side
const checkAuth=asyncHandler(async(req,res,next)=>{
    const decoded=jwt.verify(req.cookies.token,process.env.JWT_SECRET);
    if(decoded){
        res.status(200).json({
            isAuthenticated:true
        })
    }
    else{
        res.status(401).json({
            isAuthenticated:false
        })
    }
})



module.exports={
    register,
    login,
    logout,
    userProfile,
    checkAuth
}