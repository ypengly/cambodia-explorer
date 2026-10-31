export type Lang = 'en' | 'km'
export interface Province { id: string; en: string; km: string; type: 'province' | 'capital'; coastal: boolean; aliases: string[] }
export interface Destination { id: string; name: string; provinceId: string | null; category: string; coordinates: [number, number] | null; note?: string }
