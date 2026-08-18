const Payment = require("../models/Payment");

const flutterwave =require("../services/flutterwaveService");

exports.initializePayment =
    async (req, res) => {


        try {

            const {

                fullName,

                email,

                phone,

                address


            } = req.body;



            const tx_ref =
                "WETOMNET-" + Date.now();



            await Payment.create({

                tx_ref,

                customerName: fullName,

                email,

                phone,

                address,

                amount: 20000


            });




            const paymentData = {


                tx_ref,


                amount: 20000,


                currency: "NGN",


                redirect_url:

                    `${process.env.BASE_URL}/payments/flutterwave/callback`,



                customer: {


                    name: fullName,

                    email,

                    phonenumber: phone


                },


                customizations: {


                    title:
                        "WetomNet Unlimited",


                    description:
                        "Monthly Internet Subscription"

                }



            };





            const result =
                await flutterwave.createPayment(
                    paymentData
                );



            res.redirect(
                result.data.link
            );



        }

        catch (error) {

            console.log(error);

            res.send(
                "Payment error"
            );


        }



    };





exports.callback =
    async (req, res) => {


        try {


            const {

                transaction_id,

                tx_ref


            } = req.query;




            const result =
                await flutterwave.verifyPayment(
                    transaction_id
                );



            const payment =
                result.data;




            if (

                payment.status === "successful"

                &&

                payment.amount >= 20000

            ) {



                const start =
                    new Date();


                const end =
                    new Date();


                end.setMonth(
                    end.getMonth() + 1
                );



                await Payment.findOneAndUpdate(

                    {
                        tx_ref
                    },

                    {

                        status: "successful",

                        flutterwave_id:
                            transaction_id,


                        paymentDate: new Date(),


                        subscriptionStart: start,


                        subscriptionEnd: end


                    }

                );



                return res.redirect(
                    "/subscription-success"
                );


            }



            res.redirect(
                "/payment-failed"
            );


        }

        catch (error) {

            console.log(error);

            res.redirect(
                "/payment-failed"
            );


        }


    };