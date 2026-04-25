'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, ExternalLink, Save, Edit3, X, ChevronDown } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface TripSettings {
  hotel_flachau: string
  hotel_munich: string
  arrival_time: string
  departure_time: string
  flight_arrival: string
  flight_departure: string
  adults: number
  children: number
}

const DEFAULT_SETTINGS: TripSettings = {
  hotel_flachau: 'Sonnberg Ferienanlage',
  hotel_munich: 'Hotel Motel One München-City',
  arrival_time: '14:00',
  departure_time: '09:00',
  flight_arrival: '',
  flight_departure: '',
  adults: 10,
  children: 8,
}

const FLACHAU_HOTELS = [
  { name: 'Sonnberg Ferienanlage', rating: 4.8, type: 'צימר / אפרטמנט' },
  { name: 'Hotel Felsenhof', rating: 4.8, type: 'מלון משפחות ⭐ מומלץ מאוד' },
  { name: 'Hotel Tirolerhof', rating: 4.8, type: 'מלון עם ספא ובריכה' },
  { name: 'das Goldners', rating: 4.9, type: 'מלון בוטיק קטן' },
  { name: 'Landhotel Hinteraigengut', rating: 4.8, type: 'חווה אלפינית' },
  { name: 'Hotel loj', rating: 4.6, type: 'מלון עם מסעדה' },
  { name: 'Hotel Flachauerhof', rating: 4.6, type: 'מלון עם ספא' },
  { name: 'Stadler Aparthotel', rating: 4.8, type: 'אפרטמנטים' },
  { name: 'Hotel Garni Tannenhof', rating: 4.4, type: 'פנסיון קטן' },
  { name: 'אחר (הכנס ידנית)', rating: 0, type: '' },
]

const MUNICH_HOTELS = [
  { name: 'Hotel Motel One München-City', rating: 4.3, type: 'מלון עיר מרכזי' },
  { name: 'Platzl Hotel', rating: 4.5, type: 'ליד מריינפלץ ⭐ מומלץ' },
  { name: 'Holiday Inn Munich City Centre', rating: 4.2, type: 'מלון שרשרת מרכזי' },
  { name: 'Hilton Munich City', rating: 4.4, type: 'הילטון ליד הנהר' },
  { name: 'Hotel Eder', rating: 4.4, type: 'מלון נעים ליד המרכז' },
  { name: 'Hotel Europäischer Hof', rating: 4.3, type: 'ליד תחנת הרכבת' },
  { name: 'Brunnenhof City Center Hotel', rating: 4.1, type: 'מלון תקציב' },
  { name: 'אחר (הכנס ידנית)', rating: 0, type: '' },
]

