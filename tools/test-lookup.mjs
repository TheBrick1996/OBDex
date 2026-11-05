import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { proposeShortDescription } from './short-description-rules.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const catalog = read('../dist/lookup.json');
const review = read('../data/editorial/short-description-review.json');
const approved = read('../data/editorial/approved-short-descriptions.json').labels;
const index = new Map(catalog.codes.map(row => [row.code, row]));
assert.equal(index.size, 9533);
assert.equal(review.length, index.size);
assert.equal(Object.keys(approved).length, 20);
for (const row of review) {
  const exported = index.get(row.code);
  assert.equal(exported.short_description, row.short_description, row.code);
  assert.equal(exported.short_description_status, row.status, row.code);
  if (row.short_description) {
    assert(row.short_description.split(/\s+/).length < 10, row.code);
    assert.notEqual(row.short_description, row.title, row.code);
  }
  if (row.status === 'generated') {
    assert.equal(row.short_description, proposeShortDescription(row.title), row.code);
    // All numeric and letter component identifiers must survive generation.
    const identifiers = text => text.match(/\b(?:\d+|[A-Z])\b/g) ?? [];
    assert.deepEqual(identifiers(row.short_description), identifiers(row.title), row.code);
    if (row.title.includes('Particulate Matter')) assert(row.short_description.includes('Particulate Matter'), row.code);
  }
}
for (const [code, label] of Object.entries(approved)) {
  const row = index.get(code);
  assert.equal(row.short_description ?? row.title, label, code);
  assert.equal(row.short_description_status, 'user_approved', code);
}
console.log('OK: 9533 exports, 20 approved labels, generated qualifiers and fallback');
