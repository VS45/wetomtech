const axios = require("axios");



exports.createPayment =
    async (data) => {

console.log("Creating payment with data:", data);
        const response =
            await axios.post("https://api.flutterwave.com/v3/payments", data, {
                headers: {
                    Authorization:
                        `Bearer ${process.env.FLW_SECRET_KEY}`,
                    "Content-Type":
                        "application/json"
                }
            });
        return response.data;
    };





exports.verifyPayment =
    async (transactionId) => {


        const response =
            await axios.get(

                `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${process.env.FLW_SECRET_KEY}`

                    }

                });


        return response.data;


    };