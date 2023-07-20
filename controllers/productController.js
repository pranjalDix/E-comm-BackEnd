const BigPromise=require('../middlewares/bigPromise')
const Product=require('../models/product')
const CustomError=require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileupload=require('express-fileupload')
const cloudinary=require('cloudinary')
const mailHelper = require('../utils/emailService')
const crypto=require('crypto')
const whereClause = require('../utils/whereClause')


exports.addProduct=BigPromise(async (req,res,next)=>{
    // const db=await something

    //images
    let imageArray=[]

    if(!req.files){

        return next(new CustomError('Images are required',401))
    }

    if(req.files){

        for(let index=0;index<req.files.photos.length;index++){
            const result=await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{

                folder:"Products"
            })

            imageArray.push({
                id: result.public_id,
                secure_url:result.secure_url
            })
        }
    }

    req.body.photos=imageArray           // we are rewriting it whatever you are sending in the boody as photos 

    req.body.user=req.user.id        // As the user is already logged in to add a product

    const product=await Product.create(req.body)
     res.status(200).json({
         success:true,
         product
     })
 })

 //this is a very good route
 exports.getAllProduct=BigPromise(async(req,res,next)=>{

    const resPerPage=6;

    const countProduct=await Product.countDocuments()         // count the number of products present 

    const productsObj= new whereClause(Product.find(),req.query)
    .search().filter()
   

    let products=await productsObj.base.clone()                 // clone is necessay because we are implementing multiple Queries....
    const filteredProductNumber=products.length

    //products.limit().skip()        we can do it directly
    productsObj.pager(resPerPage)

    products=await productsObj.base.clone()


    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        countProduct
    })
 })

 exports.adminGetAllProduct=BigPromise(async(req,res,next)=>{

    const product=await Product.find()

    res.status(200).json({
        success:true,
        product
    })
 })

 //getOneProduct based on id
 exports.getSingleProduct=BigPromise(async(req,res,next)=>{

    const id=req.params.id;
    const product=await Product.findById(id);

    if(!product){

        return next(new CustomError("This Product does not exsist",400))
    }

    res.status(200).json({
        success:true,
        product
    })
 })

 exports.adminupdateSingleProduct=BigPromise(async(req,res,next)=>{

    const product=await Product.findById(req.params.id)

    if(!product){
        return next(new CustomError("Product does not exsis",401));

    }
    let imageArray=[]

    if(req.files){
        //destroy the exsisting images
        for(let index=0;index<product.photos.length;index++){

            await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }

        //upload and save images
        for(let index=0;index<req.files.photos.length;index++){
            const result=await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{

                folder:"products"
            })

            imageArray.push({
                id: result.public_id,
                secure_url:result.secure_url
            })
        }

        req.body.photos=imageArray
    }

    const Updatedproduct=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,                                         // I get the response as a new Product
        runValidators:true,
        useFindAndModify:false                 
        
    })

    res.status(200).json({
        success:true,
        Updatedproduct
    })


 })

 exports.adminDeleteSingleProduct=BigPromise(async(req,res,next)=>{

    const product=await Product.findById(req.params.id)

    if(!product){
        return next(new CustomError("Product does not exsis",401));

    }
   
    //destroy the exsisting images
    for(let index=0;index<product.photos.length;index++){

        await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }


    await product.remove()

    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })


 })

 exports.addReview=BigPromise(async(req,res,next)=>{

    const {rating,comment,productId}=req.body

    const review={

        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product=await Product.findById(productId);

    const AlreadyReview=product.reviews.find(
        (rev)=>rev.user.toString() === req.user._id.toString()               // aS REQ.USER._ID is a Bson object so to compare it we must first convert it into the String
    )

    // If the review already exsisit of the particular product by the same user 
    if(AlreadyReview){

        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString()){
                rev.comment=comment
                rev.rating=rating
            }
        });

    }else{
        product.reviews.push(review)
        product.numberOfReviews=product.reviews.length
    }

    // update the average rating
    let totalRating=0;
    product.reviews.forEach(rev=>{
        totalRating+=rev.rating
    })
    if(product.review.length!=0)
        totalRating=totalRating/product.reviews.length
    product.Averagerating=totalRating


    await product.save({
        validateBeforeSave:false
    })

    res.status(200).json({
        success:true
    })
 })

 exports.deleteReview=BigPromise(async(req,res,next)=>{

    const {productId}=req.query.productId
    const product=await Product.findById(productId);

    const reviews=product.reviews.filter(
        (rev)=>rev.user.toString() !== req.user._id.toString()
    )

    product.numberOfReviews=reviews.length

    let avg=0;

    reviews.forEach(
        (rev)=>avg=avg+rev.rating

    )
    if(reviews.length!=0)
        avg=avg/reviews.length;
    
    product.Averagerating=avg

    //update the product 

    await Product.findByIdAndUpdate(productId,{
        reviews,
        Averagerating,
        numberOfReviews
    },{
        new:true, 
        runValidators:true,
        useFindAndModify:false
    })

    

   
    res.status(200).json({
        success:true
    })
 })

 exports.getOnlyReviewsForOneProduct=BigPromise(async (req,res,next)=>{
    const product=await Product.findById(req.query.id);

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
 })

 


 