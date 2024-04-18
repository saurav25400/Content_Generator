const mongoose=require('mongoose');


const historySchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:String,
        required:true
    },
},
{
    timestamps:true
});

// * creating model from schema
const History=mongoose.model('History',historySchema);
module.exports=History;