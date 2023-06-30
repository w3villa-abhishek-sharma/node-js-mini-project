const jwt = require("jsonwebtoken");
const Users = require("../models/userModel");
const NodeCache = require("node-cache");
const logger = require("../helper/logger");

const cache = new NodeCache();

const authentication = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            logger.log({ level: 'info', message: `unauthorized access`, ip: req.ip });
            return res.status(401).json({ status: false, msg: "unauthorized access" });
        }
        let data = jwt.verify(token, process.env.SECRET_KEY);
        let user;
        if (cache.has(data.username)) {
            user = cache.get(data.username);
        } else {
            user = await Users.findById(data._id);
            cache.set(data.username, user);
        }
        if (!user) {
            logger.log({ level: 'info', message: `User not exist`, ip: req.ip });
            return res.status(401).json({ status: false, msg: "unauthorized access" });
        }
        req.user = user;
        next();
    } catch (error) {
        logger.log({ level: 'error', message: error, ip: req.ip });
        return res.status(500).json({ status: false, msg: "Internal server error." });
    }
}

module.exports = authentication;