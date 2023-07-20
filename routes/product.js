const express=require('express')
const router=express.Router()
const {addProduct,getAllProduct,adminGetAllProduct,getSingleProduct,adminupdateSingleProduct,adminDeleteSingleProduct,addReview,deleteReview,getOnlyReviewsForOneProduct}=require('../controllers/productController')
const { isLoggedIn,customRole } = require('../middlewares/user')

//user routes 
router.route("/product").get(getAllProduct);

router.route("/review").put(isLoggedIn,addReview)                 //we are not creating anything new so not post // because we are not changing the whole product model

router.route("/review").delete(isLoggedIn,deleteReview)

router.route("/reviews").get(getOnlyReviewsForOneProduct)

//admin routes 
router.route("/admin/product/add").post(isLoggedIn,customRole('admin'),addProduct);

router.route("/admin/products").get(isLoggedIn,customRole('admin'),adminGetAllProduct)

router.route("/product/:id").get(getSingleProduct)

router.route("/admin/update/product/:id").post(isLoggedIn,customRole('admin'),adminupdateSingleProduct)

router.route("/admin/delete/product/:id").delete(isLoggedIn,customRole('admin'),adminDeleteSingleProduct)

module.exports=router