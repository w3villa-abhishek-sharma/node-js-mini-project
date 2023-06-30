const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, ip, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message} from IP ==> ${ip}`;
});

const logger = createLogger({
    format: combine(
        label({ label: 'right meow!' }),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './logs/info.log',level: 'info' }),
        new winston.transports.File({ filename: './logs/combined.log' }),
    ]
});

module.exports = logger;