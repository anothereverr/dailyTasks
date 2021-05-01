const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

let Schema = mongoose.Schema

let taskSchema = new Schema({
    chatId: {
        type: Number,
        unique: true,
        required: [true, 'Chat id is required']
    },
    taskName: {
        type: String,
        required: [true, 'task name is required']
    },
    taskType: {
        type: String,
        required: [true, 'task type is required']
    },
    taskclassification: {
        type: String
    },
    createdStamp: {
        type: Number,
        required: [true, '']
    },
    status: {
        type: Boolean,
        default: true
    },
})

taskSchema.plugin(uniqueValidator, {message: '{PATH} must be unique'})

module.exports = mongoose.model('tasks', taskSchema)