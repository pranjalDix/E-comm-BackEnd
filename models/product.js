const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const crypto=require('crypto')

const productSchema=mongoose.Schema({

    name:{
        type:String,
        required:[true,'Pleases provide Product Name'],
        trim:true,                                       // this is use to trim the extra space at the end 
        maxlength:[120,'Product name should not exceed 120 character']
    },
    price:{
        type:Number,
        required:[true,'Pleases provide Product Name'],
        maxlength:[5,'Product price should not exceed 5 ']
    },
    description:{
        type:String,
        required:[true,'Pleases provide Product Description'],
    },
    photos:[
        {
            id:{
                type:String,
                required:true,
            },
            secure_url:{
                type:String,
                required:true,
            }
        }
        
    ],
    stock:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:[true,'Pleases select category from - short-sleeves, long-sleeves,sweat-shirt,long-sleeves, hoodies'],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            message:'Please select category from the given option'             
        }
    },
    brand:{
        type:String,
        required:[true,'Pleases provide the brand Name '],
    },
    Averagerating:{
        type:Number,
        default:0,
    },
    numberOfReviews:{
        type:Number,
        default:0,
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',                // this is same as the mongoose.model('User',userSchema)
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            },
        }
    ],
    user:{                                   // toto find the user who has created a product 
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
})

module.exports=mongoose.model('Product',productSchema)


