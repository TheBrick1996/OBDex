// Export the local OBD-II lookup without repair estimates or vehicle status.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const reviewFile = `${root}/data/editorial/short-description-review.json`;
const review = new Map(existsSync(reviewFile)
  ? JSON.parse(readFileSync(reviewFile, 'utf8')).map(row => [row.code, row.status]) : []);
const codes = readdirSync(`${root}/data/generic`).filter(f => f.endsWith('.yaml'))
  .sort().flatMap(f => parse(readFileSync(`${root}/data/generic/${f}`, 'utf8')))
  .map(row => ({
    code: row.code,
    title: row.title.en,
    short_description: row.short_description?.en ?? null,
    short_description_status: review.get(row.code) ?? null,
    upstream_reviewed: row.reviewed ?? null,
    sources: row.sources,
  })).sort((a, b) => a.code.localeCompare(b.code));
const catalog = {
  source: 'https://github.com/foerbsnavi/OBDex',
  upstream_commit: '33bf65f7a23db2832c8fe11694e12a42eb3dd160',
  license: 'CC0-1.0',
  short_description_origin: 'FleetLytics downstream editorial extension',
  short_description_repository: 'https://github.com/TheBrick1996/OBDex',
  codes,
};
mkdirSync(`${root}/dist`, { recursive: true });
writeFileSync(`${root}/dist/lookup.json`, JSON.stringify(catalog, null, 2) + '\n');
const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
const csv = [['Code', 'Title', 'Short Description', 'Short Description Status', 'Upstream Reviewed', 'Sources'],
  ...codes.map(row => [row.code, row.title, row.short_description,
    row.short_description_status, row.upstream_reviewed, JSON.stringify(row.sources)])];
writeFileSync(`${root}/dist/lookup.csv`, csv.map(row => row.map(quote).join(',')).join('\n') + '\n');
console.log(`Exported ${codes.length} codes; ${codes.filter(c => c.short_description).length} short descriptions.`);
