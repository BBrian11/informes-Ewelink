/**
 * Copyright Nicolas Zozol, Robusta Code 2021
 */
const {isBoost, isStop} = require( "../rules/boost-and-stop");

var rules = require('../rules/rules.json')

const  {getLogger} = require('../logger/logger-factory')

// Get a logger with the `plop` name


function deviceByName(name) {
    return rules.find(r => r.name === name)
}

function shouldPowerOn(name, actualTemperature) {
    const device = deviceByName(name)
    const logger = getLogger(device.name)
    if(isBoost(name)){
        logger.debug(`${name}: is Boosted !`);
        return true
    }
    if(isStop(name)){
        logger.debug(`${name}: is Stopped !`);
        return false
    }

    if (isHoliday(device)) {
        logger.debug('isHoliday |' + debugConditions(actualTemperature))
        return shouldRunMinTemperature(device, actualTemperature)
    }
    if (isWorkday(device)) {
        logger.debug('isWorkday |' + debugConditions(actualTemperature))
        return isEcoWorkday(device)
            ? shouldRunEcoWorkday(device, actualTemperature)
            : shouldRunComfortWorkday(device, actualTemperature)
    }

    if (isHomeDay(device)) {
        logger.debug('isHomeday |' + debugConditions(actualTemperature))
        return isEcoHomeDay(device)
            ? shouldRunEcoHomeDay(device, actualTemperature)
            : shouldRunComfortHomeDay(device, actualTemperature)
    }

    logger.error('shouldPowerOn | state ex: should be either' +
        ' holiday/workday/homeday' + debugConditions(actualTemperature))

    throw 'Illegal state exception: should be either holiday/workday/homeday'
}


function shouldRunComfortHomeDay(device, actualTemperature) {
    const logger = getLogger(device.name)

    if (!isHomeDay(device)) {
        logger.error('Assertion error: shouldRunComfortHomeDay: should be a home day | ' + debugConditions(actualTemperature))
        throw 'Assertion error: should be a home day'
    }
    if (isEcoHomeDay(device)) {
        logger.error('Assertion error: shouldRunComfortHomeDay: should NOT be in Eco time a home day | ' + debugConditions(actualTemperature))
        throw 'Assertion error: should NOT be in Eco time for home day'
    }

    const result = actualTemperature < device.comfortTemperature
    if (result) {
        logger.info('shouldRunComfortHomeDay ON | ' + debugConditions(actualTemperature))
    } else {
        logger.debug('NO shouldRunComfortHomeDay | ' + debugConditions(actualTemperature))
    }
    return result
}


function shouldRunEcoHomeDay(device, actualTemperature) {
    const logger = getLogger(device.name)

    if (!isHomeDay(device)) {
        logger.error('Assertion error: shouldRunEcoHomeDay: should be a home day - ' + debugConditions(actualTemperature))
        throw 'Assertion error: should be a home day'
    }

    const result = isEcoHomeDay(device) && actualTemperature < device.ecoTemperature
    if (result) {
        logger.info('shouldRunEcoHomeDay ON - ' + debugConditions(actualTemperature))
    } else {
        logger.debug('NO shouldRunEcoHomeDay | ' + debugConditions(actualTemperature))
    }
    return result
}

function isEcoHomeDay(device) {
    if (!isHomeDay(device)) {
        throw 'Assertion error: should be home day'
    }
    return device.home.eco.includes(new Date().getHours())
}

// test ok
function shouldRunComfortWorkday(device, actualTemperature) {
    const logger = getLogger(device.name)

    if (!isWorkday(device)) {
        logger.error('Assertion error: shouldRunComfortWorkday: should be a work day - ' + debugConditions(actualTemperature))
        throw 'Assertion error: should be a workday'
    }
    if (isEcoWorkday(device)) {
        logger.error('Assertion error: shouldRunComfortWorkday: should NOT be in Eco time for workday - ' + debugConditions(actualTemperature))
        throw 'Assertion error: should NOT be in Eco time for workday'
    }
    const result = actualTemperature < device.comfortTemperature
    if (result) {
        logger.info('shouldRunComfortWorkday ON - ' + debugConditions(actualTemperature))
    } else {
        logger.debug('NO shouldRunComfortWorkday | ' + debugConditions(actualTemperature))
    }
    return result
}


// test ok
function shouldRunEcoWorkday(device, actualTemperature) {
    const logger = getLogger(device.name)

    if (!isWorkday(device)) {
        logger.error('Assertion error: shouldRunEcoWorkday: should be a work day - ' + debugConditions(actualTemperature))
        throw 'Assertion error: should be a workday'
    }

    const result = isEcoWorkday(device) && actualTemperature < device.ecoTemperature
    if (result) {
        logger.info('isEcoWorkday ON - ' + debugConditions(actualTemperature))
    } else {
        logger.debug('NO shouldRunEcoWorkday | ' + debugConditions(actualTemperature))
    }
    return result
}


function isEcoWorkday(device) {
    if (!isWorkday(device)) {
        throw 'Assertion error: should be workday'
    }
    return device.workday.eco.includes(new Date().getHours())
}


function isHomeDay(device) {
    return !isHoliday(device) && !isWorkday(device)
}

function isWorkday(device) {
    return !isHoliday(device) && device.days.workdays.includes(currentDayShort())
}


// test ok
function isHoliday(device) {
    var isoNow = new Date().toISOString().slice(0, 10)
    return device.days.holidays.includes(isoNow)
}

// test ok
function shouldRunMinTemperature(device, actualTemperature) {
    const logger = getLogger(device.name)

    if (!isHoliday(device)) {
        logger.error('Assertion error: shouldRunMinTemperature: should be a holiday - ' + debugConditions(actualTemperature))
        throw 'Assertion error: should be in holiday'
    }
    const result = actualTemperature < device.minTemperature
    if (result) {
        logger.info('shouldRunComfortWorkday ON - ' + debugConditions(actualTemperature))
    } else {
        logger.debug('NO shouldRunMinTemperature | ' + debugConditions(actualTemperature))
    }
    return result
}

// test ok
function currentDay() {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    var today = new Date().getDay()
    return days[today].toLowerCase()//.substring(0,3)
}

// test ok
function currentDayShort() {
    return currentDay().substring(0, 3).toLowerCase()
}

function debugConditions(temperature) {
    let str = currentDayShort() + ' ' + new Date().toISOString().slice(5, 16)
    if (temperature) {
        str += ' ; ' + temperature + '°C'
    }
    return str
}

module.exports = shouldPowerOn