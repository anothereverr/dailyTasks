const TelegramBot = require('node-telegram-bot-api')
const config = require('../config/bot.json')
const User = require('../model/user')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.token, {polling: true})

const botManager = () => {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id 
        console.info(`Receive message from chat id ${chatId}`)


        const isNewUser = (msg.text === '/start') ? true : false 
        if (isNewUser) {
            bot.sendMessage(chatId, `Welcome ${msg.from.first_name} to the daily task bot!`)
            saveUser(msg)
                .then(res => console.info(`User ${msg.chat.id}@${msg.from.first_name} has been added to mongo`))
                .catch(err => console.error(`Error when saving user on db: ${err}`))

            return;
        } 
        // TODO: check commands
        bot.sendMessage(chatId, 'Hello!')

    
    })
}

const saveUser = async (msg) => {
    
    let newUser = new User({
        chatId: msg.from.id,
        name: msg.from.first_name,
        lastName: msg.from.last_name,
        createdStamp: msg.date
    })

    return response = newUser.save()
                                .then(res => 'Usuario registrado en BD')
                                .catch(err => { throw new Error(`Error en la persistencia ${err}`) })
}


module.exports = botManager