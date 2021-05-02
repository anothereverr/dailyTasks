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

            if (res) return;

            let cleanTask = getCleanMessage(msg.text)
            if (!cleanTask) return bot.sendMessage(chatId, 'Opps! wrong task format, please stick to this [-n TaskName -c TaskClassification -t TaskType]')

            // TODO: RETURN NUMBER OF TASK SAVED ON THE DAY
            saveTask(cleanTask, chatId)
                .then(res => bot.sendMessage(chatId, `Your task is now on the system, keep the production going!`))
                .catch(err => bot.sendMessage(chatId, `Opps! we have an error with your task --> ${err}`))


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

/* Message structure
* -n TaskName -c TaskClassification -t TaskType
*/ 
const getCleanMessage = (message) => {
    // Check delimiters
    if(!message.includes('-n') && !message.includes('-c')) return false

    const [blank, taskName, taskClassification, taskType] = message.split('-')

    return {
        taskName : taskName.substring(2),
        taskClassification : taskClassification.substring(2),
        taskType : taskType.substring(2),
    }
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
    // TODO: SET CREATED STAMP
    // TODO: REMOVE SPACES FROM FIELDS
    let newTask = new Task({
        chatId: chatId,
        taskName: task.taskName,
        taskType: task.taskType,
        taskClassification: task.taskClassification,
        createdStamp: 0
    })

    console.log(newTask)

    return response = newTask.save()
                                .then(res => 'Task saved on Mongo')
                                .catch(err => { throw new Error(`Error ${err}`) })
}


module.exports = botManager