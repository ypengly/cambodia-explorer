import { useEffect, useRef } from 'react'
import maplibregl, { Map } from 'maplibre-gl'
import { Lang } from '../types'
import { bboxOf, labelPoint, BBox } from '../utils/geo'

interface Props { fc: any; selectedId: string | null; onSelect: (id: string) => void; lang: Lang; theme: 'dark' | 'light'; resetSignal: number }
const PALETTE = ['#0f766e', '#0e7490', '#047857', '#0369a1', '#15803d', '#0891b2']

export default function InteractiveMap({ fc, selectedId, onSelect, lang, theme, resetSignal }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<Map>()
  const labels = useRef<maplibregl.Marker[]>([])
  const hover = useRef<string | null>(null)
  const all = useRef<BBox>([102, 10, 108, 15])
  const prev = useRef<string | null>(null)

  useEffect(() => {
    // No tiles: drawn only from the verified GeoJSON, so no paid/third-party tile service is needed.
    const m = new maplibregl.Map({ container: el.current!, style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#07111F' } }] }, center: [104.9, 12.6], zoom: 5.5, attributionControl: false })
    map.current = m
    m.addControl(new maplibregl.AttributionControl({ customAttribution: 'Boundaries: geoBoundaries (CC BY 4.0), simplified, not survey-grade' }))
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    m.addControl(new maplibregl.FullscreenControl(), 'top-right')
    m.on('load', () => {
      fc.features.forEach((f: any, i: number) => (f.properties.fill = PALETTE[i % PALETTE.length]))
      m.addSource('adm1', { type: 'geojson', data: fc, promoteId: 'id' })
      m.addLayer({ id: 'fill', type: 'fill', source: 'adm1', paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.95, ['boolean', ['feature-state', 'hover'], false], 0.8, 0.55] } })
      m.addLayer({ id: 'line', type: 'line', source: 'adm1', paint: { 'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#F5C56B', '#38BDF8'], 'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 3, 1] } })
      const bb: BBox[] = fc.features.map((f: any) => bboxOf(f.geometry))
      all.current = [Math.min(...bb.map((b) => b[0])), Math.min(...bb.map((b) => b[1])), Math.max(...bb.map((b) => b[2])), Math.max(...bb.map((b) => b[3]))]
      m.fitBounds(all.current, { padding: 40, duration: 0 })
      const tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 })
      m.on('mousemove', 'fill', (e) => {
        const f = e.features![0]; const id = f.properties!.id as string
        if (hover.current && hover.current !== id) m.setFeatureState({ source: 'adm1', id: hover.current }, { hover: false })
        hover.current = id; m.setFeatureState({ source: 'adm1', id }, { hover: true }); m.getCanvas().style.cursor = 'pointer'
        tip.setLngLat(e.lngLat).setHTML(`<strong>${f.properties!.name_en}</strong><br/><span class="km">${f.properties!.name_km}</span><br/><small>${f.properties!.type === 'capital' ? 'Capital' : 'Province'}</small>`).addTo(m)
      })
      m.on('mouseleave', 'fill', () => { if (hover.current) m.setFeatureState({ source: 'adm1', id: hover.current }, { hover: false }); hover.current = null; tip.remove(); m.getCanvas().style.cursor = '' })
      m.on('click', 'fill', (e) => onSelect(e.features![0].properties!.id))
      // DOM-marker labels at computed label points (no glyph server dependency; Khmer renders via web fonts).
      labels.current = fc.features.map((f: any) => {
        const d = document.createElement('div'); d.className = 'plabel'; d.dataset.id = f.properties.id
        return new maplibregl.Marker({ element: d }).setLngLat(labelPoint(f.geometry)).addTo(m)
      })
      m.fire('labels-ready' as any)
      applySelection()
    })
    return () => m.remove()
  }, [fc])

  useEffect(() => {
    const m = map.current!
    const upd = () => { const z = m.getZoom(); labels.current.forEach((mk) => { const f = fc.features.find((x: any) => x.properties.id === mk.getElement().dataset.id); mk.getElement().textContent = f.properties[lang === 'km' ? 'name_km' : 'name_en']; mk.getElement().style.display = z >= 5.6 ? 'block' : 'none' }) }
    upd(); m.on('zoom', upd); m.on('labels-ready' as any, upd)
    return () => { m.off('zoom', upd); m.off('labels-ready' as any, upd) }
  }, [lang, fc])

  function applySelection() {
    const m = map.current; if (!m || !m.getSource('adm1')) return
    if (prev.current) m.setFeatureState({ source: 'adm1', id: prev.current }, { selected: false })
    if (selectedId) {
      m.setFeatureState({ source: 'adm1', id: selectedId }, { selected: true })
      const f = fc.features.find((x: any) => x.properties.id === selectedId)
      if (f) m.fitBounds(bboxOf(f.geometry), { padding: 60, maxZoom: 9, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900 })
    }
    prev.current = selectedId
  }
  useEffect(applySelection, [selectedId, fc])
  useEffect(() => { map.current?.fitBounds(all.current, { padding: 40 }) }, [resetSignal])
  useEffect(() => { const m = map.current; if (m?.getLayer('bg')) m.setPaintProperty('bg', 'background-color', theme === 'dark' ? '#07111F' : '#E6EEF5') }, [theme])
  return <div ref={el} className="map" role="application" aria-label="Interactive map of Cambodia" />
}
