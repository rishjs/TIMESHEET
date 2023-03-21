//importing express library
const express=require('express');

//importing from userControllers.js
const { userRegister, userLogin ,verifyOtp, userLogout} = require('../controllers/userController');

//importing auth function
const auth = require('../middleware/auth');

//creating an express object
const userRoutes=express.Router();

userRoutes.get("*",(req,res)=>{console.log("h")});

//post request for user register
userRoutes.post("/userRegister",userRegister);

//post request for user login
userRoutes.post("/userLogin",userLogin);

//post request for verify otp
userRoutes.post("/verifyOtp",verifyOtp);

//get request for user logout
userRoutes.post("/userLogout",auth,userLogout);


//exporting the object
module.exports=userRoutes;



