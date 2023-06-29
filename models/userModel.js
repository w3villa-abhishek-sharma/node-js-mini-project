const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    phone_no: {
        type: Number,
        required: true
    },
    forget_otp: {
        type: Number,
        default: null
    },
    forget_time: {
        type: Date,
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const Users = mongoose.model('user', UserSchema);
Users.createIndexes();
module.exports = Users