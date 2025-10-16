import { inc42Adapter } from './sources/inc42.scraper.js';
import { ayushMinAdapter } from './sources/ayushmin.scraper.js';
import { yourStoryAdapter } from './sources/yourstory.scraper.js';
import { startupIndiaAdapter } from './sources/startupindia.scraper.js';
import { biracAdapter } from './sources/birac.scraper.js';
import { investIndiaAdapter } from './sources/investindia.scraper.js';

export const registry = [
  inc42Adapter,
  ayushMinAdapter,
  yourStoryAdapter,
  startupIndiaAdapter,
  biracAdapter,
  investIndiaAdapter
];





