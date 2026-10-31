import { useEffect, useMemo, useState } from 'react'
import provincesData from './data/provinces.json'
import destinationsData from './data/destinations.json'
import { Destination, Lang, Province } from './types'
import { t } from './i18n'
import { searchDestinations, searchProvinces } from './utils/search'
import { labelPoint, validateCollection } from './utils/geo'
import InteractiveMap from './components/InteractiveMap'

const provinces = provincesData as Province[]
const destinations = destinationsData as Destination[]
type Filter = 'all' | 'capital' | 'coastal'
const fromHash = () => { const m = location.hash.match(/province\/([a-z-]+)/); return m ? m[1] : null }

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState<string | null>(fromHash())
  const [fc, setFc] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [reset, setReset] = useState(0)

  useEffect(() => {
    fetch('/data/cambodia-admin1.geojson').then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((j) => { const v = validateCollection(j, provinces.map((p) => p.id)); if (v) setErr(v); else setFc(j) })
      .catch(() => setErr(t('en', 'dataErr')))
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.lang = lang }, [theme, lang])
  useEffect(() => { history.replaceState(null, '', sel ? `#/province/${sel}` : location.pathname) }, [sel])

  const list = useMemo(() => searchProvinces(provinces, q).filter((p) => filter === 'all' || (filter === 'capital' ? p.type === 'capital' : p.coastal)).sort((a, b) => a.en.localeCompare(b.en)), [q, filter])
  const dests = useMemo(() => searchDestinations(destinations, q), [q])
  const p = provinces.find((x) => x.id === sel)
  const name = (x: Province) => x[lang]
  const copy = () => { if (!p) return; const f = fc?.features.find((x: any) => x.properties.id === p.id); const [lng, lat] = f ? labelPoint(f.geometry) : [NaN, NaN]; navigator.clipboard.writeText(`${p.en} (${p.km}) — approx. label point ${lat.toFixed(4)}, ${lng.toFixed(4)}`) }

  return (
    <div className="app">
      <header className="nav">
        <strong className="logo">◈ Cambodia Explorer</strong>
        <span className="tag">Discover Cambodia, Province by Province.</span>
        <span className="spacer" />
        <button onClick={() => setLang(lang === 'en' ? 'km' : 'en')} aria-label="Switch language">{lang === 'en' ? 'ខ្មែរ' : 'EN'}</button>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
      </header>
      <aside className="side">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, 'search')} aria-label={t(lang, 'search')} />
        <div className="chips">{(['all', 'capital', 'coastal'] as Filter[]).map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{t(lang, f)}</button>)}</div>
        <small>{list.length} / {provinces.length} {t(lang, 'count')}</small>
        <ul>
          {list.map((x) => <li key={x.id}><button className={sel === x.id ? 'row on' : 'row'} onClick={() => setSel(x.id)}><span>{name(x)}</span><span className="km">{lang === 'en' ? x.km : x.en}</span>{x.type === 'capital' && <em>{t(lang, 'capital')}</em>}</button></li>)}
          {dests.map((d) => <li key={d.id}><button className="row dest" onClick={() => d.provinceId && setSel(d.provinceId)}><span>📍 {d.name}</span><small>{d.coordinates ? '' : t(lang, 'pending')}</small></button></li>)}
          {!list.length && !dests.length && <li className="empty">{t(lang, 'empty')}</li>}
        </ul>
      </aside>
      <main className="stage">
        {err ? <div className="state error" role="alert">{err}</div> : !fc ? <div className="state">{t(lang, 'loading')}</div> :
          <InteractiveMap fc={fc} selectedId={sel} onSelect={setSel} lang={lang} theme={theme} resetSignal={reset} />}
        <button className="reset" onClick={() => { setSel(null); setReset((n) => n + 1) }}>{t(lang, 'reset')}</button>
        {p && (
          <section className="panel" aria-live="polite">
            <button className="x" onClick={() => setSel(null)} aria-label="Close">×</button>
            <h2>{p.en}</h2><div className="km big">{p.km}</div>
            <p className="badge">{p.type === 'capital' ? t(lang, 'capitalUnit') : t(lang, 'province')}</p>
            <h3>{t(lang, 'overview')}</h3>
            <dl><dt>{t(lang, 'area')}</dt><dd>{t(lang, 'na')}</dd><dt>{t(lang, 'population')}</dt><dd>{t(lang, 'na')}</dd><dt>{t(lang, 'neighbors')}</dt><dd>{t(lang, 'na')}</dd></dl>
            <h3>{t(lang, 'attractions')}</h3>
            <ul>{destinations.filter((d) => d.provinceId === p.id).map((d) => <li key={d.id}>{d.name}<br /><small>{d.coordinates ? '' : t(lang, 'pending')}</small></li>)}
              {!destinations.some((d) => d.provinceId === p.id) && <li>{t(lang, 'na')}</li>}</ul>
            <button onClick={copy}>{t(lang, 'coords')}</button>
          </section>)}
      </main>
    </div>)
}
