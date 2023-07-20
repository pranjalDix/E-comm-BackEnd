const User=require('../models/user')
const BigPromise=require('../middlewares/bigPromise')
const CustomError=require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileupload=require('express-fileupload')
const cloudinary=require('cloudinary')
const mailHelper = require('../utils/emailService')
const crypto=require('crypto')

exports.signup=BigPromise(async(req,res,next)=>{

    let result;
    // console.log(req.body.email)

    if(!req.files){
        return next(new CustomError("Plz upload the profile image of the user",400))
    }

    const {name,email,password}=req.body

    if(!email || !name || !password){
        // return next(new CustomError('Plz Send Email',400))
        return next(new Error("Name ,email and password are required"))
    }


    if(req.files){
        let file=req.files.photo
        // console.log("fbhbfhbb")
        // console.log(file)
        result=await cloudinary.uploader.upload(file.tempFilePath,{
            folder:"user1"
        })

        console.log(result)
    }

    
   

    const user=await User.create({
        name,
        email,
        password,
        photo:{
            id:result.public_id,
            secure_url:result.secure_url
        }
    })

    //method to generte a cookie with the token generated with the expiry date ...........................

    cookieToken(user,res)
    
})

exports.login=BigPromise(async(req,res,next)=>{

    const {email,password}=req.body;

    //check for email and password
    if(!email||!password)
    {
        return next(new CustomError('please provide the email and password',400));
    }

    const user=await User.findOne({email}).select("+password")                      // We have mentioned the select field as false in the User Schema so we want to return it explicitly.....

    if(!user){
        return next(new CustomError('you are not registerd in the database',400));
    }

    const isPasswordCorrect=await user.isValidatedPassword(password)
    if(!isPasswordCorrect){
        return next(new CustomError('Password entered is wrong',400));
    }

    cookieToken(user,res)


})

exports.logout=BigPromise(async(req,res,next)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message:"Logout Successfully"
    })
})

exports.forgetPassword=BigPromise(async(req,res,next)=>{
    const {email}=req.body;

    const user =await User.findOne({email})

    if(!user){
        return next(new CustomError('User is not registered in the database',400))
    }

    const forgotToken=user.getForgotPasswordToken()
    res.send(forgotToken)
    //saving the token in the databse and mentioning validate as false so it does not create any error further by saving 
    user.save({validateBeforeSave:false})

    //crafting url http://localhost:4000/api/v1/password/reset/:token

    const myurl=`${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`;

    const message=`copy paste this link in your URL and hit enter \n\n ${myurl}`

    try {
        await mailHelper({
            email:user.email,
            subject:"Password Resert Email ",
            message:message
        })

        res.status(200).json({
            success:true,
            message:"Email send successfully"
        })
    } catch (error) {
        // when the error occur in sending email we have to remove thid field from the user and save back again in the database
        user.forgotPasswordToken=undefined
        user.forgotPasswordExpiry=undefined
        await user.save({validateBeforeSave:false})

        return next(new CustomError(error.message,500))
    }
})

exports.passwordReset=BigPromise(async(req,res,next)=>{
    
    const token=req.params.token

    //In the databse it is stored as a hash so we have to encryp it as we have done in the User Model using crypto and then compare the token send in the url with that of the url stored in the databse 
    console.log("token "+token)
    const encryptToken=crypto.createHash("sha256").update(token).digest('hex') 
    console.log("encrypt token "+encryptToken)
    const user=await User.findOne({
        encryptToken,
        forgotPasswordExpiry:{$gt:Date.now()}                    // expiry is not over 
    })

    if(!user){
        return next(new CustomError("Token is invalid or expired",400))
    }

    if(req.body.password!=req.body.confirmPassword){
        return next(new CustomError("Password and ConfirmPassword are not same ",400))
    }

    user.password=req.body.password
    await user.save()

    // *************************************AS THE FUNCTION OF FORGOT PASSWORD TOKEN IS OVER SO WE MUST RESET THE FIELD
    user.forgotPasswordToken=undefined
    user.forgotPasswordExpiry=undefined

    //SEND A JSON RESPONSE OR SEND A TOKEN
    cookieToken(user,res)

})

exports.getLoggedInUserDetails=BigPromise(async(req,res,next)=>{

    const user=await User.findById(req.user.id)              // req.user is the property crated in the middleware user.js

    res.status(200).json({
        success:true,
        user,
    })
})

exports.changePassword=BigPromise(async(req,res,next)=>{

    const user=await User.findById(req.user.id).select("+password")              // req.user is the property crated in the middleware user.js

    const isCorrectPassword=await user.isValidatedPassword(req.body.oldpassword)

    if(!isCorrectPassword){
        return next(new CustomError('old password is incorrect',500));
    }

    user.password=req.body.newpassword

    await user.save()

    //update the token as well because the information got changed
    cookieToken(user,res);
})

exports.updateUserDetails=BigPromise(async(req,res,next)=>{

    const newData={
        name:req.body.name,
        email:req.body.email
    }

    if(req.files){

        const user= await User.findById(req.user.id)

        const imageId=user.photo.id

        const resp=await cloudinary.v2.uploader.destroy(imageId)             // deleting the image from the cloudinary

        //upload the new photo
        const result=await cloudinary.uploader.upload(req.files.photo.tempFilePath,{
            folder:"user1"
        })

        newData.photo={
            id:result.public_id,
            secure_url:result.secure_url
        }


    }
    const user=await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        user
    })

    //update the token as well because the information got changed
    
})

//admin route

exports.adminAllUser=BigPromise(async (req,res,next)=>{

    const user=await User.find()

    res.status(200).json({
        success:true,
        user
    })
})

// the manager will get the data of the user except admin and manager
exports.managerAllUser=BigPromise(async (req,res,next)=>{

    const user=await User.find({role:'user'})

    res.status(200).json({
        success:true,
        user
    })
})

//admin  can retrieve the single User
exports.adminSingleUser=BigPromise(async (req,res,next)=>{

    const id=req.params.id
    const user=await User.findById(id)

    if(!user){
        return next(new CustomError("User Does not exsist",201))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//admin can update a single user
exports.adminUpdateSingleUserDetails=BigPromise(async (req,res,next)=>{

    
    const newData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    
    const user=await User.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        user
    })
    
})

exports.adminDeleteSingleUserDetails=BigPromise(async (req,res,next)=>{

    const id=req.params.id;

    const user=User.findById(id)
    
    if(!user){
        return next(new CustomError("No such User found",401));
    }

    
    if(user.photo)
        await cloudinary.uploader.destroy(user.photo.id)

    await user.remove()

    res.status(200).json({
        success:true,
       
    })
    
})