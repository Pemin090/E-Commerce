import express from 'express';
import path from 'path';
import { apiRouter } from './server/api.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Static assets
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ApexStore Server listening on http://0.0.0.0:${PORT}`);
});
