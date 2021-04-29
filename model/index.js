const mongoose = require('mongoose')

const mongoConnect = () => {
    // Mongo connection
    mongoose.connect('mongodb://root:root@192.168.18.21:27017/taskEater', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true
    })
    .then( res => console.log('[MongoDB] Connected Succesfully'))
    .catch( err => console.log(`[MongoDB] Error on connection ${err}`))

}

module.exports = mongoConnect