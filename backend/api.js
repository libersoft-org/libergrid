import BME280 from 'bme280-sensor';
import { exec } from 'child_process';
export const apiRoutes = {
	'sensor-internal': handleSensorReading,
	poweroff: handlePoweroff,
	restart: handleRestart,
	health: handleHealth,
};
const sensorInternalOptions = {
	i2cBusNo: parseInt(process.env.I2C_BUS ?? '4', 10),
	i2cAddress: parseInt(process.env.BME280_ADDR ?? '0x76'),
};
let sensor = null;
let sensorInitialized = false;

initSensor();

export async function initSensor() {
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
			message: 'Sensor is not initialized or not available',
		});
	}

	try {
		const reading = await sensor.readSensorData();
		res.json({
			temperature_C: reading.temperature_C,
			humidity: reading.humidity,
			pressure_hPa: reading.pressure_hPa,
			timestamp: new Date().toISOString(),
		});
	} catch (err) {
		console.error('Sensor reading error:', err);
		res.status(500).json({
			error: 'Error reading temperature sensor',
			message: err.message,
		});
	}
}

function handlePoweroff(req, res) {
	console.log('Poweroff request received');
	res.json({
		message: 'System is shutting down...',
		status: 'shutdown_initiated',
	});

	// Execute poweroff with small delay to allow response to be sent
	setTimeout(() => {
		exec('sudo poweroff', (error, stdout, stderr) => {
			if (error) console.error('Poweroff error:', error);
		});
	}, 500);
}

function handleRestart(req, res) {
	console.log('Restart request received');
	res.json({
		message: 'System is restarting...',
		status: 'restart_initiated',
	});

	// Execute restart with small delay to allow response to be sent
	setTimeout(() => {
		exec('sudo reboot', (error, stdout, stderr) => {
			if (error) console.error('Restart error:', error);
		});
	}, 500);
}

function handleHealth(req, res) {
	res.json({
		status: 'OK',
		sensor_initialized: sensorInitialized,
		uptime: process.uptime(),
	});
}
