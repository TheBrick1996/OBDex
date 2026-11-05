import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Ajv from 'ajv/dist/2020.js';

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
