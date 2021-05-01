const TelegramBot = require('node-telegram-bot-api')
const config = require('../config/bot.json')
const User = require('../model/user')

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.token, {polling: true})

const botManager = () => {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id 
        console.info(`Receive message from chat id ${chatId}`)

        checkNewUser(msg, chatId).then(res => {

            // TODO: check incoming message
            bot.sendMessage(chatId, 'Hello!')

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
                                .then(res => 'Usuario registrado en BD')
                                .catch(err => { throw new Error(`Error en la persistencia ${err}`) })
}


module.exports = botManager