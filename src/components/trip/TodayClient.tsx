'use client'

import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { MapPin, Navigation, CloudRain, ExternalLink } from 'lucide-react'
import { getMockWeather, mapsLink, cn } from '@/lib/utils'
import { useTripStore } from '@/store/trip-store'
import TimelineSlot from '@/components/trip/TimelineSlot'
import type { ItineraryDay } from '@/types'

interface Props {
  day: ItineraryDay
  tripSlug: string
  isActuallyToday: boolean
}

export default function TodayClient({ day, tripSlug, isActuallyToday }: Props) {
  const weather = getMockWeather(day.date)
  const { getStatus } = useTripStore()

  const doneCount = day.slots.filter((s) => getStatus(s.id) === 'done').length
  const progress = Math.round((doneCount / day.slots.length) * 100)

  const allActivitySlots = day.slots.filter((s) => s.activity_id && s.activity)
  const mapCenter = day.base_lat && day.base_lng
    ? `${day.base_lat},${day.base_lng}`
    : null

  return (
    <div className="px-4 pt-4 space-y-4">
      {!isActuallyToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          📅 Showing preview — trip starts {format(parseISO(day.date), 'MMMM d, yyyy')}
        </div>
      )}

      {/* Day hero */}
      <div className="bg-terracotta-400 rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative">
          <p className="text-terracotta-100 text-xs mb-1">
            {isActuallyToday ? 'Today' : 'Day ' + day.day_number} · {format(parseISO(day.date), 'EEEE, MMMM d')}
          </p>
          <h2 className="font-serif text-2xl font-semibold leading-tight mb-1">{day.label}</h2>
          {day.theme && <p className="text-terracotta-100 text-sm">{day.theme}</p>}
          <div className="flex items-center gap-1.5 mt-3 text-terracotta-100 text-xs">
            <MapPin size={12} />
            <span>{day.base_location}</span>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-terracotta-100 mb-1.5">
              <span>{doneCount} of {day.slots.length} done</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weather card */}
      <div className="card p-4 flex items-center gap-4">
        <div className="text-4xl">{weather.icon}</div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">
            {weather.temp_min}° – {weather.temp_max}°C
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{weather.description}</p>
          {weather.is_rainy && (
            <div className="flex items-center gap-1 mt-1.5 text-blue-600 text-xs">
              <CloudRain size={12} />
              <span>Indoor alternatives recommended</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-300 italic">mock</div>
      </div>

      {/* Quick map link */}
      {mapCenter && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${mapCenter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 card p-4 card-hover"
        >
          <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
            <Navigation size={18} className="text-forest-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-slate-900">Navigate to base</p>
            <p className="text-xs text-slate-400 mt-0.5">{day.base_location}</p>
          </div>
          <ExternalLink size={14} className="text-slate-300" />
        </a>
      )}

      {/* Full schedule */}
      <div>
        <h2 className="font-serif text-lg font-semibold text-slate-800 mb-3">Schedule</h2>
        {day.slots.map((slot, i) => (
          <TimelineSlot
            key={slot.id}
            slot={slot}
            tripSlug={tripSlug}
            isLast={i === day.slots.length - 1}
          />
        ))}
      </div>

      {/* Quick links for all activities */}
      {allActivitySlots.length > 0 && (
        <div>
          <h2 className="font-serif text-base font-semibold text-slate-800 mb-2">Quick access</h2>
          <div className="grid grid-cols-2 gap-2">
            {allActivitySlots.map((slot) => slot.activity && (
              <a
                key={slot.id}
                href={mapsLink(slot.activity.lat, slot.activity.lng, slot.activity.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 card p-3 card-hover"
              >
                <span className="text-xl">{slot.activity.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{slot.activity.title}</p>
                  <p className="text-xs text-slate-400">Open in Maps</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Rainy day alternatives link */}
      {weather.is_rainy && (
        <Link
          href={`/trip/${tripSlug}/explore?filter=rainy`}
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4"
        >
          <div className="text-2xl">🌧️</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Plan B — Rainy day alternatives</p>
            <p className="text-xs text-blue-600 mt-0.5">Indoor activities nearby</p>
          </div>
        </Link>
      )}
    </div>
  )
}
