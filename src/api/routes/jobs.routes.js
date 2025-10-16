import { Router } from 'express';
import { runJob } from '../controllers/jobs.controller.js';

export const jobsRouter = Router();
jobsRouter.post('/run', runJob);
