exports.validatePayment=(req,res,next)=>{

const {fullName,email,phone}=req.body;

if(!fullName ||!email ||!phone
){
return res.send("Missing required fields");
}
next();
};