const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema

let userSchema = new Schema({
    chatId: {
        type: Number,
        unique: true,
        required: [true, 'Chat id is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    lastName: {
        type: String
    },
    createdStamp: {
        type: Number,
        required: [true, '']
    },
    estado: {
        type: Boolean,
        default: true
    },
})

userSchema.plugin(uniqueValidator, {message: '{PATH} must be unique'})

module.exports = mongoose.model('users', userSchema)