import express from 'express';
import { applySecurity } from './middlewares/security.middleware.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { itemsRouter } from './api/routes/items.routes.js';
import { jobsRouter } from './api/routes/jobs.routes.js';
import { mongoHealth } from './config/mongo.js';

export const app = express();
app.use(express.json());
applySecurity(app);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mongo: mongoHealth() ? 'up' : 'down' });
});

app.use('/api/items', itemsRouter);
app.use('/api/jobs', jobsRouter);

app.use(notFound);
app.use(errorHandler);
