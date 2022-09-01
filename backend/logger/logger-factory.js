const {Logger, LogLevel, logLevel} = require('plop-logger')
var FileAppender = require('./file-appender')
const configLogLevel = require("../config").logLevel

Logger.config.appender = new FileAppender('plop.log')

var rules = require('../rules/rules.json')

const loggers = {}

const appLogger = createAppLogger()
createAllLoggers(rules)

function createAppLogger() {
    const name = 'APP'
    const logger = Logger.getLogger(name)
    logger.level = configLogLevel
    loggers[name] = logger
    logger.info('APP logger created')
    return logger
}

/* There is a logger for the App with name 'APP' but also a logger for each sonoff defined by Json */
function createAllLoggers(rules) {
    rules.forEach(r => createLogger(r.name, logLevel(r.logLevel) || LogLevel.Info))
    appLogger.info('All loggers created')
}

function createLogger(name, level) {
    const logger = Logger.getLogger(name)
    logger.level = level
    loggers[name] = logger
}


function getLogger(name) {

    if (loggers[name]) {
        return loggers [name]
    }
    return appLogger
}

module.exports = {
    appLogger,
    getLogger
}