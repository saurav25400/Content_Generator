
const shouldRenewSuscriptionPlan=(user)=>{
    const today=new Date();
    return !user?.nextBillingDate||user?.nextBillingDate<=today;
}
module.exports=shouldRenewSuscriptionPlan;