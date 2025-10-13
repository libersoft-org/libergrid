import BME280 from 'bme280-sensor';
import { exec } from 'child_process';
import os from 'os';
import https from 'https';
export const apiRoutes = {
	'sensor-internal': handleSensorReading,
	'ip-private': handlePrivateIP,
	'ip-public': handlePublicIP,
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

function handlePrivateIP(req, res) {
	try {
		const networkInterfaces = os.networkInterfaces();
		let privateIP = null;
		// Look for first non-internal IPv4 address
		for (const interfaceName in networkInterfaces) {
			const interfaces = networkInterfaces[interfaceName];
			if (interfaces) {
				for (const iface of interfaces) {
					// Skip internal (loopback) addresses and IPv6
					if (iface.family === 'IPv4' && !iface.internal) {
						privateIP = iface.address;
						break;
					}
				}
			}
			if (privateIP) break;
		}
		if (privateIP) {
			res.json({ ip: privateIP });
		} else {
			res.status(404).json({
				error: 'No private IP found',
				message: 'Could not find a valid private IP address',
			});
		}
	} catch (err) {
		console.error('Error getting private IP:', err);
		res.status(500).json({
			error: 'Error retrieving private IP',
			message: err.message,
		});
	}
}

function handlePublicIP(req, res) {
	// Use external service to get public IP
	const options = {
		hostname: 'api.ipify.org',
		path: '/?format=json',
		method: 'GET',
		timeout: 5000,
	};

	const request = https.request(options, response => {
		let data = '';
		response.on('data', chunk => {
			data += chunk;
		});
		response.on('end', () => {
			try {
				const jsonData = JSON.parse(data);
				res.json({ ip: jsonData.ip });
			} catch (err) {
				console.error('Error parsing public IP response:', err);
				res.status(500).json({
					error: 'Error parsing public IP',
					message: err.message,
				});
			}
		});
	});
	request.on('error', err => {
		console.error('Error getting public IP:', err);
		res.status(500).json({
			error: 'Error retrieving public IP',
			message: err.message,
		});
	});
	request.on('timeout', () => {
		request.destroy();
		res.status(504).json({
			error: 'Timeout',
			message: 'Request to get public IP timed out',
		});
	});
	request.end();
}
