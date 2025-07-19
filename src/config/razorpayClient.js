const Razorpay = require('razorpay');
require("dotenv").config();


const razorpay = new Razorpay({
  key_id: process.env.API_KEY,
  key_secret: process.env.API_SECRET,
});

module.exports = razorpay