import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { SEED_TRIP, SEED_DAYS, SEED_ACTIVITIES } from '@/lib/seed-data'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import TripDashboardClient from '@/components/trip/TripDashboardClient'
import type { TripWithDays } from '@/types'

interface Props {
  params: { slug: string }
}

async function getTripData(slug: string): Promise<TripWithDays | null> {
  // Try Supabase first, fall back to seed data
  try {
    const supabase = createServerSupabaseClient()
    const { data: trip } = await supabase
      .from('trips')
      .select('*, destinations(*)')
      .eq('slug', slug)
      .single()

    if (trip) {
      const { data: days } = await supabase
        .from('itinerary_days')
        .select('*, slots:itinerary_slots(*, activity:activities(*))')
        .eq('trip_id', trip.id)
        .order('day_number')

      return { ...trip, days: days ?? [] }
    }
  } catch {
    // Supabase not configured — use seed data
  }

  if (slug === SEED_TRIP.slug) {
    const days = SEED_DAYS.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({
        ...slot,
        activity: slot.activity_id
          ? SEED_ACTIVITIES.find((a) => a.id === slot.activity_id) ?? null
          : null,
      })),
    }))
    return { ...SEED_TRIP, pin_hash: null, owner_id: null, days }
  }

  return null
}

export default async function TripPage({ params }: Props) {
  const trip = await getTripData(params.slug)
  if (!trip) notFound()

  const allActivities = SEED_ACTIVITIES

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar
        tripSlug={params.slug}
        subtitle={`${trip.start_date.slice(5).replace('-', '/')} – ${trip.end_date.slice(5).replace('-', '/')} · ${trip.destinations?.length ?? 0} destinations`}
      />
      <main className="max-w-lg mx-auto pb-24">
        <TripDashboardClient trip={trip} activities={allActivities} />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
