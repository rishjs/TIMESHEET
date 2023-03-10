//import json file
const data=require('../json/userJson.json');
//importing uuid package
const { v4: uuidv4 } = require('uuid');
//import FileSystem library
const fs=require('fs');
//import otp library
const otpGenerator = require('otp-generator')
//importing jwt library
const jwt=require("jsonwebtoken");
//secret key
const SECRET_KEY="Timesheet";
//userRegister function
const userRegister=async(req,res)=>{
    const {user_name,email_id}=req.body;
    try{
        //Check any of the field is empty
        if(!(user_name && email_id)){
          return res.json({response_message:"User_name or email_id is empty",
          response_status:"400"});
        }
        //Email validation and username
        let validEmailRegex = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})$/;
        if(!email_id.match(validEmailRegex) || (typeof user_name=="number"))
        {
          return res.json({response_message:"Invalid email_id or user_name",
                          response_status:"400"});
        }
        //Existing User Check
        const exixtingUser=  data.find(
          (data) => {
            return data.email_id == email_id;
          }
        );
          if(exixtingUser){
            return res.json({response_message:"User Already Exists",
                            response_status:"400"});
          }
          //User creation
          let index=uuidv4();//generating unique id for particular user
          const obj={//creating object for particular user
                user_id:index,
                user_name:user_name,
                email_id:email_id
          }
         data.push(obj);//adding the created object into existig array of objects
         await fs.promises.writeFile('./json/userJson.json', JSON.stringify(data, null, 2))
            res.json({
              response_message: "User Created Successfully",
              response_status: "200",
              response_object: obj
            })
          
    }catch(error){
      console.log(error)
      return res.json({
        response_message:"Something went wrong",
        response_status:"500"
    })
    }
}
//userLogin function
const userLogin=async(req,res)=>{
  const {email_id}=req.body;
  try{
     //Check email field is empty
     if(!email_id){
      return res.json({response_message:"email_id is empty",
      response_status:"400"});
    }
    //Existing User Check
    const exixtingUser=  data.find(
      (data) => {
        return data.email_id == email_id;
      }
    );
    if(!exixtingUser){
      return res.json({response_message:"User Not Found",
                      response_status:"401"});
    }
    //remove existing user
    const removeExistingUser=data.filter(function(checkUser){
      return checkUser.email_id !== exixtingUser.email_id
    })
    //Generating tokens
    const otp=otpGenerator.generate(6, { digits:true,upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });
    const expireIn=new Date().getTime()+300*1000;
    exixtingUser['otp']=otp;//add otp field to existingUser
    exixtingUser['expireIn']=expireIn;//add expireIn field to existingUser
    removeExistingUser.push(exixtingUser);//adding the user with otp field
    await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
      res.json({
        response_message: "User Login Successfull",
        response_status: "200",
        response_object: {
          user_id:exixtingUser.user_id,
          user_name:exixtingUser.user_name,
          email_id:exixtingUser.email_id,
          otp:exixtingUser.otp
        }
      });
  }catch(error){
    console.log(error)
    return res.json({
      response_message:"Something went wrong",
      response_status:"500"
  })
  }
}
//verifyOtp function
const verifyOtp=async(req,res)=>{
  const {email_id,otp}=req.body;
  try{
     //Check any of the field is empty
   if(!email_id || !otp){
    return res.json({response_message:"email_id or otp field is empty",
    response_status:"400"});
  }
  //Existing User Check
  const exixtingUser= data.find(
    (data) => {
      return data.email_id == email_id;
    }
  );
  if(!exixtingUser){
    return res.json({response_message:"User Not Found",
                    response_status:"401"});
  }
  //check expire date
  const currentTime=new Date().getTime();
  const diff=exixtingUser.expireIn-currentTime;
  if(diff<0){
    res.json({
      response_message:"Otp Expired",
      response_status:"400"
  })
  }else{
    if(exixtingUser.otp==otp)//otp check
    {
     const token=jwt.sign({id:exixtingUser.user_id},SECRET_KEY);
    //remove existing user
    const removeExistingUser=data.filter(function(checkUser){
    return checkUser.email_id !== exixtingUser.email_id;
    })
    exixtingUser['token']=token;//add token 
    removeExistingUser.push(exixtingUser);//adding the user with token field
    await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
      res.json({
        response_message: "Otp Verified",
        response_status: "200",
        response_object: {user_id:exixtingUser.user_id,user_name:exixtingUser.user_name,email_id:exixtingUser.email_id,token:token}
      })
    }else{
      res.json({
        response_message:"Otp doesnot Match",
        response_status:"400"
      })
    }
  }
  }catch(error){
    console.log(error)
    return res.json({
      response_message:"Something went wrong",
      response_status:"500"
  })
  }
}

//userLogout function
const userLogout=async(req,res)=>{
  try{
  //Existing User Check
  const exixtingUser= data.find(
    (data) => {
      return data.user_id == req.user_id;
    }
  );
  if(!exixtingUser){
    return res.json({response_message:"Unauthorized User",
                    response_status:"401"});
  }
   //remove existing user
   const removeExistingUser= data.filter(function(checkUser){
    return checkUser.user_id !== exixtingUser.user_id;
     })
     delete exixtingUser.token;//delete token field
     removeExistingUser.push(exixtingUser);//adding the user without token field
     await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
       res.json({
         response_message: "Logged out",
         response_status: "200"
       })
  }catch(error){
    console.log(error);
    return res.json({response_message:"Something went wrong",
                    response_status:"500"});
  }
}

//exports the function
module.exports={userRegister,userLogin,verifyOtp,userLogout}