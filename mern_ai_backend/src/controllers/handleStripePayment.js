const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);
const calculateNextBillingDate = require("../utils/NextBillingDate.js");
const shouldRenewSuscriptionPlan = require("../utils/shoulRenewPlan.js");
const Payment = require("../models/Payment");
const User = require("../models/User.js");
const handleStripePayment = asyncHandler(async (req, res, next) => {
  const { amount, suscriptionPlan } = req.body;
  try {
    //get the user
    const user = req?.user;
    // console.log(user);
    console.log("hello");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "usd",
      // add some mets data for verification
      metadata: {
        userId: req.user?.id?.toString(),
        userEmail: req.user?.email,
        suscriptionPlan,
      },
    });
    // console.log(paymentIntent);

    //send the response
    res.status(200).json({
      clientSecret: paymentIntent?.client_secret,
      paymentId: paymentIntent?.id,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    res.status(200).json({
      error: error,
    });
  }
});

// verify  stripe payments for completing payment
const verifyPayment = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.params;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    console.log(paymentIntent);
    if (paymentIntent.status !== "succeeded") {
      //get the metadata of the users
      const metadata = paymentIntent.metadata;
      const subscriptionPlan = metadata?.suscriptionPlan;
      const userEmail = metadata?.userEmail;
      const userId = metadata?.userId;

      //get the payment details
      const amount = paymentIntent?.amount / 100;
      const paymentId = paymentIntent?.id;
      const currency = paymentIntent?.currency;

      //create the payment history
      const newPayment = await Payment.create({
        user: userId,
        email: userEmail,
        subscriptionPlan,
        amount,
        currency,
        status: 'success',
        reference: paymentId,
      });

      //checkout the plans and according update the user details
      if (subscriptionPlan === "Basic") {
        //update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan: subscriptionPlan,
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 50,
          subscriptionPlan:'Basic',
          $addToSet: { payment: newPayment?._id },
        });

        return res.status(200).json({
          status: "success",
          message: "payment verified, user updated",
          updatedUser,
        });
      }
    //   for premium user
    if (subscriptionPlan === "Premium") {
        //update the user
        const updatedUser = await User.findByIdAndUpdate(userId, {
          subscriptionPlan: subscriptionPlan,
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount: 100,
          subscriptionPlan:'Premium',
          $addToSet: { payment: newPayment?._id },
        });

        return res.status(200).json({
          status: "success",
          message: "payment verified, user updated",
          updatedUser,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error,
    });
  }
});
// Handle free suscription

const handleFreeSuscription = asyncHandler(async (req, res, next) => {
  //get the login user
  const user = req?.user;
  console.log("freeplan");
  try {
    if (shouldRenewSuscriptionPlan(user)) {
      //update the user accounts
      (user.subscriptionPlan = "Free"), (user.monthlyRequestCount = 5);
      user.apiRequestCount = 0;
      user.nextBillingDate = calculateNextBillingDate();
      //create  payments and save into db
      const newPayment = await Payment.create({
        user: user?._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        reference: Math.random().toString(36).substring(7),
        monthlyRequestCount: 5,
        currency: "usd",
      });
      //saving the payments id to user collection
      user.payment.push(newPayment?._id);
      await user.save();
      //send the response to user
      return res.status(200).json({
        status: "success",
        message: "Suscription updated successfully!!",
        user,
      });
    } else {
      return res.status(403).json({ error: "Suscription not due yet " });
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
});

module.exports = {
  handleStripePayment,
  handleFreeSuscription,
  verifyPayment,
};
