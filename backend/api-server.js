const express = require('express');
const cors = require('cors');
const BME280 = require('bme280-sensor');
const { exec } = require('child_process');
const app = express();
const host = '127.0.0.1';
const port = 80;
const sensorInternalOptions = {
 i2cBusNo: parseInt(process.env.I2C_BUS ?? '4', 10),
 i2cAddress: parseInt(process.env.BME280_ADDR ?? '0x76'),
};
let sensor = null;
let sensorInitialized = false;
app.use(cors());

initSensor();

app.get('/sensor-internal', handleSensorReading);
app.get('/poweroff', handlePoweroff);
app.get('/restart', handleRestart);
app.get('/health', handleHealth);

app.listen(port, host, () => {
 console.log(`API server running on http://${host}:${port}`);
 console.log(`Available endpoints:`);
 console.log(' /sensor-internal - Current temperature, humidity and pressure');
 console.log(' /poweroff - System shutdown');
 console.log(' /restart - System restart');
 console.log(' /health - Health check');
});

async function initSensor() {
 try {
  sensor = new BME280(sensorInternalOptions);
  await sensor.init();
  sensorInitialized = true;
  console.log('BME280 sensor initialized');
 } catch (err) {
  console.error('BME280 initialization error:', err);
  sensorInitialized = false;
 }
}

async function handleSensorReading(req, res) {
  if (!sensorInitialized || !sensor) {
    return res.status(503).json({
      error: 'Temperature sensor is not available',
      message: 'Sensor is not initialized or not available'
    });
  }

  try {
    const reading = await sensor.readSensorData();
    res.json({
      temperature_C: reading.temperature_C,
      humidity: reading.humidity,
      pressure_hPa: reading.pressure_hPa,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Sensor reading error:', err);
    res.status(500).json({
      error: 'Error reading temperature sensor',
      message: err.message
    });
  }
}

function handlePoweroff(req, res) {
  console.log('Poweroff request received');
  res.json({
    message: 'System is shutting down...',
    status: 'shutdown_initiated'
  });
  
  // Execute poweroff with small delay to allow response to be sent
  setTimeout(() => {
    exec('sudo poweroff', (error, stdout, stderr) => {
      if (error) {
        console.error('Poweroff error:', error);
      }
    });
  }, 500);
}

function handleRestart(req, res) {
  console.log('Restart request received');
  res.json({
    message: 'System is restarting...',
    status: 'restart_initiated'
  });
  
  // Execute restart with small delay to allow response to be sent
  setTimeout(() => {
    exec('sudo reboot', (error, stdout, stderr) => {
      if (error) {
        console.error('Restart error:', error);
      }
    });
  }, 500);
}

function handleHealth(req, res) {
  res.json({
    status: 'OK',
    sensor_initialized: sensorInitialized,
    uptime: process.uptime()
  });
}