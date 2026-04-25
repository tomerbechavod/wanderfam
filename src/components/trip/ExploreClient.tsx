'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ActivityCard from '@/components/activity/ActivityCard'
import type { Activity } from '@/types'

interface Props {
  activities: Activity[]
  tripSlug: string
  initialFilter?: string
  initialQuery?: string
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'rainy', label: '🌧️ Rainy day' },
  { id: 'kids', label: '👶 Kids' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'scenic', label: '📸 Scenic' },
  { id: 'indoor', label: '🏛️ Indoor' },
  { id: 'free', label: '🎟️ Free' },
  { id: 'austria', label: '🇦🇹 Austria' },
  { id: 'munich', label: '🇩🇪 Munich' },
]

export default function ExploreClient({ activities, tripSlug, initialFilter, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [activeFilter, setActiveFilter] = useState(initialFilter ?? 'all')

  const filtered = useMemo(() => {
    let list = activities

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.location_name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      )
    }

    // Tag filter
    if (activeFilter === 'rainy') list = list.filter((a) => a.is_rainy_day_alt)
    else if (activeFilter === 'indoor') list = list.filter((a) => a.activity_type === 'indoor')
    else if (activeFilter === 'free') list = list.filter((a) => a.price_level === 'free')
    else if (activeFilter === 'austria') list = list.filter((a) => a.country === 'Austria')
    else if (activeFilter === 'munich') list = list.filter((a) => a.country === 'Germany')
    else if (activeFilter !== 'all') list = list.filter((a) => a.tags.includes(activeFilter))

    return list
  }, [activities, query, activeFilter])

  return (
    <div>
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 bg-white border border-sand-200 rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities, places..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium',
              activeFilter === f.id
                ? 'bg-forest-600 text-white border-forest-600'
                : 'bg-white text-slate-600 border-sand-200 hover:border-forest-300'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 pb-2 text-xs text-slate-400">
        {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'}
        {activeFilter !== 'all' && ` · filtered by ${activeFilter}`}
      </div>

      {/* Activity grid */}
      {filtered.length > 0 ? (
        <div className="px-4 space-y-3 pb-4">
          {filtered.map((act) => (
            <ActivityCard key={act.id} activity={act} tripSlug={tripSlug} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-8">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-serif text-lg text-slate-700 mb-1">Nothing found</p>
          <p className="text-sm text-slate-400">
            Try a different search or clear the filter
          </p>
          <button
            onClick={() => { setQuery(''); setActiveFilter('all') }}
            className="mt-4 text-sm text-forest-600 border border-forest-300 px-4 py-2 rounded-xl"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
