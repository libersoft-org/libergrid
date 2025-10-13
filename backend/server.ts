import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRoutes } from './api.ts';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/build')));
Object.entries(apiRoutes).forEach(([routePath, handler]) => {
	app.get('/api/' + routePath, handler);
});
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
app.listen(80, '127.0.0.1', () => console.log('Web server is running...'));
