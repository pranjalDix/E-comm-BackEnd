const app=require('./app')
const connectWithDb = require('./config/db')
require('dotenv').config()
const cloudinary=require('cloudinary');

//connect with Database
connectWithDb()

//cloudinart
cloudinary.config({
    cloud_name:"dsojdaybz",
    api_key:"652284453546932",
    api_secret:"GlC9HSJ-qW_5tuh8xSzU0dkjilo"
})


app.listen(process.env.PORT,()=>{
    console.log(`Server is runnig on port : ${process.env.PORT}`)
})