# timesheet
Backend training project for creating timesheet for user

## Project Details - 

Project includes user and task module. The project is used to keep tracking the tasks for each day and time. The user can add the new issues and charge time for that issue. 

### User module - 

The user module should include following features - 
* Users should register using user_name and email_id.
* Users can login with email_id and genrate random OTPs (min 6 Digit) 
* User can logout once they are done with it.

### Timesheet(task) module -

The task/timesheet module should include following features: 
* This module should be authenticated. Only authenticated users can access this module.
* The user can create task with task name, start and end date [not mandatory], Progress of task [Default/if not present], Total time for completing.
* The user can charge time for that task.
* User can mark the progress for each task.
* If total hour is crossed is 8 hours send warning response to user.
* List all the user tasks.
* If any task hasnt been charged/ percentage is not 100 and crossed deadline then for those task add warning message for those.
