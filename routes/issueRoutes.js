//importing express library
const express=require('express');

//importing from userControllers.js
const { createIssue, chargeTime } = require('../controllers/issueController');

//importing auth function
const auth = require('../middleware/auth');

//creating an express object
const issueRoutes=express.Router();

//post request for creating issue
issueRoutes.post("/createIssue",auth,createIssue);

//post request for chargeTime
issueRoutes.post("/chargeTime",auth,chargeTime);

//exporting the object
module.exports=issueRoutes;