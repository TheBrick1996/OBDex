import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import { proposeShortDescription } from './short-description-rules.mjs';

const schema = JSON.parse(readFileSync(new URL('../schema/code.schema.json', import.meta.url), 'utf8'));
const validate = new Ajv.default({ strict: false }).compile(schema);
const base = { code: 'P203F', category: 'powertrain', title: { en: 'Reductant Level Too Low' }, sources: ['https://example.com'] };
assert(validate(base), 'Existing entries remain valid without a summary');
assert(validate({ ...base, short_description: { en: 'Diesel exhaust fluid (DEF) level reported too low' } }));
assert(validate({ ...base, short_description: { en: 'one two three four five six seven eight nine' } }));
assert(!validate({ ...base, short_description: { en: 'one two three four five six seven eight nine ten' } }));
assert(!validate({ ...base, short_description: { en: '' } }));
assert(!validate({ ...base, short_description: { de: 'Niedriger Füllstand' } }));
console.log('OK: optional summary, English requirement, and nine-word boundary');
assert.equal(proposeShortDescription('Particulate Matter Sensor Circuit High'), null);
assert.equal(proposeShortDescription('Lost Communication With NOx Sensor B'), null);
assert.equal(proposeShortDescription('Reductant Heater B Sense Circuit Low'), 'DEF Heater B Sense Circuit Low');
assert.equal(proposeShortDescription('Diesel Particulate Filter Efficiency Below Threshold (Bank 1)'), 'Low DPF Efficiency (Bank 1)');
assert.equal(proposeShortDescription('Reductant Temperature Sensor A Circuit Range/Performance Bank 1 Sensor 2'), null,
  'Long summaries must fall back, not truncate bank/sensor qualifiers');
assert.equal(proposeShortDescription('Temperature Sensor A Circuit High Bank 1 Sensor 2'), 'Temp Sensor A Circuit High Bank 1 Sensor 2');
console.log('OK: familiar terms, failure modes, qualifiers, and fallback');
assert.equal(proposeShortDescription('Post Catalyst Fuel Trim System Too Lean (Bank 1)'), null);
