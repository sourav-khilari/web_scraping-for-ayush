import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export function applySecurity(app) {
  app.use(helmet());
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
}
