# Cambodia Explorer

Interactive map of Cambodia's 25 first-level units (24 provinces + Phnom Penh, the capital). English/Khmer, dark/light.

## Quick start
```bash
node scripts/fetch-boundaries.mjs        # Node 18+. Downloads geoBoundaries KHM ADM1 (CC BY 4.0), matches every feature
                                         # to provinces.json, FAILS on any mismatch. Or: node scripts/fetch-boundaries.mjs my.geojson
cd frontend && npm install && npm run dev   # http://localhost:5173
npm test                                     # vitest: counts, ids, Khmer, search, geo utils
cd ../backend && go test ./... && go run ./cmd/server   # optional API on :8080 (/api/health, /api/provinces?q=, /api/provinces/{id}, /api/geojson)
```
Production: `cd frontend && npm run build` → serve `dist/` (any static host); run the Go binary behind the same origin (`go build ./cmd/server`). Config via `.env.example`. No API keys or paid services: the map is drawn from GeoJSON only (no tiles).

## Data rules
- Boundaries: never hand-drawn. If the fetch fails, the UI shows an error instead of a fake map. The app also re-validates at load: exactly 25 features, unique known ids, polygon geometry, Cambodia extent.
- Names: `frontend/src/data/provinces.json` is the single source (used by frontend, script and Go). Source spellings go in `aliases`; official names are never silently changed. **Verify Khmer names and spellings against Cambodian government sources before publishing.**
- Area, population, neighbors, destination coordinates are intentionally **"Data not available"** / "pending verification" until you add sourced values (with year). Nothing is estimated.
- geoBoundaries geometry is simplified: not survey-grade. Attribution is shown on the map; fetch metadata is saved to `public/data/SOURCES.json`.

## Not implemented yet (honest list)
Cinematic hero, separate pages, layer toggles (rivers/roads/protected areas), basemap/satellite/terrain styles, statistics charts, province comparison, share-by-view (province hash links *are* supported), PostGIS (not needed until spatial queries/stats exist), Docker files, Khmer UI strings need native review, destination markers (await verified coordinates).
