const BME280 = require('bme280-sensor');

const options = {
 i2cBusNo: parseInt(process.env.I2C_BUS ?? '4', 10), // /dev/i2c-4
 i2cAddress: parseInt(process.env.BME280_ADDR ?? '0x76'), // nebo 0x77
};

(async () => {
  try {
    const sensor = new BME280(options);
    await sensor.init();
    const reading = await sensor.readSensorData();
    console.log({
      temp_C: reading.temperature_C,
      hum: reading.humidity,
      pres_hPa: reading.pressure_hPa,
    });
  } catch (err) {
    console.error('BME280 error:', err);
  }
})();