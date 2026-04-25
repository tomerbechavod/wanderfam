'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Check, Clock, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SEED_ACTIVITIES, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import type { Activity, ItineraryDay } from '@/types'

interface Props {
  activities: Activity[]
  days: ItineraryDay[]
  tripSlug: string
}

const ALL_TAGS = ['kids', 'free', 'scenic', 'nature', 'indoor', 'rainy day', 'adventure', 'history', 'food', 'lake', 'unique']

const PHASE_LABELS: Record<string, string> = {
  austria: '🇦🇹 אוסטריה',
  munich: '🇩🇪 מינכן',
  transit: '✈️ מעבר',
}

export default function ExploreClient({ activities, days, tripSlug }: Props) {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [showOnlyNotPlanned, setShowOnlyNotPlanned] = useState(false)

  // All activities including optional and extra
  const allActivities = useMemo(() => [
    ...SEED_ACTIVITIES,
    ...(OPTIONAL_ACTIVITIES || []),
    ...(EXTRA_ACTIVITIES || []),
  ], [])

  // Which activity IDs are in the plan (any day)
  const plannedIds = useMemo(() => {
    const ids = new Set<string>()
    days.forEach(day => {
      // Check localStorage for edited days
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem(`wanderfam-days-${day.id}`)
        : null
      const slots = stored ? JSON.parse(stored) : day.slots
      slots.forEach((s: any) => { if (s.activity_id) ids.add(s.activity_id) })
    })
    return ids
  }, [days])

  // Which day an activity is planned for
  const activityDayMap = useMemo(() => {
    const map = new Map<string, string>()
    days.forEach(day => {
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem(`wanderfam-days-${day.id}`)
        : null
      const slots = stored ? JSON.parse(stored) : day.slots
      slots.forEach((s: any) => {
        if (s.activity_id) map.set(s.activity_id, day.label)
      })
    })
    return map
  }, [days])

  const filtered = useMemo(() => {
    return allActivities.filter(a => {
      if (search && !a.title_he?.includes(search) && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.location_name.includes(search)) return false
      if (activeTag && !a.tags.includes(activeTag)) return false
      if (activePhase && a.phase !== activePhase) return false
      if (showOnlyNotPlanned && plannedIds.has(a.id)) return false
      return true
    })
  }, [allActivities, search, activeTag, activePhase, showOnlyNotPlanned, plannedIds])

  const plannedCount = allActivities.filter(a => plannedIds.has(a.id)).length
  const notPlannedCount = allActivities.length - plannedCount

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">

      {/* Stats bar */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowOnlyNotPlanned(false)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
            !showOnlyNotPlanned
              ? 'bg-forest-600 text-white border-forest-600'
              : 'bg-white text-slate-500 border-sand-200'
          )}>
          <Check size={12} />
          {plannedCount} בתוכנית
        </button>
        <button
          onClick={() => setShowOnlyNotPlanned(!showOnlyNotPlanned)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
            showOnlyNotPlanned
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-500 border-sand-200'
          )}>
          <Clock size={12} />
          {notPlannedCount} לא בתוכנית
        </button>
        <div className="flex items-center gap-1 mr-auto bg-sand-50 border border-sand-200 rounded-xl px-3 py-2">
          <span className="text-xs text-slate-500">{allActivities.length} סה"כ</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חפש אטרקציה..."
          className="w-full bg-white border border-sand-200 rounded-xl pr-9 pl-4 py-2.5 text-sm outline-none focus:border-forest-400"
          dir="rtl"
        />
      </div>

      {/* Phase filter */}
      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {(['austria', 'munich'] as const).map(phase => (
          <button key={phase}
            onClick={() => setActivePhase(activePhase === phase ? null : phase)}
            className={cn(
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border transition-all',
              activePhase === phase
                ? 'bg-forest-600 text-white border-forest-600'
                : 'bg-white text-slate-500 border-sand-200'
            )}>
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {ALL_TAGS.map(tag => (
          <button key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border transition-all',
              activeTag === tag
                ? 'bg-terracotta-400 text-white border-terracotta-400'
                : 'bg-white text-slate-500 border-sand-200'
            )}>
            {tag}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 mb-3">
        מציג {filtered.length} מתוך {allActivities.length} אטרקציות
      </p>

      {/* Activity cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">לא נמצאו אטרקציות</p>
          </div>
        )}
        {filtered.map(activity => {
          const isPlanned = plannedIds.has(activity.id)
          const plannedDay = activityDayMap.get(activity.id)
          const isOptional = (OPTIONAL_ACTIVITIES || []).some(a => a.id === activity.id) ||
                             (EXTRA_ACTIVITIES || []).some(a => a.id === activity.id)

          return (
            <Link key={activity.id} href={`/trip/${tripSlug}/activity/${activity.id}`}>
              <div className={cn(
                'bg-white rounded-2xl border overflow-hidden transition-all active:scale-98',
                isPlanned ? 'border-forest-200' : 'border-sand-200'
              )}>
                {/* Image */}
                <div className="relative h-36 bg-gradient-to-br from-forest-100 to-forest-200 overflow-hidden">
                  {activity.images?.[0] && (
                    <img
                      src={activity.images[0]}
                      alt={activity.title_he || activity.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  {!activity.images?.[0] && (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {activity.emoji}
                    </div>
                  )}

                  {/* Plan status badge */}
                  <div className="absolute top-2 right-2">
                    {isPlanned ? (
                      <div className="flex items-center gap-1 bg-forest-600/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        <Check size={10} />
                        {plannedDay || 'בתוכנית'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                        <Clock size={10} />
                        לא בתוכנית
                      </div>
                    )}
                  </div>

                  {/* Optional badge */}
                  {isOptional && (
                    <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                      💡 אופציה
                    </div>
                  )}

                  {/* Rainy day */}
                  {activity.is_rainy_day_alt && (
                    <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                      🌧️ ליום גשום
                    </div>
                  )}

                  {/* Phase */}
                  <div className="absolute bottom-2 right-2 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">
                    {activity.phase === 'austria' ? '🇦🇹' : '🇩🇪'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 leading-tight flex-1">
                      {activity.title_he || activity.title}
                    </h3>
                    <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  </div>

                  <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">
                    {activity.description_he?.slice(0, 80) || activity.description?.slice(0, 80)}...
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <span>📍</span>{activity.location_name}
                    </span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400">⏱ {activity.duration_minutes} דק׳</span>
                    {activity.google_rating && (
                      <>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-amber-600 flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {activity.google_rating}
                        </span>
                      </>
                    )}
                    {activity.price_level === 'free' && (
                      <>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-forest-600 font-medium">חינם</span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {activity.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-sand-100 text-slate-500 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
