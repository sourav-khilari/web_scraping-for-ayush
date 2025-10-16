import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';

const BASE = 'https://ayush.gov.in';

async function listCandidatePages() {
  return [
    BASE,
    `${BASE}/press-releases`,
    `${BASE}/whats-new`,
    `${BASE}/news`
  ];
}

async function discover() {
  const pages = await listCandidatePages();
  const links = new Set();

  for (const p of pages) {
    try {
      const { data: html } = await http.get(p);
      const $ = cheerio.load(html);
      $('a[href]').each((_i, el) => {
        const href = ($(el).attr('href') || '').trim();
        if (!href) return;
        const abs = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
        if (abs.startsWith(BASE) && /(press|news|whats-new|media|pdf|document)/i.test(abs)) {
          links.add(abs.split('#')[0]);
        }
      });
    } catch {
      // ignore that page
    }
  }
  console.log('[DEBUG] ayushmin.discover URLs:', Array.from(links).slice(0, 10)); // preview first 10
  return Array.from(links).slice(0, 80);
}

async function parse(url) {
  const res = await http.get(url);
  const ctype = (res.headers['content-type'] || '').toLowerCase();
  if (ctype.includes('pdf')) {
    const title = url.split('/').pop() || 'AYUSH Document';
    return { title, url, source: 'ayushmin', publishedAt: undefined, text: title };
  }

  const $ = cheerio.load(res.data);

  const title =
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim();

  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('article, .node, .content, .field--name-body').text().replace(/\s+/g, ' ').trim().slice(0, 1000);

  const dateStr = $('time[datetime]').attr('datetime') || $('[itemprop="datePublished"]').attr('content') || '';
  const publishedAt = dateStr ? dayjs(dateStr).toDate() : undefined;

  return { title, url, source: 'ayushmin', publishedAt, text: `${title}. ${desc}` };
}

export const ayushMinAdapter = { key: 'ayushmin', discover, parse };
