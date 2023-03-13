//importing express library
const express=require('express');

//importing from userRoutes.js
const userRoutes = require('./routes/userRoutes');

const issueRoutes = require('./routes/issueRoutes');

//creating an express object
const app=express();

//convert req body into json object
app.use(express.json());

//routing all user request 
app.use("/",userRoutes);

//routing all issue request 
app.use("/",issueRoutes);

//initiating the server
app.listen(7000,()=>{
    console.log("Server started at port 7000");
})