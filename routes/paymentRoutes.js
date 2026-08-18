const express=require("express");

const router=express.Router();
const paymentController =
require("../controllers/paymentController");
const { validatePayment } = require("../middleware/validation");

router.post("/flutterwave/initialize", validatePayment, paymentController.initializePayment);
router.get("/flutterwave/callback", paymentController.callback);

module.exports=router;