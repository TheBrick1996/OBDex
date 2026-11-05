import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { proposeShortDescription } from './short-description-rules.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const approved = JSON.parse(readFileSync(`${root}/data/editorial/approved-short-descriptions.json`, 'utf8')).labels;
const review = [];
for (const file of readdirSync(`${root}/data/generic`).filter(f => f.endsWith('.yaml'))) {
  const path = `${root}/data/generic/${file}`;
  let raw = readFileSync(path, 'utf8');
  const rows = parse(raw);
  const summaries = new Map();
  for (const row of rows) {
    const approvedLabel = approved[row.code];
    const label = approvedLabel ?? proposeShortDescription(row.title.en);
    const summary = label && label !== row.title.en ? label : null;
    if (summary && summary.split(/\s+/).length >= 10) throw new Error(`Too long: ${row.code}`);
    // Only edit the English field; leave translations and original prose intact.
    if (row.short_description && Object.keys(row.short_description).some(k => k !== 'en')) {
      throw new Error(`Preserve translated summaries manually: ${row.code}`);
    }
    summaries.set(row.code, summary);
    review.push({ code: row.code, title: row.title.en, short_description: summary,
      status: approvedLabel ? 'user_approved' : summary ? 'generated' : 'title_fallback' });
  }
  raw = raw.replace(/^- code: ([A-Z0-9]+)\n[\s\S]*?(?=^- code: |$(?![\s\S]))/gm, (original, code) => {
    let block = original.replace(/\n  short_description:\n    en: [^\n]+\n/, '\n');
    const summary = summaries.get(code);
    if (summary) block = block.replace(`- code: ${code}\n`,
      `- code: ${code}\n  short_description:\n    en: ${JSON.stringify(summary)}\n`);
    return block;
  });
  writeFileSync(path, raw);
}
review.sort((a, b) => a.code.localeCompare(b.code));
writeFileSync(`${root}/data/editorial/short-description-review.json`, JSON.stringify(review, null, 2) + '\n');
console.log(JSON.stringify(review.reduce((counts, row) => {
  counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}, {}), null, 2));
