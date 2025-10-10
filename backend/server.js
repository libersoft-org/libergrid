import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRoutes } from './api.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes
Object.entries(apiRoutes).forEach(([path, handler]) => {
	app.get(`/api/${path}`, handler);
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(80, '0.0.0.0', () => console.log('Web server is running...'));
