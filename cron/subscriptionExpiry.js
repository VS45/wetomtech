const cron=require("node-cron");

const Payment=require("../models/Payment");

cron.schedule("0 0 * * *",async()=>{
await Payment.updateMany({subscriptionEnd:{$lt:new Date()},status:"successful"},
{status:"expired"});
console.log(
"Subscription check completed"
);
});

