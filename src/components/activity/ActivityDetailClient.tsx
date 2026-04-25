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
  lang?: 'he' | 'en'
}

export default function ActivityDetailClient({ activity: a, tripSlug, lang = 'he' }: Props) {
  const { toggleFavorite, isFavorite } = useTripStore()
  const fav = isFavorite(a.id)
  const [showNearby, setShowNearby] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  const title = lang === 'he' && a.title_he ? a.title_he : a.title
  const description = lang === 'he' && a.description_he ? a.description_he : a.description
  const hasImages = a.images && a.images.length > 0

  return (
    <div>
      {/* Image gallery */}
      <div className="relative h-56 bg-gradient-to-br from-forest-100 via-forest-200 to-forest-300 overflow-hidden">
        {hasImages ? (
          <>
            <img
              src={a.images[imgIndex]}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {a.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {a.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={cn('w-2 h-2 rounded-full transition-all', i === imgIndex ? 'bg-white' : 'bg-white/50')}
                  />
                ))}
              </div>
            )}
            {a.images.length > 1 && (
              <>
                <button onClick={() => setImgIndex((i) => (i - 1 + a.images.length) % a.images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  ‹
                </button>
                <button onClick={() => setImgIndex((i) => (i + 1) % a.images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center">
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">{a.emoji}</div>
        )}
        <button onClick={() => toggleFavorite(a.id)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
          <Heart size={18} className={fav ? 'fill-terracotta-500 text-terracotta-500' : 'text-slate-400'} />
        </button>
        {a.is_rainy_day_alt && (
          <div className="absolute bottom-3 left-3 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-medium">
            🌧️ {lang === 'he' ? 'נהדר ליום גשום' : 'Great rainy day option'}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="font-serif text-2xl font-semibold text-slate-900 leading-tight mb-1">{title}</h1>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <MapPin size={13} className="text-forest-500" />
          <span>{a.location_name}</span>
          <span className="text-slate-300">·</span>
          <span>{a.region}, {a.country}</span>
        </div>

        {a.google_rating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14}
                  className={s <= Math.round(a.google_rating!) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">{a.google_rating}</span>
            <span className="text-xs text-slate-400">({a.google_review_count?.toLocaleString()})</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-4">
          <InfoCell icon={<Clock size={13} />} label={lang === 'he' ? 'משך' : 'Duration'} value={formatDuration(a.duration_minutes)} />
          <InfoCell icon={<span>🎯</span>} label={lang === 'he' ? 'קושי' : 'Difficulty'}
            value={<span className={cn('badge text-xs', difficultyBadgeClass(a.difficulty))}>{a.difficulty}</span>} />
          <InfoCell icon={<Users size={13} />} label={lang === 'he' ? 'גילאים' : 'Ages'} value={a.recommended_ages} />
          <InfoCell icon={<span>{a.activity_type === 'indoor' ? '🏛️' : '🌿'}</span>} label={lang === 'he' ? 'סוג' : 'Type'} value={a.activity_type} />
          <InfoCell icon={<span>💰</span>} label={lang === 'he' ? 'מחיר' : 'Price'}
            value={<span className={cn('badge', priceBadgeClass(a.price_level))}>{a.price_level === 'free' ? (lang === 'he' ? 'חינם' : 'Free') : a.price_level}</span>} />
          <InfoCell icon={<span>📅</span>} label={lang === 'he' ? 'הזמנה' : 'Booking'}
            value={a.booking_required ? '✅ ' + (lang === 'he' ? 'נדרש' : 'Required') : (lang === 'he' ? 'לא נדרש' : 'Not needed')} />
        </div>

        {a.price_estimate && (
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-sand-600 font-medium mb-0.5">{lang === 'he' ? 'עלות משוערת' : 'Estimated cost'}</p>
            <p className="text-sm text-slate-700">{a.price_estimate}</p>
          </div>
        )}

        {/* Distance from hotel */}
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span>🏨</span>
          <div>
            <p className="text-xs text-forest-600 font-medium">{lang === 'he' ? 'מרחק מהמלון' : 'Distance from hotel'}</p>
            <p className="text-sm text-forest-800">
              {a.phase === 'munich'
                ? `~${Math.round(Math.sqrt(Math.pow(a.lat - 48.1275, 2) + Math.pow(a.lng - 11.5979, 2)) * 111)} ק"מ מ-Motel One מינכן`
                : `~${Math.round(Math.sqrt(Math.pow(a.lat - 47.3419, 2) + Math.pow(a.lng - 13.3891, 2)) * 111)} ק"מ מ-Sonnberg Ferienanlage`
              }
            </p>
          </div>
        </div>

        <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">{lang === 'he' ? 'על המקום' : 'About'}</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {a.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-forest-50 text-forest-700 rounded-full border border-forest-200">
              <Tag size={9} />{tag}
            </span>
          ))}
        </div>

        {a.tips && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={14} className="text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">{lang === 'he' ? 'טיפ חשוב' : 'Pro tip'}</p>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{a.tips}</p>
          </div>
        )}

        {a.family_notes && (
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={14} className="text-forest-600" />
              <p className="text-xs font-semibold text-forest-700">{lang === 'he' ? 'הערות למשפחה' : 'Family notes'}</p>
            </div>
            <p className="text-sm text-forest-800 leading-relaxed">{a.family_notes}</p>
          </div>
        )}

        {(a.nearby_restaurants.length > 0 || a.nearby_attractions.length > 0) && (
          <div className="mb-4">
            <button onClick={() => setShowNearby(!showNearby)}
              className="w-full flex items-center justify-between py-3 border-t border-sand-200">
              <h2 className="font-serif text-base font-semibold text-slate-800">{lang === 'he' ? 'בסביבה' : 'Nearby'}</h2>
              {showNearby ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {showNearby && (
              <div className="space-y-2 mt-1">
                {a.nearby_restaurants.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-sand-100">
                    <span>🍽️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.type} · {r.distance_km}km</p>
                    </div>
                  </div>
                ))}
                {a.nearby_attractions.map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-sand-100">
                    <span>📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.type} · {r.distance_km}km</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* כפתורי ניווט */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <a href={mapsDirectionsLink(a.lat, a.lng)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-forest-600 text-white rounded-xl py-3 text-sm font-medium">
            <Navigation size={15} />
            Google Maps
          </a>
          {a.waze_url ? (
            <a href={a.waze_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#33CCFF] text-white rounded-xl py-3 text-sm font-medium">
              🔵 Waze
            </a>
          ) : (
            <a href={mapsLink(a.lat, a.lng, a.title)} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white border border-sand-200 text-slate-600 rounded-xl py-3 text-sm font-medium">
              <MapPin size={15} /> Maps
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {a.youtube_url && (
            <a href={a.youtube_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-red-500 text-white rounded-xl py-3 text-sm font-medium">
              ▶️ YouTube
            </a>
          )}
          {a.website && (
            <a href={a.website} target="_blank" rel="noopener noreferrer"
              className={cn('flex items-center justify-center gap-2 bg-white border border-forest-300 text-forest-700 rounded-xl py-3 text-sm font-medium', !a.youtube_url && 'col-span-2')}>
              <Globe size={15} />
              {lang === 'he' ? 'אתר רשמי' : 'Website'}
            </a>
          )}
        </div>

        {a.booking_required && a.booking_url && (
          <a href={a.booking_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-terracotta-400 text-white rounded-xl py-3 text-sm font-medium mb-4">
            <ExternalLink size={15} />
            {lang === 'he' ? 'הזמן כרטיסים' : 'Book tickets'}
          </a>
        )}
      </div>
    </div>
  )
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-sand-200 rounded-xl p-3">
      <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
        <span>{icon}</span>{label}
      </div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}