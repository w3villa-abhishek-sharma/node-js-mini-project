const express = require("express");
const { body } = require('express-validator');
const authentication = require("../middleware/authentication");
const returnValidationError = require("../middleware/returnValidationError");
const { createTask, getTask, deleteTask, updateTask } = require("../controllers/taskController");
const route = express.Router();

// Create a Task
route.post("/create-task", [
    body("title").isString().isLength({ min: 4 }).withMessage("Not a valid title"),
    body("description").isString().isLength({ min: 8, max: 250 }).withMessage("Not a valid description"),
], returnValidationError, authentication, createTask);

// Get all tasks or specific task
route.get("/get-tasks",authentication, getTask);

// Delete a specific task
route.delete("/delete-tasks",authentication, deleteTask);

// Update a specific task
route.put("/update-tasks",authentication, updateTask);

module.exports = route;