const {isBoost, isStop} = require( "../rules/boost-and-stop");

/**
 * Copyright Nicolas Zozol, Robusta Code 2021
 */
var rules = require('../rules/rules.json');

const {getLogger} = require('../logger/logger-factory');

// Get a logger with the `plop` name


function deviceRulesByName(name) {
  return rules.find(r => r.name === name);
}

function shouldPowerOnNoTemperature(name) {
  const deviceRules = deviceRulesByName(name);
  const logger = getLogger(deviceRules.name);
  if (isBoost(name)) {
    logger.debug(`${name}: is Boosted !`);
    return true;
  }
  if (isStop(name)) {
    logger.debug(`${name}: is Stopped !`);
    return false;
  }

  if (isHoliday(deviceRules)) {
    logger.debug(`${name}: isHoliday no Temperature, always OFF | + ${debugConditions()}`);
    return false;
  }
  if (isWorkday(deviceRules)) {
    const shouldBeOn = !isEcoWorkday(deviceRules);
    logger.debug(`${name}: Workday, should be on ? ${shouldBeOn} |  + ${debugConditions()}`);
    return shouldBeOn;
  }

  if (isHomeDay(deviceRules)) {
    const shouldBeOn = !isEcoHomeDay(deviceRules);
    logger.debug(`${name}: Homeday, should be on ? ${shouldBeOn} |  + ${debugConditions()}`);
    return shouldBeOn;

  }

  logger.error('shouldPowerOn | state ex: should be either' +
    ' holiday/workday/homeday' + debugConditions());

  throw 'Illegal state exception: should be either holiday/workday/homeday';
}


function isEcoHomeDay(deviceRules) {
  if (!isHomeDay(deviceRules)) {
    throw 'Assertion error: should be home day';
  }
  return deviceRules.home.eco.includes(new Date().getHours());
}


function isEcoWorkday(deviceRules) {
  if (!isWorkday(deviceRules)) {
    throw 'Assertion error: should be workday';
  }
  return deviceRules.workday.eco.includes(new Date().getHours());
}


function isHomeDay(device) {
  return !isHoliday(device) && !isWorkday(device);
}

function isWorkday(device) {
  return !isHoliday(device) && device.days.workdays.includes(currentDayShort());
}


// test ok
function isHoliday(device) {
  var isoNow = new Date().toISOString().slice(0, 10);
  return device.days.holidays.includes(isoNow);
}


// test ok
function currentDay() {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var today = new Date().getDay();
  return days[today].toLowerCase();//.substring(0,3)
}

// test ok
function currentDayShort() {
  return currentDay().substring(0, 3).toLowerCase();
}

function debugConditions() {
  let str = currentDayShort() + ' ' + new Date().toISOString().slice(5, 16);
  str += ' ; unknown T°';
  return str;
}

module.exports = shouldPowerOnNoTemperature;