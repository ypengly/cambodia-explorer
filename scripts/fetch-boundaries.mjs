// Usage: node scripts/fetch-boundaries.mjs [path/to/local.geojson]
// Downloads geoBoundaries (gbOpen, CC BY 4.0) KHM ADM1, matches each feature to
// provinces.json via names/aliases, fails on any mismatch, writes normalized GeoJSON.
import fs from 'node:fs'
const provinces = JSON.parse(fs.readFileSync('frontend/src/data/provinces.json', 'utf8'))
const norm = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
const index = new Map()
for (const p of provinces) for (const n of [p.en, ...p.aliases]) index.set(norm(n), p)
let meta = { source: 'local file', license: 'unknown - check manually' }, gj
if (process.argv[2]) gj = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
else {
  const api = await (await fetch('https://www.geoboundaries.org/api/current/gbOpen/KHM/ADM1/')).json()
  gj = await (await fetch(api.simplifiedGeometryGeoJSON || api.gjDownloadURL)).json()
  meta = { source: 'geoBoundaries gbOpen KHM ADM1', license: api.boundaryLicense, buildDate: api.buildDate, url: api.gjDownloadURL, fetchedAt: new Date().toISOString() }
}
const seen = new Set(), bad = []
const features = gj.features.map((f) => {
  const raw = f.properties.shapeName ?? f.properties.NAME_1 ?? f.properties.name
  const p = raw && index.get(norm(raw))
  if (!p) { bad.push(raw); return null }
  seen.add(p.id)
  return { type: 'Feature', geometry: f.geometry, properties: { id: p.id, name_en: p.en, name_km: p.km, type: p.type, sourceName: raw } }
}).filter(Boolean)
const missing = provinces.filter((p) => !seen.has(p.id)).map((p) => p.en)
if (bad.length || missing.length || features.length !== 25 || seen.size !== 25) {
  console.error('VALIDATION FAILED', { unmatchedSourceNames: bad, missingProvinces: missing, featureCount: features.length })
  console.error('Add verified spellings to "aliases" in provinces.json (never rename official names silently) and retry.')
  process.exit(1)
}
fs.writeFileSync('frontend/public/data/cambodia-admin1.geojson', JSON.stringify({ type: 'FeatureCollection', features }))
fs.writeFileSync('frontend/public/data/SOURCES.json', JSON.stringify(meta, null, 2))
console.log('OK: 25 features written.', meta)
