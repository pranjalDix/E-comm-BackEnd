const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Provide a name'],               // The error message is also passed
        maxlength:[40,'Name should be under 40 characters']
    },
    email:{
        type:String,
        required:[true,'Please Provide a email'],               
        validate:[validator.isEmail,'Please enter a valid email'],               
        unique:true                                             // The mongoose will automatically look in the database for unique email
    },
    password:{
        type:String,
        required:[true,'Please Provide a password'],               
        minlength:[6,'password should be at least 6 char'],
        select:false                                            // the password field not comes in with the UserSchema
    },
    role:{
        type:String,
        default:'user'                                           
    },
    photo:{
        id:{
            type:String,
            //required:true
        } ,
        secure_url:{
            type:String,
            //required:true
        }                                           
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:String,
    createdAt:{
        type:Date,
        default:Date.now()
    },

})

//encrypt password before save  - HOOKS    before saving perform this method
userSchema.pre('save',async function(next){

    if(!this.isModified('password')) return next();                    // by this method we specify then whenever we modify the password then only we have to encrypt it
    this.password=await bcrypt.hash(this.password,10)
})

//validate the password with passed on user password 
userSchema.methods.isValidatedPassword=async function(usersendPassword){
    return await bcrypt.compare(usersendPassword,this.password)                // this will return true /false result
}

//create and return jwt token

userSchema.methods.getJwtToken=function(){
   return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY
    })
}

//genearate forgot password token(this is basically a String)
userSchema.methods.getForgotPasswordToken=function(){
    //genearate a long random String
    const forgotToken =crypto.randomBytes(20)
   // console.log(forgotToken)
    // getting a hash - make sure to get a hash at the backend 
    const temp=forgotToken;
    this.forgotPasswordToken=crypto.createHash("sha256").update(forgotToken).digest('hex')                //In the database it is stored in hash but we return to the user the String  then during the forget password process when the user send the token again then before comparing in with databse we have o use this function
    console.log("model "+this.forgotPasswordToken)
    //time of token
    this.forgotPasswordExpiry=Date.now()+20*60*1000            //20 min

    return temp

}

module.exports=mongoose.model('User',userSchema)

