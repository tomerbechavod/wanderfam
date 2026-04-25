'use client'

import Link from 'next/link'
import { MapPin, Clock, Star } from 'lucide-react'
import { cn, formatDuration, priceBadgeClass } from '@/lib/utils'
import type { Activity } from '@/types'

interface ActivityCardProps {
  activity: Activity
  tripSlug: string
  compact?: boolean
  className?: string
}

export default function ActivityCard({
  activity: a,
  tripSlug,
  compact = false,
  className,
}: ActivityCardProps) {
  const emoji = a.emoji || '📍'
  const hasImage = a.images && a.images.length > 0

  return (
    <Link
      href={`/trip/${tripSlug}/activity/${a.id}`}
      className={cn('card card-hover block', className)}
    >
      {/* Image or emoji placeholder */}
      {!compact && (
        <div className="relative h-36 bg-gradient-to-br from-forest-100 to-forest-200 overflow-hidden rounded-t-2xl">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.images[0]}
              alt={a.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {emoji}
            </div>
          )}
          {a.is_rainy_day_alt && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              🌧️ Rainy day
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {compact && (
            <div className="text-2xl flex-shrink-0 mt-0.5">{emoji}</div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-[15px] leading-snug text-slate-900 mb-1 line-clamp-2">
              {a.title}
            </h3>

            <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
              <MapPin size={11} />
              <span className="truncate">{a.location_name}</span>
              <span>·</span>
              <Clock size={11} />
              <span>{formatDuration(a.duration_minutes)}</span>
            </div>

            {!compact && (
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                {a.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                <span className={cn('badge', priceBadgeClass(a.price_level))}>
                  {a.price_level === 'free' ? 'Free' : a.price_level}
                </span>
                {a.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="badge bg-sand-50 text-sand-700 border-sand-200">
                    {tag}
                  </span>
                ))}
              </div>

              {a.google_rating && (
                <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="font-medium">{a.google_rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
