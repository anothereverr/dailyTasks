require('./config/config')
const app = require('express')()

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
