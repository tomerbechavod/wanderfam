'use client'

import { useState } from 'react'
import {
  MapPin, Clock, Star, Globe, ExternalLink, Navigation,
  Heart, Users, AlertCircle, Tag, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  cn, formatDuration, priceBadgeClass, difficultyBadgeClass,
  mapsDirectionsLink, mapsLink,
} from '@/lib/utils'
import { useTripStore } from '@/store/trip-store'
import type { Activity } from '@/types'

interface Props {
  activity: Activity
  tripSlug: string
}

export default function ActivityDetailClient({ activity: a, tripSlug }: Props) {
  const { toggleFavorite, isFavorite } = useTripStore()
  const fav = isFavorite(a.id)
  const [showNearby, setShowNearby] = useState(false)

  const hasImages = a.images && a.images.length > 0

  return (
    <div>
      {/* Hero */}
      <div className="relative h-56 bg-gradient-to-br from-forest-100 via-forest-200 to-forest-300 overflow-hidden">
        {hasImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.images[0]} alt={a.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">{a.emoji}</div>
        )}
        <button
          onClick={() => toggleFavorite(a.id)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
        >
          <Heart
            size={18}
            className={fav ? 'fill-terracotta-500 text-terracotta-500' : 'text-slate-400'}
          />
        </button>
        {a.is_rainy_day_alt && (
          <div className="absolute bottom-3 left-3 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-medium">
            🌧️ Great rainy day option
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <h1 className="font-serif text-2xl font-semibold text-slate-900 leading-tight mb-1">
          {a.title}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <MapPin size={13} className="text-forest-500" />
          <span>{a.location_name}</span>
          <span className="text-slate-300">·</span>
          <span>{a.region}, {a.country}</span>
        </div>

        {/* Rating */}
        {a.google_rating && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(a.google_rating!)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700 ml-1">{a.google_rating}</span>
              <span className="text-xs text-slate-400">
                ({a.google_review_count?.toLocaleString()} reviews)
              </span>
            </div>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <InfoCell icon={<Clock size={13} />} label="Duration" value={formatDuration(a.duration_minutes)} />
          <InfoCell
            icon={<span className="text-xs">🎯</span>}
            label="Difficulty"
            value={
              <span className={cn('badge text-xs', difficultyBadgeClass(a.difficulty))}>
                {a.difficulty}
              </span>
            }
          />
          <InfoCell icon={<Users size={13} />} label="Ages" value={a.recommended_ages} />
          <InfoCell
            icon={<span className="text-xs">{a.activity_type === 'indoor' ? '🏛️' : '🌿'}</span>}
            label="Type"
            value={a.activity_type}
          />
          <InfoCell
            icon={<span className="text-xs">💰</span>}
            label="Price"
            value={
              <span className={cn('badge', priceBadgeClass(a.price_level))}>
                {a.price_level === 'free' ? 'Free' : a.price_level}
              </span>
            }
          />
          <InfoCell
            icon={<span className="text-xs">📅</span>}
            label="Booking"
            value={a.booking_required ? '✅ Required' : 'Not needed'}
          />
        </div>

        {/* Price estimate */}
        {a.price_estimate && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-sand-600 font-medium mb-0.5">Estimated cost</p>
            <p className="text-sm text-slate-700">{a.price_estimate}</p>
          </div>
        )}

        {/* Description */}
        <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">About</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{a.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {a.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-forest-50 text-forest-700 rounded-full border border-forest-200"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {/* Tips */}
        {a.tips && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={14} className="text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">Pro tip</p>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{a.tips}</p>
          </div>
        )}

        {/* Family notes */}
        {a.family_notes && (
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={14} className="text-forest-600" />
              <p className="text-xs font-semibold text-forest-700">Family notes</p>
            </div>
            <p className="text-sm text-forest-800 leading-relaxed">{a.family_notes}</p>
          </div>
        )}

        {/* Nearby */}
        {(a.nearby_restaurants.length > 0 || a.nearby_attractions.length > 0) && (
          <div className="mb-4">
            <button
              onClick={() => setShowNearby(!showNearby)}
              className="w-full flex items-center justify-between py-3 border-t border-sand-200"
            >
              <h2 className="font-serif text-base font-semibold text-slate-800">Nearby places</h2>
              {showNearby ? (
                <ChevronUp size={16} className="text-slate-400" />
              ) : (
                <ChevronDown size={16} className="text-slate-400" />
              )}
            </button>
            {showNearby && (
              <div className="space-y-2 mt-1">
                {a.nearby_restaurants.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-sand-100">
                    <span className="text-base">🍽️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">
                        {r.type} · {r.distance_km}km away
                      </p>
                    </div>
                    {r.google_maps_url && (
                      <a
                        href={r.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest-600"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ))}
                {a.nearby_attractions.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-sand-100">
                    <span className="text-base">📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">
                        {r.type} · {r.distance_km}km away
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a
            href={mapsDirectionsLink(a.lat, a.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-forest-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-forest-700 transition-colors"
          >
            <Navigation size={15} />
            Directions
          </a>
          {a.website ? (
            <a
              href={a.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border border-forest-300 text-forest-700 rounded-xl py-3 text-sm font-medium hover:bg-forest-50 transition-colors"
            >
              <Globe size={15} />
              Website
            </a>
          ) : (
            <a
              href={mapsLink(a.lat, a.lng, a.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border border-sand-200 text-slate-600 rounded-xl py-3 text-sm font-medium hover:bg-sand-50 transition-colors"
            >
              <MapPin size={15} />
              Maps
            </a>
          )}
        </div>

        {a.booking_required && a.booking_url && (
          <a
            href={a.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-terracotta-400 text-white rounded-xl py-3 text-sm font-medium mb-4 hover:bg-terracotta-500 transition-colors"
          >
            <ExternalLink size={15} />
            Book tickets online
          </a>
        )}

        <p className="text-xs text-center text-slate-300 pb-2">
          ⭐ Ratings via Google Maps API · 📸 Photos via Unsplash API
        </p>
      </div>
    </div>
  )
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl p-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        <span className="text-slate-400">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}
