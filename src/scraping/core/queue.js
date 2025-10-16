import cron from 'node-cron';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { registry } from '../registry.js';
import { runSource } from './pipeline.js';

export function initCron() {
  cron.schedule(env.CRON_GLOBAL, async () => {
    logger.info({ msg: 'cron.start' });
    for (const adapter of registry) {
      try {
        await runSource(adapter);
      } catch (e) {
        logger.error({ msg: 'cron.source_error', source: adapter.key, error: e?.message || String(e) });
      }
    }
    logger.info({ msg: 'cron.end' });
  });
}
