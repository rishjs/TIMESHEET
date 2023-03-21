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
    try{
      const {user_name,email_id}=req.body;
        //Check any field is empty
        if(!(user_name && email_id)){
          return response(res,"User_name or email_id is empty",400);
        }
        //Email validation and username
        let validEmailRegex = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})$/;
        if(!email_id.match(validEmailRegex) || (typeof user_name=="number"))
        {
          return response(res,"Invalid email_id or user_name",400);
        }
        //Existing User Check
        const exixtingUser=  data.find(
          (data) => {
            return data.email_id == email_id;
          }
        );
          if(exixtingUser){
            return response(res,"User Already Exists",400);
          }
          //User creation
          let index=uuidv4();//generating unique id for particular user
          const obj={//creating object for particular user
                user_id:index,
                user_name:user_name,
                email_id:email_id
          }
         data.push(obj);//adding the created object into existig array of objects
         await fs.promises.writeFile('./json/userJson.json', JSON.stringify(data, null, 2))//writing into json file
         response(res,"User Created Successfully",200,obj);  
    }catch(error){
      console.log(error)
      return response(res,"Something went wrong",500);
    }
}
//userLogin function
const userLogin=async(req,res)=>{
  try{
    const {email_id}=req.body;
     //Check email field is empty
     if(!email_id){
      return response(res,"email_id is empty",400);
    }
    //Existing User Check
    const exixtingUser=  data.find(
      (data) => {
        return data.email_id == email_id;
      }
    );
    if(!exixtingUser){
      return response(res,"User Not Found",401);
    }
    //remove existing user
    const removeExistingUser=data.filter(function(checkUser){
      return checkUser.email_id !== exixtingUser.email_id
    })
    //Generating otp
    const otp=otpGenerator.generate(6, { digits:true,upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets:false });
    const expireIn=new Date().getTime()+300*1000;
    exixtingUser['otp']=otp;//add otp field to existingUser
    exixtingUser['expireIn']=expireIn;//add expireIn field to existingUser
    removeExistingUser.push(exixtingUser);//adding the user with otp field
    await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
    response(res,"User Login Successfull",200, {
      user_id:exixtingUser.user_id,
      user_name:exixtingUser.user_name,
      email_id:exixtingUser.email_id,
      otp:exixtingUser.otp
    });
  }catch(error){
    console.log(error)
    return response(res,"Something went wrong",500);
  }
}
//verifyOtp function
const verifyOtp=async(req,res)=>{
  try{
    const {email_id,otp}=req.body;
     //Check any field is empty
   if(!email_id || !otp){
    return response(res,"email_id or otp field is empty",400);
  }
  //Existing User Check
  const exixtingUser= data.find(
    (data) => {
      return data.email_id == email_id;
    }
  );
  if(!exixtingUser){
    return response(res,"User Not Found",401);
  }
  //check expire date
  const currentTime=new Date().getTime();
  const diff=exixtingUser.expireIn-currentTime;
  if(diff<0){
    response(res,"Otp Expired",400);
  }else{
    if(exixtingUser.otp==otp)//otp check
    {
     const token=jwt.sign({id:exixtingUser.user_id},SECRET_KEY);//generate token
    //remove existing user
    const removeExistingUser=data.filter(function(checkUser){
    return checkUser.email_id !== exixtingUser.email_id;
    })
    exixtingUser['token']=token;//add token 
    removeExistingUser.push(exixtingUser);//adding the user with token field
    await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
    response(res,"Otp Verified",200, {user_id:exixtingUser.user_id,user_name:exixtingUser.user_name,email_id:exixtingUser.email_id,token:token});
    }else{
      response(res,"Otp doesnot Match",400);
    }
  }
  }catch(error){
    console.log(error)
    return response(res,"Something went wrong",500);
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
  if(exixtingUser){
    //remove existing user
    const removeExistingUser= data.filter(function(checkUser){
      return checkUser.user_id !== exixtingUser.user_id;
       })
       delete exixtingUser.token;//delete token field
       removeExistingUser.push(exixtingUser);//adding the user without token field
       await fs.promises.writeFile('./json/userJson.json', JSON.stringify(removeExistingUser, null, 2))
       response(res,"Logged out",200);
  }
  }catch(error){
    console.log(error);
    return response(res,"Something went wrong",500);
  }
}

//response function
function response(res,message,code,obj){
  return res.json({response_message:message,
                      response_status:code,
                    response_object:obj
                  });
 }

//exports the function
module.exports={userRegister,userLogin,verifyOtp,userLogout}