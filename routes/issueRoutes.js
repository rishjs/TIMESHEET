//importing express library
const express=require('express');
const { createIssue } = require('../controllers/issueController');
const auth = require('../middleware/auth');

//creating an express object
const issueRoutes=express.Router();

//post request for creating issue
issueRoutes.post("/createIssue",auth,createIssue);

//exporting the object
module.exports=issueRoutes;