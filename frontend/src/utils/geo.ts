type Geom = { type: string; coordinates: any }
export type BBox = [number, number, number, number]
export function bboxOf(g: Geom): BBox {
  let a = 180, b = 90, c = -180, d = -90
  const w = (x: any): void => { if (typeof x[0] === 'number') { a = Math.min(a, x[0]); c = Math.max(c, x[0]); b = Math.min(b, x[1]); d = Math.max(d, x[1]) } else x.forEach(w) }
  w(g.coordinates); return [a, b, c, d]
}
function ring(r: number[][]) {
  let A = 0, cx = 0, cy = 0
  for (let i = 0; i < r.length - 1; i++) { const [x0, y0] = r[i], [x1, y1] = r[i + 1], f = x0 * y1 - x1 * y0; A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f }
  A /= 2; return { area: Math.abs(A), c: [cx / (6 * A), cy / (6 * A)] as [number, number] }
}
/** Centroid of the largest outer ring (handles MultiPolygon/islands). For labels only; not survey-grade. */
export function labelPoint(g: Geom): [number, number] {
  const polys: number[][][][] = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  let best = { area: -1, c: [0, 0] as [number, number] }
  for (const p of polys) { const r = ring(p[0]); if (r.area > best.area) best = r }
  return best.c
}
export function validateCollection(fc: any, ids: string[]): string | null {
  if (!fc?.features || fc.features.length !== 25) return `Expected 25 features, got ${fc?.features?.length}`
  const seen = new Set<string>()
  for (const f of fc.features) {
    const id = f.properties?.id
    if (!ids.includes(id)) return `Unknown id ${id}`
    if (seen.has(id)) return `Duplicate id ${id}`
    seen.add(id)
    if (!['Polygon', 'MultiPolygon'].includes(f.geometry?.type)) return `Bad geometry for ${id}`
    const [a, b, c, d] = bboxOf(f.geometry)
    if (a < 101.5 || c > 108 || b < 9.8 || d > 15) return `${id} outside expected Cambodia extent`
  }
  return null
}
