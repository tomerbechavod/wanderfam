'use client'

import { useState, useRef, useEffect } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { MapPin, CloudRain } from 'lucide-react'
import { cn, getMockWeather } from '@/lib/utils'
import TimelineSlot from '@/components/trip/TimelineSlot'
import type { ItineraryDay } from '@/types'

interface Props {
  days: ItineraryDay[]
  tripSlug: string
  initialDayId: string
}

const PHASE_COLORS: Record<string, string> = {
  transit: 'bg-slate-100 text-slate-600 border-slate-200',
  austria: 'bg-forest-50 text-forest-700 border-forest-200',
  munich: 'bg-blue-50 text-blue-700 border-blue-200',
}

export default function ItineraryClient({ days, tripSlug, initialDayId }: Props) {
  const [activeDayId, setActiveDayId] = useState(initialDayId || days[0]?.id)
  const chipRef = useRef<HTMLDivElement>(null)

  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0]
  const weather = activeDay ? getMockWeather(activeDay.date) : null

  // Scroll active chip into view
  useEffect(() => {
    const el = chipRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeDayId])

  // Auto-select today's day on mount
  useEffect(() => {
    const todayDay = days.find((d) => isToday(parseISO(d.date)))
    if (todayDay) setActiveDayId(todayDay.id)
  }, [days])

  return (
    <div>
      {/* Day chips */}
      <div
        ref={chipRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-sand-200 bg-white sticky top-14 z-30"
      >
        {days.map((day) => {
          const active = day.id === activeDayId
          const today = isToday(parseISO(day.date))
          return (
            <button
              key={day.id}
              data-active={active}
              onClick={() => setActiveDayId(day.id)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl border text-xs transition-all tap-target',
                active
                  ? 'bg-forest-600 text-white border-forest-600'
                  : today
                  ? 'bg-forest-50 text-forest-700 border-forest-300'
                  : 'bg-white text-slate-500 border-sand-200'
              )}
            >
              <span className="font-semibold text-sm leading-none">
                {format(parseISO(day.date), 'd')}
              </span>
              <span className="mt-0.5 opacity-80">{format(parseISO(day.date), 'EEE')}</span>
              {today && !active && (
                <div className="w-1 h-1 rounded-full bg-forest-500 mt-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {activeDay && (
        <div className="px-4 pt-4">
          {/* Day header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-serif text-xl font-semibold text-slate-900">{activeDay.label}</h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                <MapPin size={11} />
                <span>{activeDay.base_location}</span>
              </div>
              {activeDay.theme && (
                <p className="text-xs text-slate-500 italic mt-1">"{activeDay.theme}"</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={cn(
                  'badge text-xs',
                  PHASE_COLORS[activeDay.phase]
                )}
              >
                {activeDay.phase === 'transit' ? '✈️ Transit' : activeDay.phase === 'austria' ? '🇦🇹 Austria' : '🇩🇪 Munich'}
              </span>
              {weather && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {weather.icon} {weather.temp_min}–{weather.temp_max}°C
                </span>
              )}
            </div>
          </div>

          {/* Rainy day warning */}
          {weather?.is_rainy && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-3">
              <CloudRain size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Rain expected — consider indoor alternatives below
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="pt-1">
            {activeDay.slots.map((slot, i) => (
              <TimelineSlot
                key={slot.id}
                slot={slot}
                tripSlug={tripSlug}
                isLast={i === activeDay.slots.length - 1}
              />
            ))}
          </div>

          {/* Day nav buttons */}
          <div className="flex gap-3 mt-4 pb-2">
            {days.findIndex((d) => d.id === activeDayId) > 0 && (
              <button
                onClick={() => {
                  const idx = days.findIndex((d) => d.id === activeDayId)
                  setActiveDayId(days[idx - 1].id)
                }}
                className="flex-1 py-2.5 rounded-xl border border-sand-200 text-sm text-slate-500 bg-white hover:bg-sand-50 transition-colors"
              >
                ← Previous day
              </button>
            )}
            {days.findIndex((d) => d.id === activeDayId) < days.length - 1 && (
              <button
                onClick={() => {
                  const idx = days.findIndex((d) => d.id === activeDayId)
                  setActiveDayId(days[idx + 1].id)
                }}
                className="flex-1 py-2.5 rounded-xl bg-forest-600 text-sm text-white hover:bg-forest-700 transition-colors"
              >
                Next day →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
