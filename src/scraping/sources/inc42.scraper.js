import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import { http } from '../core/http.js';
import { SECTOR_KEYWORDS } from '../../common/constants.js';

const BASE = 'https://inc42.com';

function buildSearchUrls() {
  const qs = new Set();
  Object.values(SECTOR_KEYWORDS).forEach(arr => arr.forEach(q => qs.add(q)));
  return Array.from(qs).map(q => `${BASE}/?s=${encodeURIComponent(q)}`);
}

async function discover() {
  const urls = buildSearchUrls();
  const articleLinks = new Set();

  for (const u of urls) {
    try {
      const { data: html } = await http.get(u);
      const $ = cheerio.load(html);
      $('article a, h2 a, h3 a').each((_i, el) => {
        const href = ($(el).attr('href') || '').trim();
        if (href && href.startsWith('https://inc42.com/')) {
          articleLinks.add(href.split('#')[0]);
        }
      });
    } catch {
      // skip that page
    }
  }
  console.log('[DEBUG] inc42.discover URLs:', Array.from(articleLinks).slice(0, 10)); // preview first 10
  return Array.from(articleLinks).slice(0, 60);
}

async function parse(url) {
  const { data: html } = await http.get(url);
  if (!html) return null;

  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim();

  if (!title) return null;

  const desc =
    $('meta[name="description"]').attr('content') ||
    $('article').text().replace(/\s+/g, ' ').trim().slice(0, 800);

  const dateMeta =
    $('meta[property="article:published_time"]').attr('content') ||
    $('time[datetime]').attr('datetime') ||
    '';

  const publishedAt = dateMeta ? dayjs(dateMeta).toDate() : undefined;

  return { title, url, source: 'inc42', publishedAt, text: `${title}. ${desc}` };
}

export const inc42Adapter = { key: 'inc42', discover, parse };
