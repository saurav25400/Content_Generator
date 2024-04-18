const express=require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
var cron = require('node-cron');
const cors=require('cors');
const path=require('path');
const errorHandler=require('./mern_ai_backend/src/middlewares/error-Handler.js')
const router=require('./mern_ai_backend/src/routes/userRouters.js');
const mongoDB=require('./mern_ai_backend/src/utils/connectDB.js');
const openApiRouter = require('./mern_ai_backend/src/routes/openApiRouter.js');
const stripeRouter = require('./mern_ai_backend/src/routes/stripeRouter.js');
const User=require('./mern_ai_backend/src/models/User.js');

const app=express();
const PORT=process.env.PORT||8090;
const corsOption={
    origin:'http://localhost:3000',
    credentials:true, //for passing authorization and all
    methods:['GET', 'PUT', 'POST','DELETE','PATCH']
}
// to render frontend statics files
app.use(express.static(path.join(__dirname, "masync-mern-ai-frontend/build"))); // put this line of code in app.js

app.use(cors(corsOption));
// cron for trial period : run every single
cron.schedule('0 0 * * * *', async() => {
    console.log('running a task every minute');

    try{
        const today=new Date();
        const updatedUser=await User.updateMany({
            trialActive:true,
            trialExpires:{$lt:today}
        },{
            trialActive:false,
            subscriptionPlan:"Free",
            monthlyRequestCount:5
        })

    }
    catch(error){
        console.log(error);

    }
  });
  

//   cron for the Free plan : run at the end of every month

cron.schedule('0 0 1 * * *', async() => {
    console.log('running a task every month');

    try{
        const today=new Date();
        const updatedUser=await User.updateMany({
            subscriptionPlan:'Free',
            nextBillingDate:{$lt:today}
        },{
            
            monthlyRequestCount:0
        })

    }
    catch(error){
        console.log(error);

    }

  });

//  cron for the Basic plan : run at the end of every month

  cron.schedule('0 0 1 * * *', async() => {
    console.log('running a task every month');

    try{
        const today=new Date();
        const updatedUser=await User.updateMany({
            subscriptionPlan:'Basic',
            nextBillingDate:{$lt:today}
        },{
            
            monthlyRequestCount:0
        })

    }
    catch(error){
        console.log(error);

    }

  });

//    cron for the Premium plan : run at the end of every month
  cron.schedule('0 0 1 * * *', async() => {
    console.log('running a task every month');
    try{
        const today=new Date();
        const updatedUser=await User.updateMany({
            subscriptionPlan:'Premium',
            nextBillingDate:{$lt:today}
        },{
            
            monthlyRequestCount:0
        })

    }
    catch(error){
        console.log(error);

    }

  });








app.use(cookieParser()) //for parsing incoming cookie data
//middlewares
app.use(express.json()); //parses incoming data
// user router
app.use("/api/v1/users/",router);

app.use('/api/v1/openai',openApiRouter);
// start the express serstripeRouterver

app.use("/api/v1/stripe",stripeRouter);

// console.log(path.join(__dirname, 'masync-mern-ai-frontend', 'build'), 'full path');


app.use(express.static(path.join(__dirname, 'masync-mern-ai-frontend', 'build')));
console.log(path.join(__dirname, 'masync-mern-ai-frontend', 'build'));


// Serve the frontend index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'masync-mern-ai-frontend', 'build', 'index.html'));
});
  
  





//epress error-handler middlewares
app.use(errorHandler)
app.listen(PORT,(req,res)=>{
    console.log("server is running at PORT "+PORT);
    mongoDB();
})
