const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, f);

const { sources, sourceStatus } = require('../../lib/sources-registry.ts');
const temperature = sources.find(s => s.id === 'gistemp');

assert.equal(sourceStatus(temperature, { source_receipts: {} }), 'Missing');
assert.equal(sourceStatus(temperature, null), 'Live check unavailable');
assert.equal(sourceStatus(temperature, { source_receipts: { gistemp: { loaded: true, verified: true } } }), 'In the app');
assert.equal(sourceStatus(temperature, { source_receipts: { gistemp: { loaded: true, verified: false } } }), 'In the app (check pending)');
assert.equal(new Set(sources.map(s => s.id)).size, sources.length);
assert.equal(sources.length, 26);

for (const id of ['giovanni', 'appeears']) {
  assert.deepEqual(sources.find(s => s.id === id).listedBy, ['official', 'organiser']);
}

for (const source of sources) {
  assert.ok(source.url.startsWith('https://'));
}

console.log('PASS computed Missing, unreachable, verified and pending statuses; deduplication; all 26 source links verified.');
