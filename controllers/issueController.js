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
      let obj;
      const {issue_name,startDate,endDate,totalHours}=req.body;
        //Check issue_name is empty or invalid
        if(!issue_name || typeof issue_name=="number"){
          return res.json({response_message:"Issue_name is empty or invalid",
          response_status:"400"});
        }
        //check endDate is empty
        if(!endDate){
           let EndDate=moment().format("DD/MM/YYYY");
           if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
           {
               return res.json({response_message:"Invalid date or time1",
               response_status:"400"});
           }
            //create issue object
            obj=createObj(issue_name,startDate,EndDate,totalHours);
        }
        else{
          //date or time format validation
          if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(endDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
          {
              return res.json({response_message:"Invalid date or time",
              response_status:"400"});
          }
           //create issue object
           obj=createObj(issue_name,startDate,endDate,totalHours);
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
                        response_object: obj
                        }) 
                  }
            }
            else{
          //User creation
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
    totalHours:totalHours,
    spentTime:"0"
}
}

//chargeTime function
const chargeTime=async(req,res)=>{
    try{
    const {issue_id,todaysSpentTime,perOfTaskCompleted}=req.body;
    //check issue-id and todaysSpentTime
    if(!issue_id || !todaysSpentTime || !(moment(todaysSpentTime, 'h:mm').isValid())){
        return res.json({response_message:"Issue_id or todaysSpentTime is empty or invalid",
        response_status:"400"
      });
      }
    //Existing User Check
    const exixtingUser= data.find(
      (data) => {
        return data.user_id == req.user_id;
      }
    );
        const exixtingIssue=  exixtingUser.issues.find(
            (data) => {
              return data.issue_id == issue_id;
            }
          );
          if(exixtingIssue)
          {
                //remove existing user
                const removeExistingUser = data.filter(function(checkUser){
                return checkUser.user_id !== exixtingUser.user_id;
                })
                exixtingIssue['spentTime']=parseInt(todaysSpentTime)+parseInt(exixtingIssue.spentTime);//add spentTime
                exixtingIssue['perOfTaskCompleted']=perOfTaskCompleted;//add
                removeExistingUser.push(exixtingUser);//adding the user without token field
                await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(removeExistingUser, null, 2));
                if(parseInt(exixtingIssue.spentTime)>8)
                {
                   return res.json({
                    response_message:"Total time has crossed 8 hours.",
                    response_status:"400"
                })
                }
                else{
                  res.json({
                    response_message: "Issue is charged",
                    response_status: "200",
                    response_object:exixtingIssue
                })
                }
          }
          else{
            res.json({
              response_message:"Issue doesnot exist",
              response_status:"400"
          })
          }
    }catch(error){
      console.log(error);
      return res.json({response_message:"Something went wrong",
                      response_status:"500"});
    }
  }
//export the function
module.exports={createIssue,chargeTime};