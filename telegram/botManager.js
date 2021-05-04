const TelegramBot = require('node-telegram-bot-api')
const config = require('../config/bot.json')
const User = require('../model/user')
const Task = require('../model/task')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.token, {polling: true})

const botManager = () => {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id 
        console.info(`Receive message from chat id ${chatId}`)

        checkNewUser(msg, chatId).then(res => {

            if (res) return

            // Check if message is valid
            const validMessage = checkMessageType(msg.text)

            switch (validMessage){
                case "task": 
                    saveTask(getCleanMessage(msg.text), chatId)
                        .then(res => bot.sendMessage(chatId, `Your task is now on the system, keep the production going! \nYou have ${res} tasks registered for today!`))
                        .catch(err => bot.sendMessage(chatId, `Opps! we have an error with your task --> ${err}`))
                    break

                case "taskList":
                    bot.sendMessage(chatId, 'Opps! function not implemented yet, sorry')
                    break

                case "taskStats":
                    bot.sendMessage(chatId, 'Opps! function not implemented yet, sorry')
                    break

                default:
                    bot.sendMessage(chatId, 'Opps! i dont know what are you asking for, try to type [help]')  
                    break  
            }
        }).catch(err => console.log(err))

        
    })
}

async function checkNewUser(msg, chatId) {
    const userCount = await User.countDocuments({ chatId:msg.chat.id }, (err, res) => {
        if (err) return err
        return res
    })
    
    if (userCount == 0) {
        bot.sendMessage(chatId, `Welcome ${msg.from.first_name} to the daily task bot!`)
        saveUser(msg)
            .then(res => console.info(`User ${msg.chat.id}@${msg.from.first_name} has been added to mongo`))
            .catch(err => console.error(`Error when saving user on db: ${err}`))

        return true
    }
    return false
}

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

    return ""
}

const saveUser = async (msg) => {
    
    let newUser = new User({
        chatId: msg.from.id,
        name: msg.from.first_name,
        lastName: msg.from.last_name,
        createdStamp: msg.date
    })

    return response = newUser.save()
                                .then(res => 'User saved on Mongo')
                                .catch(err => { throw new Error(`Error ${err}`) })
}

const saveTask = async (task, chatId) => {

    let newTask = new Task({
        chatId: chatId,
        taskName: task.taskName.trim(),
        taskType: task.taskType.trim(),
        taskClassification: task.taskClassification.trim(),
        createdStamp: getDate()
    })

    console.log({newTask})

    const save = await newTask.save()
            .then(res => {
                return getDayTasks(chatId, newTask.createdStamp)
            })
            .catch(err => { throw new Error(`Error ${err}`) })
    return save
}

const getDate = () => {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear()
    return dd + mm + yyyy
}


const getDayTasks = async (chatId, day) => {
    return Task.countDocuments({ chatId:chatId, createdStamp: day }, (err, res) => {
        if (err) return err
        return res
    })
}


module.exports = botManager