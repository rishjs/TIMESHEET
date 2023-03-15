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
          response(res,"Issue_name is empty or invalid",400);
        }
        //check endDate is empty
        if(!endDate){
           let EndDate=moment().format("DD/MM/YYYY");
           if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
           {
            response(res,"Invalid date or time",400);
           }
            //create issue object
            obj=createObj(issue_name,startDate,EndDate,totalHours);
        }
        else{
          //date or time format validation
          if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(endDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
          {
            response(res,"Invalid date or time",400);
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
                     response(res,"Issue Already added",400);
                  }
                  else{//if issue not exist add 
                    //remove existing user
                    const removeExistingUser=data.filter(function(checkUser){
                    return checkUser.user_id !== req.user_id
                    })
                    exixtingUser.issues.push(obj);//add new issue
                    removeExistingUser.push(exixtingUser);//adding the user with new issue
                    await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(removeExistingUser, null, 2))//writing into file
                    response(res,"Issue Created",200,obj);
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
         response(res,"Issue is charged",200,issue);
        }
    }catch(error){
    console.log(error)
    response(res,"Something went wrong",500);
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
    //check issue_id and todaysSpentTime
    if(!issue_id || !todaysSpentTime || !(moment(todaysSpentTime, 'h:mm').isValid())){
      response(res,"Issue_id or todaysSpentTime is empty or invalid",400);
      }
    //Existing User Check
    const exixtingUser= data.find(
      (data) => {
        return data.user_id == req.user_id;
      }
    );
    if(exixtingUser)
    {
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
                  response(res,"Total Time has crossed 8 hours",200);
                }
                else{
                  response(res,"Issue is charged",200,exixtingIssue);
                }
          }
          else{
            response(res,"Issue doesnot exist",400);
          }
        }
        else{
          response(res,"Issue doesnot exist",400);
        }
    }catch(error){
      console.log(error);
      response(res,"Something went wrong",500);
    }
  }


//viewingIssue function
const viewIssues=async(req,res)=>{
  try{
    const {pageNo,issue_id}=req.body;
    if(pageNo && isNaN(pageNo)){
      response(res,"pageNo field invalid",400);
    }
    const exixtingUser= data.find(
      (data) => {
        return data.user_id == req.user_id;
      }
    );
    if(exixtingUser)
    {
            if(issue_id)
            {
                const exixtingIssue=  exixtingUser.issues.find(
                    (data) => {
                      return data.issue_id == issue_id;
                    }
                  );
                  if(exixtingIssue)
                  {
                    warningMessage(exixtingUser,exixtingIssue);
                    response(res,"Viewing only one specific Issue",200,exixtingIssue);
                  }
                  else{
                    response(res,"Issue doesnot exist",400);
                  }
            }
            else{
              let array=[];
              if(pageNo)
              {
                for(let i=((pageNo-1)*10);i<(pageNo*10);i++)
                {
                  if(exixtingUser.issues[i]==undefined)
                  {
                    break
                  }
                    warningMessage(exixtingUser,exixtingUser.issues[i]);
                    array.push(exixtingUser.issues[i]);
                }
                response(res,"Viewing Issues",200,array);
              }
              else{
                for(let i=0;i<10;i++)
                {
                    if(exixtingUser.issues[i]==undefined)
                    break
                    warningMessage(exixtingUser,exixtingUser.issues[i]);
                    array.push(exixtingUser.issues[i]);
                }
                response(res,"Viewing Issues",200,array);
              }
            }
    }
    else{
      response(res,"Issue doesnot exist",400);
    }
  }catch(error){
    console.log(error);
    response(res,"Something went wrong",500);
  }
}

async function warningMessage(exixtingUser,exixtingIssue){
   //remove existing user
   const removeExistingUser = data.filter(function(checkUser){
    return checkUser.user_id !== exixtingUser.user_id;
    })
    if(parseInt(exixtingIssue.spentTime)==0)
    {
      exixtingIssue['warningMessage']="Issue is not yet Charged";//add
    }
    else if(parseInt(exixtingIssue.perOfTaskCompleted)!=100 && (exixtingIssue.endDate<moment().format("DD/MM/YYYY")))
    {
      exixtingIssue['warningMessage']="Deadline has Crossed";//add
    }
    removeExistingUser.push(exixtingUser);//adding the user without token field
    await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(removeExistingUser, null, 2));
}

//response function
function response(res,message,code,obj){
  return res.json({response_message:message,
                      response_status:code,
                    response_object:obj
                  });
 }

//export the function
module.exports={createIssue,chargeTime,viewIssues};