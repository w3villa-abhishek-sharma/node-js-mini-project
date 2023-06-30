const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const Users = require("../models/userModel");
const NodeCache = require("node-cache");
const logger = require("../middleware/logger");
const sendMail = require("../middleware/sendEmail");


const cache = new NodeCache();


// Sign Up a user
const createUser = async (req, res) => {
    try {
        let { username, password, email, phone_no } = req.body;
        if (cache.has(username)) {
            return res.json({ status: false, msg: "User already exist with this username." });
        }
        let user = await Users.findOne({ username });
        if (user) {
            return res.json({ status: false, msg: "User already exist with this username." });
        }
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        password = bcrypt.hashSync(password, salt);
        user = await Users.create({ username, password, email, phone_no });
        cache.set(username, user);
        let token = jwt.sign({ username, email, _id: user._id }, process.env.SECRET_KEY);
        logger.log({ level: 'info', message: `${username} user register successfully`, ip: req.ip });
        return res.json({ status: true, token });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Update user profile --> Login Required
const updateUser = async (req, res) => {
    try {
        const { _id, username } = req.user;
        let { password, email, phone_no } = req.body;
        if (!_id) {
            return res.json({ status: false, msg: "Provide the valid data." });
        }

        let user;
        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        password = bcrypt.hashSync(password, salt);
        if (cache.has(username)) {
            user = cache.get(username);
            user = await Users.findByIdAndUpdate(_id, { password, email, phone_no }, { new: true });
            return res.json({ status: true, msg: "update your profile successfully.", user });
        } else {
            user = await Users.findByIdAndUpdate(_id, { password, email, phone_no }, { new: true });
        }
        logger.log({ level: 'info', message: `${username} user update successfully`, ip: req.ip });
        return res.json({ status: true, msg: "update your profile successfully.", user });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Delete user account --> Login Required
const deleteUser = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id) {
            return res.json({ status: false, msg: "Provide the valid data." });
        }
        let user = await Users.findByIdAndDelete(_id);
        logger.log({ level: 'info', message: `${username} user delete profile successfully`, ip: req.ip });
        return res.json({ status: true, msg: "your account delete successfully.", user });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Get user our profile --> Login Required
const getProfile = async (req, res) => {
    try {
        const { _id, username } = req.user;
        if (cache.has(username)) {
            let profile = cache.get(username);
            return res.json({ status: true, profile });
        }
        let profile = await Users.findById(_id);
        cache.set(username, profile)
        logger.log({ level: 'info', message: `${username} user get profile successfully`, ip: req.ip });
        return res.json({ status: true, profile });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Login User
const signIn = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user;
        if (cache.has(username)) {
            user = cache.get(username);
        } else {
            user = await Users.findOne({ username });
            cache.set(username, user);
        }
        let valid = bcrypt.compareSync(password, user.password);
        if (!valid) {
            logger.log({ level: 'info', message: `${username} user try with invalid credentials`, ip: req.ip });
            return res.json({ status: false, msg: "username/password is invalid." });
        }
        let token = jwt.sign({ username: user.username, email: user.email, _id: user._id }, process.env.SECRET_KEY);
        logger.log({ level: 'info', message: `${username} user login successfully`, ip: req.ip });
        return res.json({ status: true, token });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Forget Password
const forgetPassword = async (req, res) => {
    try {
        const { username } = req.body;
        let user = await Users.findOne({ username });

        if (!user) {
            logger.log({ level: 'error', message: `User not exist`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "User not exist" });
        }

        let forget_otp = Math.floor(100000 + Math.random() * 900000);
        let forget_time = Date.now() + (60 * 5 * 1000);
        let data = await Users.findOneAndUpdate({ username }, { forget_otp, forget_time });
        let emailResponse = await sendMail(user.email, "Forget Password OTP", String(forget_otp));
        if (!emailResponse.messageId) {
            logger.log({ level: 'info', message: `Email not sended due to some reason`, ip: req.ip });
            return res.status(500).json({ status: false, msg: "Internal server error" });
        }
        if (!data) {
            logger.log({ level: 'info', message: `OTP not send by the server`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "Some error occurred" });
        }
        return res.status(200).json({ status: true, msg: "send otp on your email address" });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Verify OTP and set the password 
const verifyOtp = async (req, res) => {
    try {
        let { otp, username, password } = req.body;
        let user = await Users.findOne({ username });

        if (!user) {
            logger.log({ level: 'error', message: `User not exist`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "User not exist" });
        }

        if (user.forget_otp !== otp) {
            return res.status(400).json({ status: false, msg: "otp is not valid" });
        }
        if (user.forget_time < Date.now()) {
            return res.status(400).json({ status: false, msg: "otp is expired" });
        }

        const salt = bcrypt.genSaltSync(Number(process.env.SALT_ROUNDS));
        password = bcrypt.hashSync(password, salt);

        let data = await Users.findOneAndUpdate({ username }, { password, forget_otp: null, forget_time: null });
        if (!data) {
            logger.log({ level: 'info', message: `Password not change due to some reason`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "Some error occurred" });
        }
        logger.log({ level: 'info', message: `${username} your password update successfully using ${otp} otp.`, ip: req.ip });
        return res.status(200).json({ status: true, msg: "your password update successfully." });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

module.exports = { createUser, updateUser, deleteUser, getProfile, signIn, forgetPassword, verifyOtp };