import { describe, it, expect } from 'vitest'
import provinces from '../data/provinces.json'
import destinations from '../data/destinations.json'
import { searchProvinces } from '../utils/search'
import { validateCollection, bboxOf, labelPoint } from '../utils/geo'
const P = provinces as any[]
describe('province metadata', () => {
  it('has 25 unique units: 24 provinces + Phnom Penh as capital', () => {
    expect(P).toHaveLength(25)
    expect(new Set(P.map((p) => p.id)).size).toBe(25)
    expect(P.filter((p) => p.type === 'capital').map((p) => p.id)).toEqual(['phnom-penh'])
    for (const id of ['kep', 'pailin', 'tboung-khmum']) expect(P.some((p) => p.id === id)).toBe(true)
  })
  it('every unit has Khmer text', () => P.forEach((p) => expect(p.km).toMatch(/[\u1780-\u17FF]/)))
  it('destinations reference real provinces', () => destinations.forEach((d: any) => d.provinceId && expect(P.some((p) => p.id === d.provinceId)).toBe(true)))
})
describe('search', () => {
  it('finds Siem Reap in English and Khmer', () => {
    expect(searchProvinces(P, 'Siem Reap')[0].id).toBe('siem-reap')
    expect(searchProvinces(P, 'សៀមរាប')[0].id).toBe('siem-reap')
  })
  it('accent/alias tolerant', () => { expect(searchProvinces(P, 'kratie')[0].id).toBe('kratie'); expect(searchProvinces(P, 'sihanoukville')[0].id).toBe('preah-sihanouk') })
  it('returns empty for nonsense', () => expect(searchProvinces(P, 'zzzz')).toHaveLength(0))
})
describe('geo utils', () => {
  const sq = { type: 'Polygon', coordinates: [[[104, 11], [105, 11], [105, 12], [104, 12], [104, 11]]] }
  it('bbox and label point', () => { expect(bboxOf(sq)).toEqual([104, 11, 105, 12]); const [x, y] = labelPoint(sq); expect(x).toBeCloseTo(104.5); expect(y).toBeCloseTo(11.5) })
  it('rejects wrong feature count', () => expect(validateCollection({ features: [] }, P.map((p) => p.id))).toMatch(/Expected 25/))
})
