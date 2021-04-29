require('./config/config')
const app = require('express')()
const botManager = require('./telegram/botManager')

// Config Parameters 
const PORT = process.env.PORT

app.get('/', (req, res) => {
    res.json({
        status: 'ok!'
    })
})

app.listen(PORT, () => {
    console.log(`[Express] Listening on port ${PORT}`)
})


// Initialize bot manager
botManager()