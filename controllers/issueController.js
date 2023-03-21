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
        if(!issue_name || !startDate || !endDate || !totalHours || typeof issue_name=="number"){
          return response(res,"Fields are empty or invalid",400);
        }
        //check endDate is empty
        if(!endDate){
           let EndDate=moment().format("DD/MM/YYYY");//current date
           if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
           {
            return response(res,"Invalid date or time",400);
           }
            //create issue object
            obj=createObj(issue_name,startDate,EndDate,totalHours);
        }
        else{
          //date or time format validation
          if(!(moment(startDate, 'DD/MM/YYYY').isValid() && moment(endDate, 'DD/MM/YYYY').isValid() && moment(totalHours, 'h:mm').isValid()))
          {
            return response(res,"Invalid date or time",400);
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
                     return response(res,"Issue Already added",400);
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
         response(res,"Issue created",200,issue);
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
    spentTime:"00:00"
}
}

//chargeTime function
const chargeTime=async(req,res)=>{
    try{
    const {issue_id,todaysSpentTime,perOfTaskCompleted}=req.body;
    //check issue_id and todaysSpentTime
    if(!issue_id || !todaysSpentTime || !(moment(todaysSpentTime, 'h:mm').isValid())){
      return response(res,"Issue_id or todaysSpentTime is empty or invalid",400);
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
                let splitTime= (exixtingIssue.spentTime).split(":");//split spentTime into hour and minutes
                let splitTime1=todaysSpentTime.split(":");// todaySpentTime into hour and minutes
                let timeToSeconds =  (splitTime[0]) * 60 * 60 + (splitTime[1]) * 60 ;//convert into seconds
                let timeToSeconds1 =  (splitTime1[0]) * 60 * 60 + (splitTime1[1]) * 60 ;
                let seconds=timeToSeconds+timeToSeconds1;//add seconds
                var hoursLeft = Math.floor( seconds / 3600 );//convert into time
                var min = Math.floor(( seconds - hoursLeft * 3600 ) / 60 );
                let time1=hoursLeft+":"+min;
                exixtingIssue['spentTime']=time1;
                exixtingIssue['perOfTaskCompleted']=perOfTaskCompleted;
                removeExistingUser.push(exixtingUser);
                await fs.promises.writeFile('./json/issueJson.json', JSON.stringify(removeExistingUser, null, 2));
                if(parseInt(exixtingIssue.spentTime)>8)
                {
                  warningMessage(exixtingUser,exixtingIssue);
                  response(res,"Spent Time has crossed 8 hours",200);
                }
                else{
                  warningMessage(exixtingUser,exixtingIssue);
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
    //check pageNo field is valid or not
    if(pageNo && isNaN(pageNo)){
      return response(res,"pageNo field invalid",400);
    }
    //exixting user check
    const exixtingUser= data.find(
      (data) => {
        return data.user_id == req.user_id;
      }
    );
    if(exixtingUser)
    {
            if(issue_id)//if issue_id is present
            {
                const exixtingIssue=  exixtingUser.issues.find(//search issue_id
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
            else{//if issue_id is not given
              let array=[];
              if(pageNo)//if pageNo is present
              {
                for(let i=((pageNo-1)*10);i<(pageNo*10);i++)//paginate the issues
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
              else{//default view 10 issues
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
    if(parseInt(exixtingIssue.spentTime)==0)//if issue not yet charged
    {
      exixtingIssue['warningMessage']="Issue is not yet Charged";
    }

    else if(!(parseInt(exixtingIssue.perOfTaskCompleted)==100))//if issue not completed
    {
      let array=exixtingIssue.endDate.split("/");
      if(new Date(Date.UTC(array[2],array[1]-1,array[0])).getTime()<Date.now())//crossed the deadline
      {
        exixtingIssue['warningMessage']="Deadline has Crossed";
      }
      else{
        delete exixtingIssue.warningMessage;
      }
    }
    else{//issue is completed
      exixtingIssue['warningMessage']="Issue is Completed";
    }
    removeExistingUser.push(exixtingUser);
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