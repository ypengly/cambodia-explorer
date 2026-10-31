import { Province, Destination } from '../types'
export const norm = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu, '')
export function searchProvinces(list: Province[], q: string): Province[] {
  const n = norm(q); if (!n) return list
  return list.filter((p) => [p.en, p.km, ...p.aliases].some((v) => norm(v).includes(n)))
}
export function searchDestinations(list: Destination[], q: string): Destination[] {
  const n = norm(q); return n ? list.filter((d) => norm(d.name).includes(n)) : []
}
