const mongoose = require("mongoose");


const PaymentSchema = new mongoose.Schema({

    tx_ref: {
        type: String,
        unique: true
    },

    flutterwave_id: {
        type: String
    },


    customerName: {
        type: String,
        required: true
    },


    email: {
        type: String,
        required: true
    },


    phone: {
        type: String
    },


    address: {
        type: String
    },


    plan: {
        type: String,
        default:
            "wetomnet-unlimited-20k"
    },


    amount: {
        type: Number,
        default: 20000
    },


    currency: {
        type: String,
        default: "NGN"
    },


    status: {
        type: String,
        default: "pending"
    },


    paymentDate: {
        type: Date
    },


    subscriptionStart: {
        type: Date
    },


    subscriptionEnd: {
        type: Date
    }


});


module.exports =
    mongoose.model(
        "Payment",
        PaymentSchema
    );