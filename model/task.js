const mongoose = require('mongoose')

let Schema = mongoose.Schema

let taskSchema = new Schema({
    chatId: {
        type: Number,
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
    taskClassification: {
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

module.exports = mongoose.model('tasks', taskSchema)