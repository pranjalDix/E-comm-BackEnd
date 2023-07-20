const express=require('express')
const router=express.Router()
const {sendStripKey,sendRazorpayKey,captureStripePayment,captureRazorpayPayment}=require('../controllers/paymentController')
const { isLoggedIn,customRole } = require('../middlewares/user')

router.route("/stripekey").get(isLoggedIn,sendStripKey);

router.route('/razorpaykey').get(isLoggedIn,sendRazorpayKey)

router.route("/capturestripe").post(isLoggedIn,captureStripePayment)

router.route("/capturerazorpay").post(isLoggedIn,captureRazorpayPayment)

module.exports=router