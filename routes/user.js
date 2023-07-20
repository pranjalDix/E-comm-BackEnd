const express=require('express')
const router=express.Router()
const {signup,login,logout,forgetPassword,passwordReset,getLoggedInUserDetails,changePassword,updateUserDetails,adminAllUser,managerAllUser,adminSingleUser,adminUpdateSingleUserDetails,adminDeleteSingleUserDetails}=require('../controllers/userController')
const { isLoggedIn,customRole } = require('../middlewares/user')


router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotPassword').post(forgetPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn,getLoggedInUserDetails)
router.route('/password/update').post(isLoggedIn,changePassword)
router.route('/userdashboard/update').post(isLoggedIn,updateUserDetails)

//admion route

router.route('/admin/users').get(isLoggedIn,customRole('admin'),adminAllUser)
//manager only routes
router.route('/manager/users').get(isLoggedIn,customRole('manager'),managerAllUser)

//admin can extract single user
router.route('/admin/user/:id').get(isLoggedIn,customRole('admin'),adminSingleUser)

//admin can update the single user
router.route('/admin/update/user/:id').put(isLoggedIn,customRole('admin'),adminUpdateSingleUserDetails)

router.route('/admin/delete/user/:id').delete(isLoggedIn,customRole('admin'),adminDeleteSingleUserDetails)


module.exports=router;