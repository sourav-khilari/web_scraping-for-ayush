import axios from 'axios';
import { env } from '../../config/env.js';

export const http = axios.create({
  timeout: env.HTTP_TIMEOUT_MS,
  headers: {
    'user-agent': env.USER_AGENT,
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  },
  validateStatus: s => s >= 200 && s < 400
});
