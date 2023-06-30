const logger = require("../middleware/logger");
const NodeCache = require("node-cache");
const Tasks = require("../models/taskModel");

const STATUS = ["pending", "in-progress", "done"];
const TAG = ["important", "very-important", "low-priority", "high-priority", "normal"];

// Create a task
const createTask = async (req, res) => {
    try {
        let { title, description, task_status, tag } = req.body;
        const { _id, username } = req.user;
        if (!STATUS.includes(task_status)) {
            task_status = undefined;
        }
        if (!TAG.includes(tag)) {
            tag = undefined;
        }
        const task = await Tasks.create({ user_id: _id, title, description, task_status, tag });
        if (!task) {
            logger.log({ level: 'error', message: `${username} Not create a task due to some internal reasons`, ip: req.ip });
            return res.status(500).json({ status: false, msg: "Internal server error" });
        }

        return res.status(201).json({ status: true, msg: "your task create successfully.", task });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}


// Get All task or specific task - if user pass only token then fetch all task of that user and if user pass task id with token then fetch the specific task of that user.
const getTask = async (req, res) => {
    try {
        const { _id } = req.user;
        const { task_id } = req.query;
        let task;
        if (task_id) {
            task = await Tasks.find({ user_id: _id, _id: task_id });
        } else {
            task = await Tasks.find({ user_id: _id });
        }

        return res.status(200).json({ status: true, task });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Delete a specific task
const deleteTask = async (req, res) => {
    try {
        const { _id, username } = req.user;
        const { task_id } = req.query;
        if (!task_id) {
            logger.log({ level: 'error', message: `task not exist`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "Task not exist" });
        }

        const data = await Tasks.findOneAndDelete({ _id: task_id, user_id: _id });
        if (!data) {
            logger.log({ level: 'error', message: `${username} task not delete due to some internal reasons`, ip: req.ip });
            return res.status(500).json({ status: false, msg: "Internal server error" });
        }
        return res.status(200).json({ status: true, msg: "your task deleted successfully" });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}

// Update Task
const updateTask = async (req, res) => {
    try {
        const { _id } = req.user;
        let { task_id, description, title, task_status, tag } = req.body;
        if (!task_id) {
            logger.log({ level: 'error', message: `task not exist`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "Task not exist" });
        }

        if (!title) title = undefined;
        if (!description) description = undefined;
        if (!STATUS.includes(task_status)) task_status = undefined;
        if (!TAG.includes(tag)) tag = undefined;

        let task = await Tasks.findOneAndUpdate({ user_id: _id, _id: task_id }, { title, description, tag, task_status, updatedAt: Date.now() }, { new: true });
        if (!task) {
            logger.log({ level: 'error', message: `task not exist`, ip: req.ip });
            return res.status(400).json({ status: false, msg: "Task not exist" });
        }
        return res.status(200).json({ status: true, msg: "your task updated successfully", task });
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error" });
    }
}


module.exports = { createTask, getTask, deleteTask, updateTask }