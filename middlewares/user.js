const User=require('../models/user')
const BigPromise=require('../middlewares/bigPromise')
const CustomError=require('../utils/customError')
const jwt=require('jsonwebtoken')

//this middleware is to check whether the user is sign in or not and to inject information as req.user ..........

exports.isLoggedIn=BigPromise(async (req,res,next)=>{

    const token= req.cookies.token  ||req.header('Authorization').replace('Bearer ','') 
    
    if(!token){
        return res.status(403).send("Token is Missing")
    }

    try {
        const decode=jwt.verify(token,process.env.JWT_SECRET)
        console.log(decode)             // here we get all the payload information in the form of json

        req.user=await User.findById(decode.id)          // INJECTING MY PROPERTY AS REQ.COOKIE AND MANY OTHER`
        //const user1=await User.find({role:'user'}).find({name:"Arpit Kumar Gajya"}).clone()
        //console.log("USER 1************************")
       // console.log(user1)
        console.log(req.user)
        //bring in info from db


    } catch (error) {
        return res.status(401).send("Invalid Token")
    }

    return next();
})

// to xheck whether the useer has the role of admin or not
exports.customRole=(role)=>BigPromise(async(req,res,next)=>{
    
    if(req.user.role!==role){
        
        return next(new CustomError("yOU ARE NOT ALLOWED FOR THE FOLLOWING RESOURCES",400))
    }
    next();
})
