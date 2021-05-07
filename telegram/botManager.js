const TelegramBot = require('node-telegram-bot-api')
const config = require('../config/bot.json')
const help = require('../config/help.json')
const User = require('../model/user')
const Task = require('../model/task')
const {getCleanMessage, checkMessageType, getDate, getWeekDays} = require('./utils')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.token, {polling: true})

// Bot options
const opts = {
    parse_mode: 'Markdown'
}

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
                    taskList(chatId, getDate())
                        .then(res => {
                            bot.sendMessage(chatId, `You have complete ${res.length} so far!`)
                            for(task of res) {
                                bot.sendMessage(chatId, `\`\`\` ${task.taskType} - ${task.taskName} - ${task.taskClassification} \`\`\``, opts)
                            }
                        })
                        .catch(err => bot.sendMessage(chatId, `Opps! we have an error with your petition --> ${err}`))
                    break

                case "yesterday":
                    taskList(chatId, getDate(1))
                        .then(res => {
                            bot.sendMessage(chatId, `You completed ${res.length} tasks yesterday!`)
                            for(task of res) {
                                bot.sendMessage(chatId, `\`\`\` ${task.taskType} - ${task.taskName} - ${task.taskClassification} \`\`\``, opts)
                            }
                        })
                        .catch(err => bot.sendMessage(chatId, `Opps! we have an error with your petition --> ${err}`))
                    break       

                case "taskStats":
                    weekStat(chatId)
                        .then(res => bot.sendMessage(chatId, `\`\`\` ${res}\`\`\``, opts))
                        .catch(err => bot.sendMessage(chatId, `Opps! we have an error with your petition --> ${err}`))
                    break

                case "help":
                    bot.sendMessage(chatId, `Hello!, this are my current commands are the following:\n${help.help} \nHope it helps!`, opts) 
                    break

                default:
                    bot.sendMessage(chatId, `Hello, i dont know what you mean but my current commands are the following:\n${help.help}`, opts)  
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

const getDayTasks = async (chatId, day) => {
    return Task.countDocuments({ chatId:chatId, createdStamp: day }, (err, res) => {
        if (err) return err
        return res
    })
}

const getTasksByClassification = async (chatId, days, classification) => {
    return Task.countDocuments({ chatId:chatId, createdStamp: { $in: days }, taskClassification:classification }, (err, res) => {
        if (err) return err
        return res
    })
}

const taskList = (chatId, day) => {
    return Task.find({chatId: chatId, createdStamp: day}, (err, res) => {
        if (err) return err
        return res
    })
}

const weekStat = async (chatId) => {
    const classificationList = await getDistinctTasks(chatId)
    const weekDays = getWeekDays() 
    const stats = await calculateStat(chatId, classificationList, weekDays)
    return stats
}

const getDistinctTasks = (chatId) => {
    return Task.find({ chatId:chatId }).distinct('taskClassification', (err, res) => {
       if (err) return err
       return res
    })
}

const calculateStat = async (chatId, classificationList, weekDays) => {
    let totalTasks = 0
    let classificationTasks = []
    
    // Tasks by classification
    for (classification of classificationList) {
        let totalAmount = await getTasksByClassification(chatId, weekDays, classification)
        classificationTasks.push({
            classification: classification,
            amount: totalAmount
        })
    }

    // Total tasks
    for (day of weekDays) {
        totalTasks+= parseInt(await getDayTasks(chatId, day))
    }

    return buildStatMessage(totalTasks, classificationTasks)
}

const buildStatMessage = (totalTasks, classificationTasks) => {
    let message = `This week so far you have completed ${totalTasks} tasks \nBy classification:`
    for (taskClass of classificationTasks)  {
        message += `\n${taskClass.classification}: ${taskClass.amount}`
    }
    return message
}

module.exports = botManager