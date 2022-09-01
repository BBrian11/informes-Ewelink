
require('dotenv').config()

const {appLogger} = require('../logger/logger-factory')

const ewelink = require('ewelink-api')

appLogger.info('Starting Application')


let connection = createConnection()


function createConnection() {
  return new ewelink({
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
    region: process.env.REGION 
  })
}

connection.getDevices().then((data) => {
  console.log(data.map(d=>({
    id:d.deviceId,
   
    name:d.name
  })))
})