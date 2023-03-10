//importing express library
const express=require('express');

//creating an express object
const issueRoutes=express.Router();


issueRoutes.get("/createIssue",()=>{console.log("hai")});

//exporting the object
module.exports=issueRoutes;