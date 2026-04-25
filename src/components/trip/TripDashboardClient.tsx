'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO, differenceInDays, isToday as dateFnsIsToday } from 'date-fns'
import { MapPin, Users, Calendar, ChevronRight, Star, Heart } from 'lucide-react'
import { useTripStore } from '@/store/trip-store'
import ActivityCard from '@/components/activity/ActivityCard'
import TimelineSlot from '@/components/trip/TimelineSlot'
import { getMockWeather, formatDate } from '@/lib/utils'
import type { TripWithDays, Activity } from '@/types'

interface Props {
  trip: TripWithDays
  activities: Activity[]
}

export default function TripDashboardClient({ trip, activities }: Props) {
  const { setTrip, setDays, setActivities, favoriteIds } = useTripStore()

  useEffect(() => {
    setTrip(trip)
    setDays(trip.days)
    setActivities(activities)
  }, [trip, activities, setTrip, setDays, setActivities])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayDay = trip.days.find((d) => d.date === today)
  const nextDay = trip.days.find((d) => d.date >= today) ?? trip.days[0]
  const displayDay = todayDay ?? nextDay

  const weather = displayDay ? getMockWeather(displayDay.date) : null

  const totalDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1
  const daysUntil = differenceInDays(parseISO(trip.start_date), new Date())
  const tripStarted = daysUntil <= 0

  const highlightActivities = activities
    .filter((a) => a.google_rating && a.google_rating >= 4.7)
    .slice(0, 5)

  const rainyDayAlts = activities.filter((a) => a.is_rainy_day_alt)
  const favoriteActivities = activities.filter((a) => favoriteIds.includes(a.id))

  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="mx-4 mt-4 mb-3 bg-forest-600 rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-serif text-2xl font-semibold leading-tight">{trip.name}</h2>
              {trip.tagline && (
                <p className="text-forest-200 text-xs mt-1 leading-relaxed">{trip.tagline}</p>
              )}
            </div>
            <span className="text-4xl">{trip.cover_emoji}</span>
          </div>
          <div className="flex items-center gap-3 mt-3 mb-4 text-forest-100 text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(trip.start_date, 'MMM d')} – {formatDate(trip.end_date, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {trip.adults_count + trip.children_ages.length} travelers
            </span>
          </div>
          {!tripStarted ? (
            <div className="bg-white/20 rounded-2xl px-4 py-2.5 text-center">
              <p className="text-white/80 text-xs">Trip starts in</p>
              <p className="text-white text-xl font-semibold">{daysUntil} days</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: totalDays, label: 'Days' },
                { n: activities.length, label: 'Activities' },
                { n: trip.destinations?.length ?? 0, label: 'Destinations' },
              ].map(({ n, label }) => (
                <div key={label} className="bg-white/20 rounded-xl py-2 text-center">
                  <div className="text-lg font-semibold">{n}</div>
                  <div className="text-[10px] text-white/70">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weather */}
      {weather && displayDay && (
        <div className="mx-4 mb-3 bg-white rounded-2xl border border-sand-200 p-3.5 flex items-center gap-3 shadow-card">
          <div className="text-3xl">{weather.icon}</div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">
              {dateFnsIsToday(parseISO(displayDay.date)) ? 'Today' : formatDate(displayDay.date)} ·{' '}
              {displayDay.label}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {weather.temp_min}–{weather.temp_max}°C · {weather.description}
            </p>
          </div>
          <div className="text-xs text-slate-300 italic">mock</div>
        </div>
      )}

      {/* Today preview */}
      {displayDay && (
        <section className="mx-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-[17px] font-semibold text-slate-800">
              {todayDay ? "Today's Plan" : 'Next Up'}
            </h2>
            <Link
              href={`/trip/${trip.slug}/itinerary`}
              className="text-xs text-forest-600 flex items-center gap-0.5"
            >
              Full itinerary <ChevronRight size={13} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm text-slate-900">{displayDay.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  <MapPin size={10} className="inline mr-0.5" />
                  {displayDay.base_location}
                </p>
              </div>
              <span className="text-xs bg-forest-50 text-forest-700 px-2 py-1 rounded-full border border-forest-200">
                {formatDate(displayDay.date, 'EEE, MMM d')}
              </span>
            </div>
            <div>
              {displayDay.slots.slice(0, 3).map((slot, i) => (
                <TimelineSlot
                  key={slot.id}
                  slot={slot}
                  tripSlug={trip.slug}
                  isLast={i === 2 || i === displayDay.slots.length - 1}
                />
              ))}
              {displayDay.slots.length > 3 && (
                <Link
                  href={`/trip/${trip.slug}/itinerary`}
                  className="block text-center text-xs text-forest-600 py-2 mt-1"
                >
                  +{displayDay.slots.length - 3} more activities →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Highlights horizontal scroll */}
      <section className="mb-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="font-serif text-[17px] font-semibold text-slate-800">Top Highlights</h2>
          <Link
            href={`/trip/${trip.slug}/explore`}
            className="text-xs text-forest-600 flex items-center gap-0.5"
          >
            All <ChevronRight size={13} />
          </Link>
        </div>
        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
          {highlightActivities.map((act) => (
            <Link
              key={act.id}
              href={`/trip/${trip.slug}/activity/${act.id}`}
              className="flex-shrink-0 w-44 bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-card"
            >
              <div className="h-24 bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center text-4xl">
                {act.emoji}
              </div>
              <div className="p-2.5">
                <p className="text-[12px] font-semibold text-slate-900 leading-snug line-clamp-2 mb-1">
                  {act.title}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>{act.google_rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Favorites */}
      {favoriteActivities.length > 0 && (
        <section className="mx-4 mb-4">
          <h2 className="font-serif text-[17px] font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Heart size={15} className="fill-terracotta-400 text-terracotta-400" />
            Favorites
          </h2>
          <div className="space-y-2">
            {favoriteActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} tripSlug={trip.slug} compact />
            ))}
          </div>
        </section>
      )}

      {/* Rainy day banner */}
      <div className="mx-4 mb-4">
        <Link
          href={`/trip/${trip.slug}/explore?filter=rainy`}
          className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4"
        >
          <div className="text-2xl">🌧️</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Rainy day?</p>
            <p className="text-xs text-blue-600 mt-0.5">
              {rainyDayAlts.length} indoor alternatives ready
            </p>
          </div>
          <ChevronRight size={16} className="text-blue-400" />
        </Link>
      </div>

      {/* Destinations */}
      <section className="mx-4 mb-6">
        <h2 className="font-serif text-[17px] font-semibold text-slate-800 mb-2">Destinations</h2>
        <div className="space-y-2">
          {trip.destinations?.map((dest) => (
            <div key={dest.id} className="bg-white rounded-2xl border border-sand-200 p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center text-lg">
                {dest.country === 'Austria' ? '🇦🇹' : '🇩🇪'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-900">{dest.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(dest.arrival_date, 'MMM d')} –{' '}
                  {formatDate(dest.departure_date, 'MMM d')}
                  {dest.accommodation_name && ` · ${dest.accommodation_name}`}
                </p>
              </div>
              <MapPin size={14} className="text-slate-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
