//importing moment package
let moment=require('moment');

//import json file
const data=require('../json/issueJson.json');

//import FileSystem library
const fs=require('fs');

//importing uuid package
const { v4: uuidv4 } = require('uuid');

//createIssue function
const createIssue=async(req,res)=>{
    try{
      const {issue_name,startDate,endDate,totalHours}=req.body;
        //Check issue_name is empty or invalid
        if(!issue_name || typeof issue_name=="number"){
          return res.json({response_message:"Issue_name is empty or invalid",
          response_status:"400"});
        }
        //date or time format validation
        if(!(moment(startDate, 'DD-MM-YYYY').isValid() && moment(endDate, 'DD-MM-YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
        {
            return res.json({response_message:"Invalid date or time",
            response_status:"400"});
        }
        //Existing User Check
        const exixtingUser=  data.find(
            (data) => {
              return data.user_id == req.user_id;
            }
          );
            if(exixtingUser){
                const exixtingIssue=  exixtingUser.issues.find(
                    (data) => {
                      return data.issue_name == issue_name;
                    }
                  );
                  if(exixtingIssue)//check issue exist or not
                  {
                    return res.json({response_message:"Issue Already added",
                    response_status:"400"});
                  }
                  else{//if issue not exist add 
                     //create issue object
                     const obj=createObj(issue_name,startDate,endDate,totalHours);
                    //remove existing user
                    const removeExistingUser=data.filter(function(checkUser){
                    return checkUser.user_id !== req.user_id
                    })
                    exixtingUser.issues.push(obj);//add new issue
                    removeExistingUser.push(exixtingUser);//adding the user with new issue
                    await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(removeExistingUser, null, 2))//writing into file
                    res.json({
                        response_message: "Issue Created",
                        response_status: "200",
                        response_object: exixtingUser
                        }) 
                  }
            }
            else{
          //User creation
          createObj(issue_name,startDate,endDate,totalHours);//create issue object
          const issue={
            user_id:req.user_id,
            issues:[obj]
          }
         data.push(issue);//adding the created object into existig array of objects
         await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(data, null, 2))//writing into file
         res.json({
            response_message: "Issue Created",
            response_status: "200",
            response_object: issue
            }) 
        }
    }catch(error){
    console.log(error)
      return res.json({
         response_message:"Something went wrong",
         response_status:"500"
     })
     }
}
function createObj(issue_name,startDate,endDate,totalHours)
{
let index=uuidv4();//generating unique issue_id for particular user
return obj={//creating issue object for particular user
    issue_id  :index,
    issue_name:issue_name,
    startDate:startDate,
    endDate:endDate,
    totalHours:totalHours
}
}

//export the function
module.exports={createIssue};