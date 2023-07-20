const BigPromise=require('../middlewares/bigPromise')

exports.home=BigPromise(async (req,res)=>{
   // const db=await something
    res.status(200).json({
        success:true,
        greeting:"Hello from api"
    })
})

//doing witouth big promise
exports.homeDummy=async (req,res)=>{

    try {
        // const db=await something
        res.status(200).json({
            success:true,
            greeting:"This is anothe Dummy route"
        })
    } catch (error) {
        console.log(error)
    }
   
}