function HotelDropdown({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: typeof FLACHAU_HOTELS
  label: string
}) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const [customVal, setCustomVal] = useState('')

  const selected = options.find(o => o.name === value)
  const isCustom = !selected && value !== ''

  useEffect(() => {
    if (isCustom) { setCustom(true); setCustomVal(value) }
  }, [])

  return (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {custom || isCustom ? (
        <div className="flex gap-2">
          <input
            value={customVal}
            onChange={e => { setCustomVal(e.target.value); onChange(e.target.value) }}
            className="flex-1 border border-sand-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-forest-400"
            placeholder="שם המלון"
            autoFocus
          />
          <button onClick={() => { setCustom(false); setCustomVal(''); onChange(options[0].name) }}
            className="text-xs text-slate-400 px-2">✕</button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between border border-sand-300 rounded-xl px-3 py-2.5 text-sm bg-white text-right"
          >
            <span className="font-medium text-slate-900 truncate">{value || 'בחר מלון'}</span>
            <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute z-50 top-full mt-1 w-full bg-white border border-sand-200 rounded-xl shadow-lg overflow-hidden">
              {options.map(opt => (
                <button
                  key={opt.name}
                  onClick={() => {
                    if (opt.name === 'אחר (הכנס ידנית)') {
                      setCustom(true); setOpen(false)
                    } else {
                      onChange(opt.name); setOpen(false)
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-sand-50 text-right border-b border-sand-100 last:border-0"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{opt.name}</p>
                    {opt.type && <p className="text-xs text-slate-400">{opt.type}</p>}
                  </div>
                  {opt.rating > 0 && (
                    <span className="text-xs font-medium text-amber-600 flex-shrink-0 ml-2">⭐ {opt.rating}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const [settings, setSettings] = useState<TripSettings>(DEFAULT_SETTINGS)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<TripSettings>(DEFAULT_SETTINGS)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('wanderfam-settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      setSettings(parsed)
      setDraft(parsed)
    }
  }, [])

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/fam2026alps`
    : 'https://wanderfam.vercel.app/share/fam2026alps'

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const save = () => {
    setSettings(draft)
    localStorage.setItem('wanderfam-settings', JSON.stringify(draft))
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cancel = () => {
    setDraft(settings)
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={params.slug} showBack backHref={`/trip/${params.slug}`} title="הגדרות הטיול" />
      <main className="max-w-lg mx-auto pb-24 px-4 pt-4 space-y-4">

        {/* Trip Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-lg font-semibold text-slate-800">פרטי הטיול</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-forest-600 border border-forest-300 px-3 py-1.5 rounded-xl">
                <Edit3 size={14} /> עריכה
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={save}
                  className="flex items-center gap-1.5 text-sm bg-forest-600 text-white px-3 py-1.5 rounded-xl">
                  <Save size={14} /> שמור
                </button>
                <button onClick={cancel}
                  className="flex items-center gap-1.5 text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl">
                  <X size={14} /> ביטול
                </button>
              </div>
            )}
          </div>

          {saved && (
            <div className="bg-forest-50 border border-forest-200 rounded-xl px-4 py-2 mb-3 text-sm text-forest-700 flex items-center gap-2">
              <Check size={14} /> נשמר בהצלחה!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-100">

            {/* Hotel Flachau */}
            <div className="p-4">
              {editing ? (
                <HotelDropdown
                  label="🏔️ מלון / צימר באוסטריה (פלכאו)"
                  value={draft.hotel_flachau}
                  onChange={v => setDraft({ ...draft, hotel_flachau: v })}
                  options={FLACHAU_HOTELS}
                />
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-1">🏔️ מלון באוסטריה (פלכאו)</p>
                  <p className="text-sm font-medium text-slate-900">{settings.hotel_flachau}</p>
                </>
              )}
            </div>

            {/* Hotel Munich */}
            <div className="p-4">
              {editing ? (
                <HotelDropdown
                  label="🏙️ מלון במינכן"
                  value={draft.hotel_munich}
                  onChange={v => setDraft({ ...draft, hotel_munich: v })}
                  options={MUNICH_HOTELS}
                />
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-1">🏙️ מלון במינכן</p>
                  <p className="text-sm font-medium text-slate-900">{settings.hotel_munich}</p>
                </>
              )}
            </div>

            {/* Flight Arrival */}
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-1">✈️ טיסת הגעה (18 אוגוסט)</p>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">מספר טיסה</p>
                    <input value={draft.flight_arrival}
                      onChange={e => setDraft({ ...draft, flight_arrival: e.target.value })}
                      className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-forest-400"
                      placeholder="LY123" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">שעת נחיתה</p>
                    <input type="time" value={draft.arrival_time}
                      onChange={e => setDraft({ ...draft, arrival_time: e.target.value })}
                      className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-forest-400" />
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-900">
                  {settings.flight_arrival ? settings.flight_arrival + ' · ' : ''}{settings.arrival_time}
                </p>
              )}
            </div>

            {/* Flight Departure */}
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-1">✈️ טיסת חזרה (26 אוגוסט)</p>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">מספר טיסה</p>
                    <input value={draft.flight_departure}
                      onChange={e => setDraft({ ...draft, flight_departure: e.target.value })}
                      className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-forest-400"
                      placeholder="LY124" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">שעת המראה</p>
                    <input type="time" value={draft.departure_time}
                      onChange={e => setDraft({ ...draft, departure_time: e.target.value })}
                      className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-forest-400" />
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-900">
                  {settings.flight_departure ? settings.flight_departure + ' · ' : ''}{settings.departure_time}
                </p>
              )}
            </div>

            {/* Travelers */}
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-2">👥 מספר נוסעים</p>
              {editing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">מבוגרים</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDraft(d => ({ ...d, adults: Math.max(1, d.adults - 1) }))}
                        className="w-8 h-8 rounded-full border border-sand-300 text-slate-600 flex items-center justify-center text-lg">−</button>
                      <span className="font-semibold w-6 text-center">{draft.adults}</span>
                      <button onClick={() => setDraft(d => ({ ...d, adults: d.adults + 1 }))}
                        className="w-8 h-8 rounded-full border border-sand-300 text-slate-600 flex items-center justify-center text-lg">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">ילדים</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDraft(d => ({ ...d, children: Math.max(0, d.children - 1) }))}
                        className="w-8 h-8 rounded-full border border-sand-300 text-slate-600 flex items-center justify-center text-lg">−</button>
                      <span className="font-semibold w-6 text-center">{draft.children}</span>
                      <button onClick={() => setDraft(d => ({ ...d, children: d.children + 1 }))}
                        className="w-8 h-8 rounded-full border border-sand-300 text-slate-600 flex items-center justify-center text-lg">+</button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-900">
                  {settings.adults} מבוגרים · {settings.children} ילדים · סה"כ {settings.adults + settings.children} איש
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Share */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">שיתוף עם המשפחה</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-4 space-y-3">
            <p className="text-sm text-slate-600">שלח את הקישור הזה למשפחה — הם יקבלו גישה לכל התוכנית.</p>
            <div className="flex items-center gap-2 bg-sand-50 border border-sand-200 rounded-xl p-3">
              <p className="text-xs text-forest-700 flex-1 break-all font-mono">{shareUrl}</p>
              <button onClick={copy}
                className="flex-shrink-0 flex items-center gap-1 text-xs bg-forest-600 text-white px-3 py-1.5 rounded-lg">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'הועתק!' : 'העתק'}
              </button>
            </div>
          </div>
        </div>

        {/* Add to Home Screen */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">הוספה למסך הבית</h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-4 space-y-3">
            {[
              { n: 1, text: 'iPhone: לחץ על כפתור השיתוף → "הוסף למסך הבית" → הוסף' },
              { n: 2, text: 'Android: לחץ על שלוש נקודות → "הוסף למסך הבית"' },
              { n: 3, text: 'האפליקציה תיפתח במסך מלא — בדיוק כמו אפליקציה רגילה!' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-forest-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">חיבורי API</h2>
          <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-100">
            {[
              { icon: '🗺️', name: 'Google Maps', desc: 'מפה חיה + ניווט', docs: 'https://developers.google.com/maps' },
              { icon: '🌤️', name: 'OpenWeatherMap', desc: 'תחזית אמיתית לכל יום', docs: 'https://openweathermap.org/api' },
            ].map(api => (
              <div key={api.name} className="p-4 flex items-center gap-3">
                <span className="text-xl">{api.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{api.name}</p>
                  <p className="text-xs text-slate-400">{api.desc}</p>
                </div>
                <a href={api.docs} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-forest-600 flex items-center gap-0.5">
                  הגדרה <ExternalLink size={9} />
                </a>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4">Wanderfam v0.1</p>
      </main>
    </div>
  )
}
