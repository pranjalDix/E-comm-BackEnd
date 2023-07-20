const cookieToken=(user,res)=>{

    // this method is to genearate a cookie with a token generated when the user sign up
    const token=user.getJwtToken()

    const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_TIME*24*60*60*1000                // it will remain till 3 days
        ),
        httpOnly:true                                                       // this prevent client side/front end to have a access to a cookie
    }

    user.password=undefined                                                 // So that password is not visible in the below response 
    res.status(200).cookie('token',token,options).json({
        success:true,
        token,
        user
    })
}

module.exports=cookieToken