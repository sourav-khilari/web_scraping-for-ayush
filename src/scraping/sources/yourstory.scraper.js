import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';
import { SECTOR_KEYWORDS } from '../../common/constants.js';

const BASE = 'https://yourstory.com';

// Build a small set of discovery URLs.
// YourStory supports search via /search?query=TERM and also /tag/<tag> pages for common tags.
function buildDiscoveryUrls() {
  const queries = new Set();
  Object.values(SECTOR_KEYWORDS).forEach(arr => arr.forEach(q => queries.add(q)));
  const searchUrls = Array.from(queries).map(q => `${BASE}/search?query=${encodeURIComponent(q)}`);
  const tagUrls = ['ayurveda','yoga','homeopathy','siddha','unani','naturopathy']
    .map(t => `${BASE}/tag/${encodeURIComponent(t)}`);
  // Funding section also useful:
  const funding = [`${BASE}/tag/funding`, `${BASE}/tag/startup-funding`];
  return [...searchUrls, ...tagUrls, ...funding];
}

export async function discover() {
  const urls = buildDiscoveryUrls();
  const links = new Set();

  for (const u of urls) {
    try {
      const { data: html } = await http.get(u);
      const $ = cheerio.load(html);
      // generic selectors for story cards:
      $('a[href]').each((_i, el) => {
        const href = ($(el).attr('href') || '').trim();
        if (!href) return;
        const abs = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
        // keep only article-like paths
        if (abs.startsWith(BASE) && /yourstory\.com\/(.*\d{4}.*|stories|news|startup|smbstory|wellness|health)/i.test(abs)) {
          links.add(abs.split('#')[0]);
        }
      });
    } catch { /* skip */ }
  }
  return Array.from(links).slice(0, 60);
}

export async function parse(url) {
  const { data: html } = await http.get(url);
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim();

  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('[data-ys-component="story-content"], article, main').text().replace(/\s+/g, ' ').trim().slice(0, 1000);

  const dateStr =
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').attr('datetime') || '';
  const publishedAt = dateStr ? dayjs(dateStr).toDate() : undefined;

  return { title, url, source: 'yourstory', publishedAt, text: `${title}. ${desc}` };
}

export const yourStoryAdapter = { key: 'yourstory', discover, parse };
