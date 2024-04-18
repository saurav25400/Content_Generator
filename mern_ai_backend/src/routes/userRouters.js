const express=require('express');
const {register,login,logout,userProfile,checkAuth}=require('../controllers/usersContoller.js');
const isAutenticated=require('../middlewares/authentication.js');
const router=express.Router();
router.post("/register",register);
router.post("/login",login);
router.post('/logout',logout);
router.get("/profile",isAutenticated,userProfile);
router.get("/auth/check",isAutenticated,checkAuth);

module.exports =router;



