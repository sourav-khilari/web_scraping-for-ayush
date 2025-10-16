import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';

const BASE = 'https://www.investindia.gov.in';

// AYUSH sector landing + news/opportunities section candidates
const PAGES = [
  `${BASE}/sector/ayush`,
  `${BASE}/team-india-blogs`,
  `${BASE}/investment-opportunities` // general page; we’ll filter AYUSH via text later
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
        if (abs.startsWith(BASE) && /(ayush|health|wellness|investment|opportunit|blog|scheme|incentive)/i.test(abs)) {
          links.add(abs.split('#')[0]);
        }
      });
    } catch { /* ignore */ }
  }
  return Array.from(links).slice(0, 60);
}

export async function parse(url) {
  const res = await http.get(url);
  const ctype = (res.headers['content-type'] || '').toLowerCase();
  if (ctype.includes('pdf')) {
    const title = url.split('/').pop() || 'Invest India Document';
    return { title, url, source: 'investindia', text: title };
  }

  const $ = cheerio.load(res.data);
  const title =
    $('h1, h2').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim();
  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('article, .node, .content, main').text().replace(/\s+/g, ' ').trim().slice(0, 1200);

  const dateStr = $('time[datetime]').attr('datetime') || '';
  const publishedAt = dateStr ? dayjs(dateStr).toDate() : undefined;

  return { title, url, source: 'investindia', publishedAt, text: `${title}. ${desc}` };
}

export const investIndiaAdapter = { key: 'investindia', discover, parse };
