import { env } from '../../config/env.js';
import { registry } from '../../scraping/registry.js';
import { runSource } from '../../scraping/core/pipeline.js';

export async function runJob(req, res) {
  // const token = req.headers['x-admin-token'] || req.query.token;
  // if (token !== env.ADMIN_TOKEN) return res.status(401).json({ message: 'Unauthorized' });

  const key = (req.query.source || 'all').toString();
  const adapters = key === 'all' ? registry : registry.filter(a => a.key === key);
  if (!adapters.length) return res.status(400).json({ message: 'Unknown source' });

  const results = [];
  for (const a of adapters) results.push(await runSource(a));
  res.json({ ran: adapters.map(a => a.key), results });
}
