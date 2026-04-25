'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, Heart, ChevronRight, Utensils, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTripStore } from '@/store/trip-store'
import type { ItinerarySlot, ActivityStatus } from '@/types'

interface TimelineSlotProps {
  slot: ItinerarySlot
  tripSlug: string
  isLast?: boolean
  viewOnly?: boolean
}

const STATUS_DOT: Record<ActivityStatus, string> = {
  planned: 'bg-forest-500',
  done: 'bg-forest-600',
  skipped: 'bg-slate-300',
  favorite: 'bg-terracotta-400',
}

export default function TimelineSlot({
  slot,
  tripSlug,
  isLast = false,
  viewOnly = false,
}: TimelineSlotProps) {
  const { setActivityStatus, toggleFavorite, isFavorite, getStatus, activities } = useTripStore()
  const status = getStatus(slot.id)
  const activity = slot.activity_id ? activities[slot.activity_id] : null
  const fav = activity ? isFavorite(activity.id) : false

  const title = activity?.title ?? slot.custom_note ?? 'Activity'
  const emoji = activity?.emoji ?? (slot.is_meal ? '🍽️' : '📌')
  const timeLabel = slot.start_time
    ? slot.end_time
      ? `${slot.start_time} – ${slot.end_time}`
      : slot.start_time
    : null

  return (
    <div className="flex gap-3">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center flex-shrink-0 w-6">
        <div
          className={cn(
            'w-3 h-3 rounded-full border-2 border-white shadow-sm mt-3',
            STATUS_DOT[status]
          )}
        />
        {!isLast && <div className="w-px flex-1 bg-sand-200 mt-1" />}
      </div>

      {/* Card */}
      <div className={cn('flex-1 pb-3', isLast ? '' : '')}>
        <div
          className={cn(
            'bg-white rounded-2xl border border-sand-200 p-3.5 transition-all shadow-card',
            status === 'done' && 'opacity-60',
            status === 'skipped' && 'opacity-40',
            activity && 'cursor-pointer active:scale-[0.99]'
          )}
        >
          {timeLabel && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
              <Clock size={10} />
              {timeLabel}
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
            <div className="flex-1 min-w-0">
              {activity ? (
                <Link href={`/trip/${tripSlug}/activity/${activity.id}`} className="block">
                  <p
                    className={cn(
                      'font-medium text-[14px] text-slate-900 leading-snug',
                      status === 'skipped' && 'line-through'
                    )}
                  >
                    {title}
                  </p>
                  {slot.custom_note && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {slot.custom_note}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1.5 text-forest-600 text-xs">
                    <span>Details</span>
                    <ChevronRight size={12} />
                  </div>
                </Link>
              ) : (
                <>
                  <p className="font-medium text-[14px] text-slate-900 leading-snug">{title}</p>
                  {slot.meal_suggestion && (
                    <div className="mt-1.5 flex items-start gap-1.5 bg-sand-50 rounded-lg p-2">
                      <Utensils size={12} className="text-sand-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-sand-700 leading-relaxed">
                        {slot.meal_suggestion}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          {!viewOnly && (
            <div className="flex gap-2 mt-3 pt-2.5 border-t border-sand-100">
              <button
                onClick={() =>
                  setActivityStatus(slot.id, status === 'done' ? 'planned' : 'done')
                }
                className={cn(
                  'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors',
                  status === 'done'
                    ? 'bg-forest-100 text-forest-700 font-medium'
                    : 'bg-sand-50 text-slate-500 hover:bg-forest-50 hover:text-forest-600'
                )}
              >
                <CheckCircle2 size={13} />
                Done
              </button>

              {activity && (
                <button
                  onClick={() => toggleFavorite(activity.id)}
                  className={cn(
                    'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors',
                    fav
                      ? 'bg-terracotta-100 text-terracotta-700 font-medium'
                      : 'bg-sand-50 text-slate-500 hover:bg-terracotta-50 hover:text-terracotta-600'
                  )}
                >
                  <Heart size={13} className={fav ? 'fill-terracotta-500' : ''} />
                  Fav
                </button>
              )}

              <button
                onClick={() =>
                  setActivityStatus(slot.id, status === 'skipped' ? 'planned' : 'skipped')
                }
                className={cn(
                  'flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ml-auto',
                  status === 'skipped'
                    ? 'bg-slate-200 text-slate-600 font-medium'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <XCircle size={13} />
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
