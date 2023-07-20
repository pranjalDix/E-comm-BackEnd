const Order=require('../models/order')
const Product=require('../models/product')
const BigPromise=require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')



exports.createorder=BigPromise(async(req,res,next)=>{
    const 
    {   shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shoppingAmount,
        totalAmount,
    }=req.body

   const order= await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shoppingAmount,
        totalAmount,
        user:req.user._id
    })

    res.status(200).json({
        success:true,
        order
    })
})

exports.getOrder=BigPromise(async(req,res,next)=>{
    
    const order=await Order.findById(req.params.id).populate('user','name email')
    if(!order){
        return next(new CustomError("Order does not exsist"),401)
    }

    res.staus(200).json({
        order
    })
})

exports.getLoggedInOrder=BigPromise(async(req,res,next)=>{

    const order=await Order.find({user:req.user._id})

    if(!order){
        return next(new CustomError("Order does not exsist"),401)
    }

    res.staus(200).json({
        order
    })
})

exports.getLAllOrder=BigPromise(async(req,res,next)=>{

    const order=await Order.find()

    res.staus(200).json({
        order
    })
})

exports.adminUpdateOrder=BigPromise(async(req,res,next)=>{

    const order=await Order.findById(req.params.id)

    if(order.orderStatus==="Delievered"){

        return next(new CustomError("POrder is already marked for delieveres"),401)
    }

    order.orderStatus=req.body.orderStatus
    
    order.orderItems.forEach(async pro => {
        await updateProductStock(pro.product,pro.quantity)
    });
    await order.save()
    res.staus(200).json({
        order
    })

    

    
})

async function updateProductStock(productId,quantity){

    const product= await Product.findById(productId)
    product.stock=product.stock-quantity

    await product.save({validateBeforeSave:false})

}

exports.adminDeleteOrder=BigPromise(async (req,res,next)=>{

    const order=await Order.findById(req.params.id)

    await order.remove()

    res.status(200).json({
        success:true
    })
})



