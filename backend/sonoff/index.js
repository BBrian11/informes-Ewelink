
require('dotenv').config();
const interval = require("../config").interval

console.log("Running on sonoff")

const {appLogger} = require('../logger/logger-factory');

const ewelink = require('ewelink-api');
const shouldPowerOn = require('./dates');
var rules = require('../rules/rules.json');

const shouldPowerOnNoTemperature = require('./date-notemp');

appLogger.info('Starting Application');

const devices = JSON.parse(process.env.DEVICES);
appLogger.debug('devices environment:', devices);

function deviceRulesByName(name) {
  return rules.find(r => r.name === name);
}

let connection = createConnection();


function createConnection() {
  return new ewelink({
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    region: process.env.REGION // eu, us ....
  });
}

let intervalId;
connection.getDevices().then(() => {
  
  devices.forEach(device => {
    const {name, id} = device;
    work(id, name);
    intervalId = setInterval(() => work(id, name), interval * 60 * 1000);
  });

});


async function work(deviceId, deviceName) {

  try {

    const {temperature, power} = await deviceStatus(deviceId);
    const conditions = JSON.stringify({temperature, power});
    const devicesRules = deviceRulesByName(deviceName);

  
    const unsetTemperature = temperature === null || temperature === undefined || temperature < 1 || isNaN(temperature);

    if (devicesRules.temperature && unsetTemperature) {
      appLogger.warn('Temperature is null, reloading connection', temperature, conditions);
      connection = createConnection();
    }

    const shouldPower = (devicesRules.temperature && temperature) ?
      shouldPowerOn(deviceName, temperature) :
      shouldPowerOnNoTemperature(deviceName);

    if (shouldPower) {
      if (!power) {
        appLogger.info(`${deviceName}: ${conditions}  | Powering ON`);
        await connection.setDevicePowerState(deviceId, 'on');
      } else {
        appLogger.debug(`${deviceName}: ${conditions}  |  Nothing to do`);
      }

    } else {
      if (power) {
        appLogger.info(`${deviceName}: ${conditions}  | Powering OFF`);
        await connection.setDevicePowerState(deviceId, 'off');
      } else {
        appLogger.debug(conditions + ' | Nothing to do');
      }
    }

  } catch (e) {
    appLogger.error('Error on work' + JSON.stringify(e));
  }
}

async function deviceStatus(deviceId) {
  const stringTemperature = (await connection.getDeviceCurrentTemperature(deviceId)).temperature;
  const stringPower = (await connection.getDevicePowerState(deviceId)).state;
console.log(stringTemperature);
console.log(devicesRules);
  const temperature = parseFloat(stringTemperature);
  const power = (stringPower === 'on');
  if (typeof temperature !== "number") {
    appLogger.warn('Temperature is no more a number: ' + temperature);
  }
  return {temperature, power,devicesRules};
}


