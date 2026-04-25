'use client'

import { useState, useRef, useEffect } from 'react'
import { format, parseISO, isToday } from 'date-fns'
import { MapPin, CloudRain, Edit3, X, Plus, Trash2, Check, ChevronDown, ChevronUp, Navigation } from 'lucide-react'
import { cn, getMockWeather } from '@/lib/utils'
import TimelineSlot from '@/components/trip/TimelineSlot'
import { SEED_ACTIVITIES, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import type { ItineraryDay, ItinerarySlot } from '@/types'

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

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function ItineraryClient({ days, tripSlug, initialDayId }: Props) {
  const [activeDayId, setActiveDayId] = useState(initialDayId || days[0]?.id)
  const [editMode, setEditMode] = useState(false)
  const [localDays, setLocalDays] = useState(days)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showOptional, setShowOptional] = useState(false)
  const [saved, setSaved] = useState(false)
  const chipRef = useRef<HTMLDivElement>(null)

  const activeDay = localDays.find((d) => d.id === activeDayId) ?? localDays[0]
  const weather = activeDay ? getMockWeather(activeDay.date) : null

  useEffect(() => {
    const el = chipRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeDayId])

  useEffect(() => {
    const todayDay = days.find((d) => isToday(parseISO(d.date)))
    if (todayDay) setActiveDayId(todayDay.id)
  }, [days])

  useEffect(() => {
    const stored = localStorage.getItem(`wanderfam-days-${activeDayId}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      setLocalDays(prev => prev.map(d => d.id === activeDayId ? { ...d, slots: parsed } : d))
    }
  }, [activeDayId])

  const saveEdits = () => {
    const day = localDays.find(d => d.id === activeDayId)
    if (day) localStorage.setItem(`wanderfam-days-${activeDayId}`, JSON.stringify(day.slots))
    setEditMode(false)
    setShowAddPanel(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cancelEdits = () => {
    const stored = localStorage.getItem(`wanderfam-days-${activeDayId}`)
    if (stored) {
      setLocalDays(prev => prev.map(d => d.id === activeDayId ? { ...d, slots: JSON.parse(stored) } : d))
    } else {
      setLocalDays(days)
    }
    setEditMode(false)
    setShowAddPanel(false)
  }

  const removeSlot = (slotId: string) => {
    setLocalDays(prev => prev.map(d =>
      d.id === activeDayId ? { ...d, slots: d.slots.filter(s => s.id !== slotId) } : d
    ))
  }

  const addActivity = (activityId: string, fromOptional = false) => {
    const allActivities = [...SEED_ACTIVITIES, ...(OPTIONAL_ACTIVITIES || []), ...(EXTRA_ACTIVITIES || [])]
    const act = allActivities.find(a => a.id === activityId)
    if (!act || !activeDay) return
    const newSlot: ItinerarySlot = {
      id: `slot-${Date.now()}`,
      day_id: activeDayId,
      activity_id: activityId,
      activity: act as any,
      sort_order: activeDay.slots.length + 1,
      start_time: null,
      end_time: null,
      custom_note: fromOptional ? `💡 נוסף מרשימת האופציות` : null,
      status: 'planned',
      travel_time_from_prev_minutes: null,
      is_meal: false,
      meal_suggestion: null,
    }
    setLocalDays(prev => prev.map(d =>
      d.id === activeDayId ? { ...d, slots: [...d.slots, newSlot] } : d
    ))
    setShowAddPanel(false)
    setShowOptional(false)
  }

  const moveSlot = (idx: number, dir: 'up' | 'down') => {
    if (!activeDay) return
    const slots = [...activeDay.slots]
    const newIdx = dir === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= slots.length) return
    ;[slots[idx], slots[newIdx]] = [slots[newIdx], slots[idx]]
    setLocalDays(prev => prev.map(d => d.id === activeDayId ? { ...d, slots } : d))
  }

  // All activities combined
  const allActivities = [...SEED_ACTIVITIES, ...(OPTIONAL_ACTIVITIES || []), ...(EXTRA_ACTIVITIES || [])]
  const inDayIds = new Set(activeDay?.slots.map(s => s.activity_id).filter(Boolean))

  // Activities already in THIS day's plan (from all days)
  const inAnyDayIds = new Set(
    localDays.flatMap(d => d.slots.map(s => s.activity_id).filter(Boolean))
  )

  // For add panel
  const availableMain = SEED_ACTIVITIES.filter(a => !inDayIds.has(a.id))
  const availableOptional = [...(OPTIONAL_ACTIVITIES || []), ...(EXTRA_ACTIVITIES || [])].filter(a => !inDayIds.has(a.id))

  // Nearby suggestions — closest 3 activities not in this day, matching phase
  const nearbySuggestions = activeDay
    ? allActivities
        .filter(a => !inDayIds.has(a.id) && (a.phase === activeDay.phase || activeDay.phase === 'transit'))
        .map(a => ({
          ...a,
          dist: distanceKm(activeDay.base_lat, activeDay.base_lng, a.lat, a.lng)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
    : []

  // Summary: which SEED_ACTIVITIES are in plan vs not
  const inPlanIds = new Set(
    localDays.flatMap(d => d.slots.map(s => s.activity_id).filter(Boolean))
  )
  const inPlanActivities = SEED_ACTIVITIES.filter(a => inPlanIds.has(a.id))
  const notInPlanActivities = SEED_ACTIVITIES.filter(a => !inPlanIds.has(a.id))

  return (
    <div>
      {/* Day chips */}
      <div ref={chipRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-sand-200 bg-white sticky top-14 z-30">
        {localDays.map((day) => {
          const active = day.id === activeDayId
          const today = isToday(parseISO(day.date))
          return (
            <button key={day.id} data-active={active}
              onClick={() => { setActiveDayId(day.id); setEditMode(false); setShowAddPanel(false) }}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl border text-xs transition-all',
                active ? 'bg-forest-600 text-white border-forest-600'
                  : today ? 'bg-forest-50 text-forest-700 border-forest-300'
                  : 'bg-white text-slate-500 border-sand-200'
              )}>
              <span className="font-semibold text-sm leading-none">{format(parseISO(day.date), 'd')}</span>
              <span className="mt-0.5 opacity-80">{format(parseISO(day.date), 'EEE')}</span>
              {today && !active && <div className="w-1 h-1 rounded-full bg-forest-500 mt-0.5" />}
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
                <MapPin size={11} /><span>{activeDay.base_location}</span>
              </div>
              {activeDay.theme && <p className="text-xs text-slate-500 italic mt-1">"{activeDay.theme}"</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={cn('badge text-xs', PHASE_COLORS[activeDay.phase])}>
                {activeDay.phase === 'transit' ? '✈️ מעבר' : activeDay.phase === 'austria' ? '🇦🇹 אוסטריה' : '🇩🇪 מינכן'}
              </span>
              {weather && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {weather.icon} {weather.temp_min}–{weather.temp_max}°C
                </span>
              )}
            </div>
          </div>

          {/* Edit bar */}
          {!editMode ? (
            <div className="flex items-center justify-between mb-3">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-forest-600 bg-forest-50 px-3 py-1.5 rounded-xl border border-forest-200">
                  <Check size={12} /> נשמר!
                </span>
              )}
              <button onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-sm text-forest-600 border border-forest-300 px-3 py-1.5 rounded-xl mr-auto">
                <Edit3 size={14} /> ערוך יום זה
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mb-3 flex-wrap">
              <button onClick={saveEdits}
                className="flex items-center gap-1.5 text-sm bg-forest-600 text-white px-3 py-1.5 rounded-xl">
                <Check size={14} /> שמור
              </button>
              <button onClick={() => setShowAddPanel(!showAddPanel)}
                className="flex items-center gap-1.5 text-sm bg-blue-500 text-white px-3 py-1.5 rounded-xl">
                <Plus size={14} /> הוסף פעילות
              </button>
              <button onClick={cancelEdits}
                className="flex items-center gap-1.5 text-sm bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl">
                <X size={14} /> ביטול
              </button>
            </div>
          )}

          {/* Add panel */}
          {showAddPanel && (
            <div className="mb-4 bg-white border border-sand-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-sand-100 flex items-center justify-between bg-sand-50">
                <p className="font-semibold text-sm text-slate-800">➕ הוסף פעילות ליום זה</p>
                <button onClick={() => setShowAddPanel(false)}><X size={16} className="text-slate-400" /></button>
              </div>
              <div>
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-white border-b border-sand-100">
                  📋 פעילויות בתוכנית
                </p>
                <div className="divide-y divide-sand-100 max-h-52 overflow-y-auto">
                  {availableMain.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">כל פעילויות התוכנית כבר ביום זה ✅</p>
                  ) : availableMain.map(act => (
                    <button key={act.id} onClick={() => addActivity(act.id, false)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand-50 text-right">
                      <span className="text-xl flex-shrink-0">{act.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{act.title_he || act.title}</p>
                        <p className="text-xs text-slate-400">{act.location_name} · {act.duration_minutes} דק׳{act.google_rating ? ` · ⭐ ${act.google_rating}` : ''}</p>
                      </div>
                      <Plus size={16} className="text-forest-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-sand-200">
                <button onClick={() => setShowOptional(!showOptional)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💡</span>
                    <p className="text-sm font-semibold text-amber-800">פעילויות אופציונליות</p>
                    <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{availableOptional.length} זמינות</span>
                  </div>
                  {showOptional ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
                </button>
                {showOptional && (
                  <div className="divide-y divide-sand-100 max-h-64 overflow-y-auto">
                    {availableOptional.map(act => (
                      <button key={act.id} onClick={() => addActivity(act.id, true)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 text-right">
                        <span className="text-xl flex-shrink-0">{act.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-sm font-medium text-slate-900 truncate">{act.title_he || act.title}</p>
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">אופציה</span>
                          </div>
                          <p className="text-xs text-slate-400">{act.location_name} · {act.duration_minutes} דק׳{act.google_rating ? ` · ⭐ ${act.google_rating}` : ''}</p>
                        </div>
                        <Plus size={16} className="text-amber-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rainy warning */}
          {weather?.is_rainy && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-3">
              <CloudRain size={16} className="text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700">גשם צפוי — שקול חלופות מקורות</p>
            </div>
          )}

          {/* Plan status summary */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-forest-50 border border-forest-200 rounded-xl px-3 py-1.5">
              <Check size={12} className="text-forest-600" />
              <span className="text-xs text-forest-700 font-medium">{inPlanActivities.length} בתוכנית</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span className="text-xs">⏳</span>
              <span className="text-xs text-slate-600 font-medium">{notInPlanActivities.length} לא בתוכנית</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-1">
            {activeDay.slots.map((slot, i) => (
              <div key={slot.id} className="relative">
                {editMode && (
                  <div className="flex items-center gap-1 mb-1">
                    <button onClick={() => moveSlot(i, 'up')} disabled={i === 0}
                      className="text-xs px-2 py-1 rounded-lg bg-sand-100 text-slate-500 disabled:opacity-30">↑</button>
                    <button onClick={() => moveSlot(i, 'down')} disabled={i === activeDay.slots.length - 1}
                      className="text-xs px-2 py-1 rounded-lg bg-sand-100 text-slate-500 disabled:opacity-30">↓</button>
                    <span className="flex-1 text-xs text-slate-400 truncate px-1">
                      {slot.activity?.title_he || slot.activity?.title || slot.custom_note?.slice(0, 30) || 'פעילות'}
                    </span>
                    <button onClick={() => removeSlot(slot.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 border border-red-200">
                      <Trash2 size={11} /> הסר
                    </button>
                  </div>
                )}
                <TimelineSlot slot={slot} tripSlug={tripSlug} isLast={i === activeDay.slots.length - 1} />
              </div>
            ))}
            {activeDay.slots.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">אין פעילויות ביום זה</p>
                {editMode && (
                  <button onClick={() => setShowAddPanel(true)}
                    className="mt-3 text-sm text-forest-600 border border-forest-300 px-4 py-2 rounded-xl">
                    + הוסף פעילות
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Nearby suggestions */}
          {nearbySuggestions.length > 0 && (
            <div className="mt-5 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Navigation size={14} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700">קרוב אליך היום</h3>
                <span className="text-xs text-slate-400">— עוד לא בתוכנית</span>
              </div>
              <div className="space-y-2">
                {nearbySuggestions.map((act: any) => (
                  <div key={act.id}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{act.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">{act.title_he || act.title}</p>
                        {!inPlanIds.has(act.id) && (
                          <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full flex-shrink-0">לא בתוכנית</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{act.description_he?.slice(0, 55)}...</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-700 font-medium">📍 {Math.round(act.dist)} ק"מ מכאן</span>
                        {act.google_rating && <span className="text-xs text-slate-400">⭐ {act.google_rating}</span>}
                        {act.price_level === 'free' && <span className="text-xs text-forest-600">חינם</span>}
                        {act.is_rainy_day_alt && <span className="text-xs text-blue-500">🌧️ ליום גשום</span>}
                      </div>
                    </div>
                    <button onClick={() => { addActivity(act.id, true); }}
                      className="flex-shrink-0 bg-amber-500 text-white rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1">
                      <Plus size={12} /> הוסף
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day nav */}
          <div className="flex gap-3 mt-4 pb-2">
            {localDays.findIndex((d) => d.id === activeDayId) > 0 && (
              <button onClick={() => {
                const idx = localDays.findIndex((d) => d.id === activeDayId)
                setActiveDayId(localDays[idx - 1].id)
                setEditMode(false)
              }} className="flex-1 py-2.5 rounded-xl border border-sand-200 text-sm text-slate-500 bg-white">
                ← יום קודם
              </button>
            )}
            {localDays.findIndex((d) => d.id === activeDayId) < localDays.length - 1 && (
              <button onClick={() => {
                const idx = localDays.findIndex((d) => d.id === activeDayId)
                setActiveDayId(localDays[idx + 1].id)
                setEditMode(false)
              }} className="flex-1 py-2.5 rounded-xl bg-forest-600 text-sm text-white">
                יום הבא →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
