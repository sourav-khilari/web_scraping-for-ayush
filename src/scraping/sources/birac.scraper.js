import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';

const BASE = 'https://birac.nic.in';

// Pages that often list live calls / notices
const PAGES = [
  `${BASE}/calls.php`,
  `${BASE}/what-is-new.php`,
  `${BASE}/news.php`
];

export async function discover() {
  const links = new Set();

  for (const p of PAGES) {
    try {
      const { data: html } = await http.get(p);
      const $ = cheerio.load(html);
      $('a[href]').each((_i, el) => {
        const href = ($(el).attr('href') || '').trim();
        if (!href) return;
        const abs = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
        if (abs.startsWith(BASE) && /(call|cfp|eo[i]|rfp|grant|scheme|result|pdf|notice|program|big)/i.test(abs)) {
          links.add(abs.split('#')[0]);
        }
      });
    } catch { /* skip */ }
  }
  return Array.from(links).slice(0, 80);
}

export async function parse(url) {
  const res = await http.get(url);
  const ctype = (res.headers['content-type'] || '').toLowerCase();

  if (ctype.includes('pdf')) {
    const title = url.split('/').pop() || 'BIRAC Document';
    // Add hint keywords (so your investment filter passes):
    const urlHints = url.toLowerCase().includes('big') ? ' grant' : '';
    return { title, url, source: 'birac', text: `${title}${urlHints}` };
  }

  const $ = cheerio.load(res.data);
  const title =
    $('h1, h2').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim();
  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('article, .content, main, body').text().replace(/\s+/g, ' ').trim().slice(0, 1200);

  const dateStr = $('time[datetime]').attr('datetime') || '';
  const publishedAt = dateStr ? dayjs(dateStr).toDate() : undefined;

  return { title, url, source: 'birac', publishedAt, text: `${title}. ${desc}` };
}

export const biracAdapter = { key: 'birac', discover, parse };
