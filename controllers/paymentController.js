const BigPromise=require('../middlewares/bigPromise')
const stripe = require('stripe')(process.env.STRIPE_SECRET);



exports.captureStripePayment=BigPromise(async (req,res,next)=>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',

        //optionals
        metadata:{integration_chexk:"accept_a_payment"}
        
      });

      res.status(200).json({
        sucess:true,
        amount:req.body.amount,
        client_secret:paymentIntent.client_secret,
        //you can opttionally saend a id from payment Intent
      })
})

exports.captureRazorpayPayment=BigPromise(async (req,res,next)=>{
    const amount=req.body.amount;

    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET })

    const myorder=await instance.orders.create({
    amount: amount*100,                              // convert enterd ruppe into  paisa
    currency: "INR",
    })

    res.status(200).json({
        success:true,
        amount,
        myorder

    })
})

exports.sendStripKey=BigPromise(async (req,res,next)=>{
    res.status(200).json({
        stripeKey:process.env.STRIPE_API_KEY
    })
})

exports.sendRazorpayKey=BigPromise(async (req,res,next)=>{
    res.status(200).json({
        stripeKey:process.env.RAZORPAY_API_KEY
    })
})