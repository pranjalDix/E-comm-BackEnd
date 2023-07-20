const express=require('express')
const router=express.Router()
const {createorder,getOrder,getLoggedInOrder,getLAllOrder,adminUpdateOrder,adminDeleteOrder}=require('../controllers/orderController')
const { isLoggedIn,customRole } = require('../middlewares/user')


router.route("/order/create").post(isLoggedIn,createorder)
router.route("/order/:id").get(isLoggedIn,getOrder)
// router.route("/order/myorder").get(isLoggedIn,getLoggedInOrder)         // this will create a problem in the route name
router.route("/myorder").get(isLoggedIn,getLoggedInOrder)

//admin

router.route("/admin/order").get(isLoggedIn,customRole('admin'),getLAllOrder)

router.route("/admin/update/order/:id").put(isLoggedIn,customRole('admin'),adminUpdateOrder)

router.route("/admin/delete/order/:id").delete(isLoggedIn,customRole('admin'),adminDeleteOrder)
module.exports=router