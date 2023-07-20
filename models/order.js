const mongoose=require('mongoose');


const orderSchema=mongoose.Schema({

    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        phoneNo:{
            type:String,
            required:true
        },
        postalCode:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },

    orderItems:[
        {
            name:{
                type:String,
                required:true,
            },
            quantity:{
                type:Number,
                required:true,
            },
            image:{
                type:String,
                required:true,
            },
            prize:{
                type:Number,
                required:true,
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'Product',
                required:true
            },
        }
    ],

    paymentInfo:{
        id:{
            type:String
        }
    },
    taxAmount:{
        type:Number,
        required:true
    },
    shoppingAmount:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    orderStatus:{
        type:String,
        default:'processing',
        required:true
    },
    delieveredAt:{
        type:Date
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }

})

module.exports=mongoose.model('Order',orderSchema)