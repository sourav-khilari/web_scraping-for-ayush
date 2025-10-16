import dayjs from 'dayjs';
import { INVESTMENT_KEYWORDS, SECTOR_KEYWORDS } from '../../common/constants.js';

export function detectSector(text) {
  const t = normalize(text);
  for (const [sector, keys] of Object.entries(SECTOR_KEYWORDS)) {
    for (const k of keys) {
      if (hasWord(t, k)) return sector;
    }
  }
  return null;
}

export function hasInvestmentSignal(text) {
  const t = normalize(text);
  return INVESTMENT_KEYWORDS.some(k => hasWord(t, k));
}

export function extractCompany(title) {
  const t = (title || '').trim();
  const m1 = t.match(/^(.+?)\s+(raises|raised|bags|secures)\b/i);
  if (m1) return m1[1].replace(/[,.:]+$/, '').trim();
  const m2 = t.match(/for\s+([A-Z][A-Za-z0-9&.\- ]{2,})/i);
  if (m2) return m2[1].trim();
  return undefined;
}

export function extractInvestors(text) {
  const t = text || '';
  const inv = new Set();
  const led = t.match(/led by\s+([A-Z][\w&.\- ]+)/i);
  if (led) inv.add(led[1].trim());
  const from = t.match(/from\s+([A-Z][\w&.\- ,&]+)/i);
  if (from) inv.add(from[1].trim());
  return Array.from(inv);
}

export function extractAmountAndCurrency(text) {
  // Support INR lakh/crore and USD million/billion
  const t = text || '';
  const crore = /(?:₹|Rs\.?\s*)?([0-9]+(?:\.[0-9]+)?)\s*(crore|cr)\b/i;
  const lakh  = /(?:₹|Rs\.?\s*)?([0-9]+(?:\.[0-9]+)?)\s*(lakh|lac)\b/i;
  const usd   = /\$?\s*([0-9]+(?:\.[0-9]+)?)\s*(million|billion|mn|bn)\s*(?:USD|\$)?/i;

  const c = t.match(crore);
  if (c) return { amount: Math.round(parseFloat(c[1]) * 1e7), currency: 'INR' };

  const l = t.match(lakh);
  if (l) return { amount: Math.round(parseFloat(l[1]) * 1e5), currency: 'INR' };

  const u = t.match(usd);
  if (u) {
    const val = parseFloat(u[1]);
    const mult = /billion|bn/i.test(u[2]) ? 1e9 : 1e6;
    return { amount: Math.round(val * mult), currency: 'USD' }; // no FX conversion
  }
  return {};
}

export function parseDateLoose(s) {
  if (!s) return undefined;
  const d = dayjs(s);
  return d.isValid() ? d.toDate() : undefined;
}

function normalize(t) { return (t || '').toLowerCase(); }
function hasWord(t, k) {
  return new RegExp(`\\b${escapeRegExp((k || '').toLowerCase())}\\b`).test(t);
}
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
