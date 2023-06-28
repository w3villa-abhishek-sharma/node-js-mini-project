const express = require("express");
const { body } = require('express-validator');
const { createUser, signIn, updateUser, deleteUser, getProfile } = require("../controllers/userController");
const authentication = require("../middleware/authentication");
const returnValidationError = require("../middleware/returnValidationError");
const routes = express.Router();

routes.post("/sign-up",
    [
        body("username").isAlphanumeric().isLength({ min: 4 }).withMessage('Not a valid username'),
        body("password").isStrongPassword().withMessage('Not a strong password'),
        body("email").isEmail().withMessage('Not a valid e-mail address'),
        body("phone_no").isNumeric().isLength({ min: 10, max: 10 }).withMessage('Not a valid mobile number')
    ],
    returnValidationError, createUser);

routes.post("/sign-in",
    [
        body("username").isAlphanumeric().isLength({ min: 4 }).withMessage('Not a valid username'),
        body("password").isStrongPassword().withMessage('Not a strong password')
    ],
    returnValidationError, signIn);

routes.put("/update-user",
    [
        body("password").isStrongPassword().withMessage('Not a strong password'),
        body("email").isEmail().withMessage('Not a valid e-mail address'),
        body("phone_no").isNumeric().isLength({ min: 10, max: 10 }).withMessage('Not a valid mobile number')
    ],
    returnValidationError, authentication, updateUser);

routes.delete("/delete-user", authentication, deleteUser);
routes.get("/get-user", authentication, getProfile);

module.exports = routes;