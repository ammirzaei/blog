const winston = require('winston');
const rootDir = require('../utils/rootDir');

const options = {
    File : {
        level : 'info',
        filename : `${rootDir}/logs/app.log`,
        handleExceptions : true,
        format : winston.format.json(),
        maxsize : 5000000, // 5MB
        maxFile : 5
    },
    Console : {
        level : 'debug',
        handleExceptions : true,
        format : winston.format.combine(
            winston.format.colorize(), // رنگی
            winston.format.simple() // ساده تر
        )
    }
}

const logger = new winston.createLogger({
    transports : [
        new winston.transports.File(options.File),
        // new winston.transports.Console(options.Console)
    ],
    exitOnError : false
});

logger.stream = {
    write : function(message){
        logger.info(message)
    }
}

module.exports = logger;