import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
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
	const indexPath = path.join(__dirname, '../frontend/build/index.html');
	if (!existsSync(indexPath)) return res.status(404).send('404 Not Found');
	res.sendFile(indexPath);
});
app.listen(80, '127.0.0.1', () => console.log('Web server is running...'));
