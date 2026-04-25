'use client'

import { useState } from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'
import { mapsLink, mapsDirectionsLink, cn } from '@/lib/utils'
import type { Activity } from '@/types'

interface Props {
  activities: Activity[]
  tripSlug: string
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

export default function MapClient({ activities, tripSlug }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedAct = activities.find((a) => a.id === selected)

  // Group by country
  const byCountry = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const key = a.country === 'Austria' ? '🇦🇹 Austria' : '🇩🇪 Germany'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  return (
    <div>
      {/* Map embed or placeholder */}
      <div className="mx-4 mt-4 mb-4 rounded-2xl overflow-hidden border border-sand-200 bg-white shadow-sm">
        {GOOGLE_MAPS_KEY ? (
          <iframe
            title="Trip map"
            width="100%"
            height="280"
            frameBorder={0}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=Hallstatt+Austria,Salzburg+Austria,Zell+am+See+Austria,Munich+Germany`}
          />
        ) : (
          <div className="h-64 bg-gradient-to-br from-forest-100 via-blue-50 to-sand-100 flex flex-col items-center justify-center gap-3 relative">
            {/* Decorative fake map pins */}
            {[
              { label: 'Salzburg', top: '25%', left: '58%' },
              { label: 'Flachau', top: '48%', left: '42%' },
              { label: 'Zell am See', top: '60%', left: '28%' },
              { label: 'Hallstatt', top: '40%', left: '66%' },
              { label: 'Munich', top: '18%', left: '22%' },
            ].map((pin) => (
              <div
                key={pin.label}
                className="absolute flex flex-col items-center"
                style={{ top: pin.top, left: pin.left }}
              >
                <div className="bg-white text-xs px-2 py-0.5 rounded-full shadow-sm font-medium text-slate-700 mb-1 whitespace-nowrap">
                  {pin.label}
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-forest-500 border-2 border-white shadow" />
              </div>
            ))}
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <div className="bg-white/90 text-xs text-slate-500 px-3 py-1.5 rounded-full border border-sand-200 flex items-center gap-1.5">
                <MapPin size={11} className="text-forest-500" />
                Add NEXT_PUBLIC_GOOGLE_MAPS_KEY for live map
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location list */}
      <div className="px-4 space-y-5 pb-4">
        {Object.entries(byCountry).map(([country, acts]) => (
          <div key={country}>
            <h2 className="font-serif text-[15px] font-semibold text-slate-700 mb-2">{country}</h2>
            <div className="space-y-2">
              {acts.map((act) => (
                <div
                  key={act.id}
                  className={cn(
                    'card p-3.5 cursor-pointer transition-all',
                    selected === act.id ? 'ring-2 ring-forest-400' : ''
                  )}
                  onClick={() => setSelected(selected === act.id ? null : act.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{act.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900">{act.title}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {act.location_name} · {act.lat.toFixed(4)}°N, {act.lng.toFixed(4)}°E
                      </p>
                    </div>
                    <MapPin size={14} className={selected === act.id ? 'text-forest-500' : 'text-slate-300'} />
                  </div>

                  {/* Expanded actions */}
                  {selected === act.id && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-sand-100">
                      <a
                        href={mapsDirectionsLink(act.lat, act.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-forest-600 text-white rounded-xl py-2.5 text-xs font-medium"
                      >
                        <Navigation size={13} />
                        Directions
                      </a>
                      <a
                        href={mapsLink(act.lat, act.lng, act.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-slate-600 rounded-xl py-2.5 text-xs font-medium"
                      >
                        <ExternalLink size={13} />
                        View on Maps
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
