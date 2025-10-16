// import { Item } from '../../domain/models/Item.js';
// import { logger } from '../../config/logger.js';
// import {
//   detectSector,
//   hasInvestmentSignal,
//   extractCompany,
//   extractInvestors,
//   extractAmountAndCurrency
// } from '../../domain/services/extract.service.js';
// import { scoreItem } from '../../domain/services/scoring.service.js';

// export async function runSource(adapter) {
//   const urls = await adapter.discover();
//   let saved = 0, skipped = 0, dup = 0, errors = 0;

//   for (const url of urls) {
//     try {
//       const normalized = await adapter.parse(url);
//       if (!normalized) { skipped++; continue; }

//       const blob = `${normalized.title} ${normalized.text || ''}`;
//       const sector = detectSector(blob);
//       const invest = hasInvestmentSignal(blob);

//       if (!sector || !invest) { skipped++; continue; }

//       const company = extractCompany(normalized.title) || undefined;
//       const investors = extractInvestors(blob);
//       const { amount, currency } = extractAmountAndCurrency(blob);
//       const score = scoreItem({ sectorMatch: true, investmentSignal: true, publishedAt: normalized.publishedAt });

//       // Upsert by URL only (NO HASH)
//       const r = await Item.updateOne(
//         { url: normalized.url },
//         {
//           $setOnInsert: {
//             title: normalized.title,
//             url: normalized.url,
//             source: adapter.key,
//             publishedAt: normalized.publishedAt,
//             sector,
//             investmentType: guessInvestmentType(blob),
//             company,
//             investor: investors,
//             amount,
//             currency,
//             summary: (normalized.text || '').slice(0, 400),
//             raw: {},
//             score
//           }
//         },
//         { upsert: true }
//       );

//       if (r.upsertedId) saved++; else dup++;

//     } catch (e) {
//       errors++;
//       logger.warn({ msg: 'pipeline.item_error', source: adapter.key, url, error: e?.message || String(e) });
//     }
//   }

//   logger.info({ msg: 'pipeline.run_done', source: adapter.key, urls: urls.length, saved, skipped, dup, errors });
//   return { urls: urls.length, saved, skipped, dup, errors };
// }

// function guessInvestmentType(text) {
//   const t = (text || '').toLowerCase();
//   if (/\bgrant|call for proposals|scheme|fund\b/.test(t)) return 'grant';
//   if (/\btender\b/.test(t)) return 'tender';
//   if (/\baccelerator|incubator|cohort|demo day\b/.test(t)) return 'accelerator';
//   if (/\braises|raised|seed|series|equity|angel|venture\b/.test(t)) return 'funding_round';
//   if (/\bevent|summit|conference|conclave\b/.test(t)) return 'event';
//   if (/\blisting|seeking investment\b/.test(t)) return 'listing';
//   return 'other';
// }


// import { Item } from '../../domain/models/Item.js';
// import { logger } from '../../config/logger.js';
// import {
//   detectSector,
//   hasInvestmentSignal,
//   extractCompany,
//   extractInvestors,
//   extractAmountAndCurrency
// } from '../../domain/services/extract.service.js';
// import { scoreItem } from '../../domain/services/scoring.service.js';

// const RELAX = process.env.RELAX_FILTER || 'none';
// const allowWithoutSector  = RELAX === 'sector' || RELAX === 'all';
// const allowWithoutInvest  = RELAX === 'invest' || RELAX === 'all';

// const DEBUG_SOURCES = (process.env.DEBUG_SCRAPER || '')
//   .split(',')
//   .map(s => s.trim())
//   .filter(Boolean);

// const DRY_RUN = process.env.DRY_RUN === '1';

// function shouldDebug(key) {
//   return DEBUG_SOURCES.length === 0 ? false : DEBUG_SOURCES.includes(key);
// }

// export async function runSource(adapter) {
//   const urls = await adapter.discover();
//   let saved = 0, skipped = 0, dup = 0, errors = 0;

//   if (shouldDebug(adapter.key)) {
//     console.log(`[DEBUG] Source ${adapter.key} → discovered ${urls.length} URLs`);
//   }

//   for (const url of urls) {
//     try {
//       const normalized = await adapter.parse(url);

//       if (shouldDebug(adapter.key)) {
//         console.log('\n[DEBUG] Parsed item (raw normalized):');
//         console.log(JSON.stringify(normalized, null, 2));
//       }

//       if (!normalized) { 
//         skipped++; 
//         continue; 
//       }

//       const blob = `${normalized.title} ${normalized.text || ''}`;
//       const sector = detectSector(blob);
//       const invest = hasInvestmentSignal(blob);

//       if (shouldDebug(adapter.key)) {
//         console.log('[DEBUG] Detection:', { sector, invest });
//       }

//       if ((!sector && !allowWithoutSector) || (!invest && !allowWithoutInvest)) {
//         skipped++;
//         continue;
//       }

//       const company = extractCompany(normalized.title) || undefined;
//       const investors = extractInvestors(blob);
//       const { amount, currency } = extractAmountAndCurrency(blob);
//       const score = scoreItem({ sectorMatch: true, investmentSignal: true, publishedAt: normalized.publishedAt });

