const {appLogger} = require('../logger/logger-factory');
appLogger.info('Initializing boostMap and stopMap');


const boostMap = new Map();
const stopMap = new Map();

 function setBoost(device, timeInHour) {
  const now = new Date().getTime();

  const timeInMilli = timeInHour * 3600 * 1000;
  boostMap.set(device, now + timeInMilli);
  stopMap.set(device, 0);
}
 function setStop(device, timeInHour) {
  const now = new Date().getTime();

  const timeInMilli = timeInHour * 3600 * 1000;
  stopMap.set(device, now + timeInMilli);
  boostMap.set(device, 0);
}
 function isBoost(device) {
  const until = boostMap.get(device);
  if (!until || until === 0) {
    return false;
  }
  const now = new Date().getTime();
  return now < until;

}
 function isStop(device) {
  const until = stopMap.get(device);
  if (!until || until === 0) {
    return false;
  }
  const now = new Date().getTime();
  return now < until;

}

module.exports={
  boostMap,
  stopMap,
  setBoost,
  setStop,
  isBoost,
  isStop
}