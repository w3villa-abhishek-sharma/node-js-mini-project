const mongoose = require('mongoose');
const {Schema} = mongoose;

const TaskSchema = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title:{
        type: String,
        required: true
    },
    
    description:{
        type: String,
        required: true
    },
    tag:{
        type: String,
        default: "normal"
    },
    task_status:{
        type: String,
        default: "pending"
    },
    updatedAt:{
        type: Date,
        default : Date.now
    },
    createdAt:{
        type: Date,
        default : Date.now
    },
  });

  const Tasks = mongoose.model('tasks',TaskSchema);
  Tasks.createIndexes();

  module.exports = Tasks;