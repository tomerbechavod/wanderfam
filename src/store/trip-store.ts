import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityStatus, ItineraryDay, Trip, Activity } from '@/types'

interface TripStore {
  trip: Trip | null
  days: ItineraryDay[]
  activities: Record<string, Activity>
  activeDay: string | null
  viewMode: 'itinerary' | 'map' | 'today' | 'explore' | 'dashboard'
  activityStatuses: Record<string, ActivityStatus>
  favoriteIds: string[]
  notes: Record<string, string>

  setTrip: (trip: Trip) => void
  setDays: (days: ItineraryDay[]) => void
  setActivities: (acts: Activity[]) => void
  setActiveDay: (dayId: string) => void
  setViewMode: (mode: TripStore['viewMode']) => void
  setActivityStatus: (slotId: string, status: ActivityStatus) => void
  toggleFavorite: (activityId: string) => void
  setNote: (slotId: string, note: string) => void
  isFavorite: (activityId: string) => boolean
  getStatus: (slotId: string) => ActivityStatus
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trip: null,
      days: [],
      activities: {},
      activeDay: null,
      viewMode: 'dashboard',
      activityStatuses: {},
      favoriteIds: [],
      notes: {},

      setTrip: (trip) => set({ trip }),
      setDays: (days) => set({ days }),
      setActivities: (acts) =>
        set({ activities: Object.fromEntries(acts.map((a) => [a.id, a])) }),
      setActiveDay: (dayId) => set({ activeDay: dayId }),
      setViewMode: (viewMode) => set({ viewMode }),

      setActivityStatus: (slotId, status) =>
        set((s) => ({
          activityStatuses: { ...s.activityStatuses, [slotId]: status },
        })),

      toggleFavorite: (activityId) =>
        set((s) => {
          const favs = s.favoriteIds.includes(activityId)
            ? s.favoriteIds.filter((id) => id !== activityId)
            : [...s.favoriteIds, activityId]
          return { favoriteIds: favs }
        }),

      setNote: (slotId, note) =>
        set((s) => ({ notes: { ...s.notes, [slotId]: note } })),

      isFavorite: (activityId) => get().favoriteIds.includes(activityId),

      getStatus: (slotId) => get().activityStatuses[slotId] ?? 'planned',
    }),
    {
      name: 'wanderfam-trip',
      partialize: (s) => ({
        activityStatuses: s.activityStatuses,
        favoriteIds: s.favoriteIds,
        notes: s.notes,
        activeDay: s.activeDay,
      }),
    }
  )
)
