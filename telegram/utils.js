/* Task structure
* -n TaskName -c TaskClassification -t TaskType
*/ 
const getCleanMessage = (message) => {
    
    const [blank, taskName, taskClassification, taskType] = message.split('-')

    return {
        taskName : taskName.substring(2),
        taskClassification : taskClassification.substring(2),
        taskType : taskType.substring(2),
    }
}

/*
* Task Structure -> -n TaskName -c TaskClassification -t TaskType
* TaskList -> taskList TODO: ADD PARAMETERS LIKE AMOUNT OF TASK DISPLAY OR PRETTY DISPLAY IF POSSIBLE
* TaskStats -> taskStats TODO: ADD PARAMETERS LIKE FORM OF DISPLAY, TYPE OF STAT
*/
const checkMessageType = (message) => {

    if(message.includes('-n') && message.includes('-c'))
        return "task"

    if(message.includes('taskList')) 
        return "taskList"
        
    if(message.includes('taskStats')) 
        return "taskStats"

    if(message.includes('yesterday')) 
        return "yesterday"
    
    if(message.includes('help')) 
        return "help"

    return ""
}

const getDate = (daysBack = 0) => {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear()
    return (dd-daysBack) + mm + yyyy
}

const getWeekDays = () => {
    const today = new Date()
    const dayNumber = today.getDay()
    let weekDays = []
    for (let i = 0; i < dayNumber ; i++) {
        weekDays[i] = getDate(i)
    }
    return weekDays
}

const generatePassword = () => {
    let length = 8
    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let retVal = ""
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
}

module.exports = {
    getCleanMessage,
    checkMessageType,
    getDate,
    getWeekDays
}