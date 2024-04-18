const mongoose=require('mongoose');


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    trialPeriod:{
        type:Number,
        default:3
    },

    trialActive:{
        type:Boolean,
        default:true
    },
    trialExpires:{
        type:Date
    },
    subscriptionPlan:{
        type:String,
        enum:['Trial','Free','Basic','Premium'],
        default:'Trial'

    },
    apiRequestCount:{
        type:Number,
        default:0
    },
    monthlyRequestCount:{
        type:Number,
        default:100  //default credit for 3 days
    },
    nextBillingDate:Date,
    payment:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Payment'
        }
    ],
    history:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'History'
        }
    ]
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
//virtual prperty added to userschema at schema level
userSchema.virtual("isTrialActive").get(function(){
    // console.log(new Date());
    return this.trialActive && new Date()<this.trialExpires;
})
// * creating model from schema
const User=mongoose.model('User',userSchema);
module.exports=User;