//       const candidate = {
//         title: normalized.title,
//         url: normalized.url,
//         source: adapter.key,
//         publishedAt: normalized.publishedAt,
//         sector,
//         investmentType: guessInvestmentType(blob),
//         company,
//         investor: investors,
//         amount,
//         currency,
//         summary: (normalized.text || '').slice(0, 400),
//         raw: {},
//         score
//       };

//       if (shouldDebug(adapter.key)) {
//         console.log('[DEBUG] Candidate to save:');
//         console.log(JSON.stringify(candidate, null, 2));
//       }

//       if (DRY_RUN) {
//         // just print, do not write to DB
//         if (shouldDebug(adapter.key)) console.log('[DEBUG] DRY_RUN=1 → not writing to Mongo');
//         continue;
//       }

//       // Upsert by URL only (NO HASH)
//       const r = await Item.updateOne(
//         { url: normalized.url },
//         { $setOnInsert: candidate },
//         { upsert: true }
//       );

//       if (r.upsertedId) {
//         saved++;
//         if (shouldDebug(adapter.key)) console.log('[DEBUG] Saved new item.');
//       } else {
//         dup++;
//         if (shouldDebug(adapter.key)) console.log('[DEBUG] Duplicate (URL already exists).');
//       }

//     } catch (e) {
//       errors++;
//       logger.warn({ msg: 'pipeline.item_error', source: adapter.key, url, error: e?.message || String(e) });
//       if (shouldDebug(adapter.key)) console.log('[DEBUG] ERROR:', e?.message || String(e));
//     }
//   }

//   logger.info({ msg: 'pipeline.run_done', source: adapter.key, urls: urls.length, saved, skipped, dup, errors });
//   return { urls: urls.length, saved, skipped, dup, errors };
// }

// function guessInvestmentType(text) {
//   const t = (text || '').toLowerCase();
//   if (/\bgrant|call for proposals|scheme|fund\b/.test(t)) return 'grant';
//   if (/\btender\b/.test(t)) return 'tender';
//   if (/\baccelerator|incubator|cohort|demo day\b/.test(t)) return 'accelerator';
//   if (/\braises|raised|seed|series|equity|angel|venture\b/.test(t)) return 'funding_round';
//   if (/\bevent|summit|conference|conclave\b/.test(t)) return 'event';
//   if (/\blisting|seeking investment\b/.test(t)) return 'listing';
//   return 'other';
// }


import { Item } from '../../domain/models/Item.js';
import { logger } from '../../config/logger.js';
import {
  detectSector,
  hasInvestmentSignal,
  extractCompany,
  extractInvestors,
  extractAmountAndCurrency
} from '../../domain/services/extract.service.js';
import { scoreItem } from '../../domain/services/scoring.service.js';

// ⬇️ read the env flag
const INVEST_ONLY = process.env.INVEST_ONLY_MODE === '1';

export async function runSource(adapter) {
  const urls = await adapter.discover();
  let saved = 0, skipped = 0, dup = 0, errors = 0;

  for (const url of urls) {
    try {
      const normalized = await adapter.parse(url);
      if (!normalized) { skipped++; continue; }

      const blob = `${normalized.title} ${normalized.text || ''}`;

      // Always require investment signal
      const invest = hasInvestmentSignal(blob);
      if (!invest) { skipped++; continue; }

      // Sector can be missing in INVEST_ONLY mode
      let sector = detectSector(blob) || (INVEST_ONLY ? 'unknown' : null);
      if (!sector) { skipped++; continue; }

      const company = extractCompany(normalized.title) || undefined;
      const investors = extractInvestors(blob);
      const { amount, currency } = extractAmountAndCurrency(blob);

      // scoring: give full points only if a real AYUSH sector was detected
      const sectorMatch = sector !== 'unknown';
      const score = scoreItem({ sectorMatch, investmentSignal: true, publishedAt: normalized.publishedAt });

      const candidate = {
        title: normalized.title,
        url: normalized.url,
        source: adapter.key,
        publishedAt: normalized.publishedAt,
        sector, // may be 'unknown' in INVEST_ONLY mode
        investmentType: guessInvestmentType(blob),
        company,
        investor: investors,
        amount,
        currency,
        summary: (normalized.text || '').slice(0, 400),
        raw: {},
        score
      };

      const r = await Item.updateOne(
        { url: normalized.url },
        { $setOnInsert: candidate },
        { upsert: true }
      );

      if (r.upsertedId) saved++; else dup++;

    } catch (e) {
      errors++;
      logger.warn({ msg: 'pipeline.item_error', source: adapter.key, url, error: e?.message || String(e) });
    }
  }

  logger.info({ msg: 'pipeline.run_done', source: adapter.key, urls: urls.length, saved, skipped, dup, errors });
  return { urls: urls.length, saved, skipped, dup, errors };
}

function guessInvestmentType(text) {
  const t = (text || '').toLowerCase();
  if (/\bgrant|call for proposals|scheme|fund\b/.test(t)) return 'grant';
  if (/\btender\b/.test(t)) return 'tender';
  if (/\baccelerator|incubator|cohort|demo day\b/.test(t)) return 'accelerator';
  if (/\braises|raised|seed|series|equity|angel|venture\b/.test(t)) return 'funding_round';
  if (/\bevent|summit|conference|conclave\b/.test(t)) return 'event';
  if (/\blisting|seeking investment\b/.test(t)) return 'listing';
  return 'other';
}
