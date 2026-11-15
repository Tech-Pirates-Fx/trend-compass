import fs from 'node:fs';
import crypto from 'node:crypto';
const input = process.argv[2] || 'public/geography/countries-source.geojson';
const bytes = fs.readFileSync(input);
const geo = JSON.parse(bytes);
const rounded = value => Array.isArray(value) ? value.map(rounded) : Math.round(value * 1000) / 1000;
const features = geo.features.map(f => ({ type: 'Feature', properties: { name: f.properties.ADMIN, code: f.properties.ADM0_A3 }, geometry: { type: f.geometry.type, coordinates: rounded(f.geometry.coordinates) } })).sort((a,b) => a.properties.name.localeCompare(b.properties.name));
fs.writeFileSync('public/geography/countries.json', JSON.stringify({type:'FeatureCollection', features}));
console.log(JSON.stringify({source:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson', sha256:crypto.createHash('sha256').update(bytes).digest('hex'), retrieved:'2026-11-13', countries:features.length, inputBytes:bytes.length, outputBytes:fs.statSync('public/geography/countries.json').size}));
