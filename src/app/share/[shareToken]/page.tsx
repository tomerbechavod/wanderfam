import { SEED_TRIP, SEED_DAYS, SEED_ACTIVITIES } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { MapPin, Calendar, Users } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { shareToken: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${SEED_TRIP.name} — Family Trip`,
    description: SEED_TRIP.tagline ?? 'View our family trip plan',
  }
}

export default async function SharePage({ params }: Props) {
  if (params.shareToken !== SEED_TRIP.share_token) notFound()

  const days = SEED_DAYS.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => ({
      ...slot,
      activity: slot.activity_id
        ? SEED_ACTIVITIES.find((a) => a.id === slot.activity_id) ?? null
        : null,
    })),
  }))

  return (
    <div className="min-h-screen bg-sand-50">
      <header className="bg-forest-600 text-white px-4 py-5">
        <div className="max-w-lg mx-auto">
          <p className="text-forest-200 text-xs mb-1 uppercase tracking-wider">Shared trip</p>
          <h1 className="font-serif text-2xl font-semibold">{SEED_TRIP.name}</h1>
          {SEED_TRIP.tagline && (
            <p className="text-forest-100 text-sm mt-1">{SEED_TRIP.tagline}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-forest-200 text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(parseISO(SEED_TRIP.start_date), 'MMM d')} –{' '}
              {format(parseISO(SEED_TRIP.end_date), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {SEED_TRIP.adults_count + SEED_TRIP.children_ages.length} travelers
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-10">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700 flex items-center gap-2">
          <span>👁️</span>
          <span>View-only — open on your phone for the best experience</span>
        </div>

        <div className="bg-forest-50 border border-forest-200 rounded-xl px-4 py-3 mb-5">
          <p className="font-medium text-sm text-forest-800 mb-1">📱 Save to your phone</p>
          <p className="text-xs text-forest-600">
            iPhone: tap Share → &quot;Add to Home Screen&quot; &nbsp;·&nbsp; Android: tap ⋮ → &quot;Add to Home screen&quot;
          </p>
        </div>

        <h2 className="font-serif text-lg font-semibold text-slate-800 mb-3">Full itinerary</h2>
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-card"
            >
              <div className="px-4 py-3 bg-sand-50 border-b border-sand-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    Day {day.day_number} · {day.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(parseISO(day.date), 'EEEE, MMMM d')} · {day.base_location}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-white rounded-full border border-sand-200 text-slate-500">
                  {day.slots.length} stops
                </span>
              </div>

              <div className="divide-y divide-sand-100">
                {day.slots.map((slot) => {
                  const activity = slot.activity
                  const title = activity?.title ?? slot.custom_note ?? 'Activity'
                  const emoji = activity?.emoji ?? (slot.is_meal ? '🍽️' : '📌')
                  return (
                    <div key={slot.id} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug">
                          {title}
                        </p>
                        {slot.start_time && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {slot.start_time}
                            {slot.end_time ? ` – ${slot.end_time}` : ''}
                          </p>
                        )}
                        {activity && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                              {activity.location_name}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-forest-600 flex items-center gap-0.5"
                            >
                              <MapPin size={10} /> Maps
                            </a>
                          </div>
                        )}
                        {slot.meal_suggestion && (
                          <p className="text-xs text-sand-600 mt-1 italic">
                            {slot.meal_suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-300 mt-8">
          Made with Wanderfam
        </p>
      </main>
    </div>
  )
}
