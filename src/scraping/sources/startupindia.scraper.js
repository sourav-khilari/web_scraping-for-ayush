import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';
import { SECTOR_KEYWORDS } from '../../common/constants.js';

const BASE = 'https://www.startupindia.gov.in';

// We’ll try public search + known sections that often list programs/challenges.
// Note: Startup India has dynamic pages; these endpoints are “best effort” for public HTML.
function buildDiscoveryUrls() {
  const queries = new Set();
  Object.values(SECTOR_KEYWORDS).forEach(arr => arr.forEach(q => queries.add(q)));
  const search = Array.from(queries).map(q => `${BASE}/content/sih/en/search.html?search=${encodeURIComponent(q)}`);

  // Common sections that show programs or challenges:
  const sections = [
    `${BASE}/content/sih/en/sisfs-overview.html`,
    `${BASE}/content/sih/en/challenges.html`,
    `${BASE}/content/sih/en/government-schemes.html`,
    `${BASE}/content/sih/en/incubators.html`
  ];

  return [...search, ...sections];
}

export async function discover() {
  const urls = buildDiscoveryUrls();
  const links = new Set();

  for (const u of urls) {
    try {
      const { data: html } = await http.get(u);
      const $ = cheerio.load(html);
      $('a[href]').each((_i, el) => {
        const href = ($(el).attr('href') || '').trim();
        if (!href) return;
        const abs = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
        // Keep likely opportunity/program/challenge pages
        if (abs.startsWith(BASE) && /(challenge|scheme|program|incubator|accelerator|sisfs|seed|opportunity|result|notice)/i.test(abs)) {
          links.add(abs.split('#')[0]);
        }
      });
    } catch { /* ignore */ }
  }
  return Array.from(links).slice(0, 80);
}

export async function parse(url) {
  const res = await http.get(url);
  const ctype = (res.headers['content-type'] || '').toLowerCase();
  if (ctype.includes('pdf')) {
    const title = url.split('/').pop() || 'Startup India Document';
    return { title, url, source: 'startupindia', text: title };
  }

  const $ = cheerio.load(res.data);
  const title =
    $('h1, h2').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim();
  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('main, .content, article, .article').text().replace(/\s+/g, ' ').trim().slice(0, 1200);

  const dateStr = $('time[datetime]').attr('datetime') || '';
  const publishedAt = dateStr ? dayjs(dateStr).toDate() : undefined;

  return { title, url, source: 'startupindia', publishedAt, text: `${title}. ${desc}` };
}

export const startupIndiaAdapter = { key: 'startupindia', discover, parse };
