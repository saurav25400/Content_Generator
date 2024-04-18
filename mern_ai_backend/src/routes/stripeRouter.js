const express=require('express');
const {handleStripePayment,handleFreeSuscription,verifyPayment}=require('../controllers/handleStripePayment.js')
const isAutenticated=require('../middlewares/authentication.js');
const stripeRouter=express.Router();
stripeRouter.post("/checkout",isAutenticated,handleStripePayment);
stripeRouter.post("/free-plan",isAutenticated,handleFreeSuscription);
stripeRouter.post("/verify/:paymentId",isAutenticated,verifyPayment);


module.exports =stripeRouter;



