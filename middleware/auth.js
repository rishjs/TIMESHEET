//importing jsonwebtoken
const jwt=require('jsonwebtoken');

//import json file
const data=require('../json/userJson.json');

//secret key
const SECRET_KEY="Timesheet";

//auth function
const auth=(req,res,next)=>{
    try{
        let token=req.headers.authorization;
        const exixtingUser=  data.find(//token is present in json
            (data) => {
              return data.token == token;
            }
          );
        if(token && exixtingUser){//check token
            let user=jwt.verify(token,SECRET_KEY);//verifying token
            req.user_id=user.id;//assign user_id to req
        }else{
            return res.json({
                response_message:"Unauthorized User",
                response_status:"401"
            });
        }
        next();//control to next function
    }catch(error){
        res.json({
            response_message:"Unauthorized User",
            response_status:"401"
        });
    }
}

//exports the function
module.exports=auth;