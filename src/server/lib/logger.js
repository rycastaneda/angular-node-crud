'use strict';
var winston = require('winston'),
    config = require(__dirname + '/../config/config'),
    util = require(__dirname + '/../helpers/util'),
    logger;

/*
silly
    all object data
debug
    http requests
verbose
    per function logs
info
    start and end of api calls
warn
    medyo error
error
    error talaga. promise
*/

winston.cli();

switch (process.env.NODE_ENV) {
    case 'testing' :
        logger = new (winston.Logger)();
        break;

    case 'custom_local' :
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    level : 'verbose',
                    colorize : true
                })
            ]
        });
        break;

    case 'development' :
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    level : 'verbose',
                    colorize : true
                })
            ]
        });
        break;

    case 'staging' :
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    level : 'verbose',
                    colorize : true
                })
            ]
        });
        break;

    case 'production' :
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    level : 'info',
                    colorize : true
                })
            ]
        });
        break;

    default :
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)({
                    level : 'warn',
                    colorize : true
                })
            ]
        });
}

logger.cli();

logger._log = logger.log;
logger.log = function () {
    var arg = arguments[0].split('-'),
        logger_args = [arg[0]].concat(Array.prototype.slice.call(arguments, 1));

    if (arg.pop() === 'log') {
        util.log(arguments[1], arguments[2], Array.prototype.slice.call(arguments, 3).join(' '));
    }

    logger._log.apply(logger, logger_args);
};

module.exports = logger;
