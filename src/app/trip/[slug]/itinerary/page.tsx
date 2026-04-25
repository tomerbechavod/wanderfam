import { notFound } from 'next/navigation'
import { SEED_TRIP, SEED_DAYS, SEED_ACTIVITIES } from '@/lib/seed-data'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import ItineraryClient from '@/components/trip/ItineraryClient'

interface Props {
  params: { slug: string }
  searchParams: { day?: string }
}

export default async function ItineraryPage({ params, searchParams }: Props) {
  // In production: fetch from Supabase. Use seed for now.
  if (params.slug !== SEED_TRIP.slug) notFound()

  const days = SEED_DAYS.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => ({
      ...slot,
      activity: slot.activity_id
        ? SEED_ACTIVITIES.find((a) => a.id === slot.activity_id) ?? null
        : null,
    })),
  }))

  const initialDayId = searchParams.day ?? days[0]?.id

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar
        tripSlug={params.slug}
        subtitle="Full itinerary"
      />
      <main className="max-w-lg mx-auto pb-24">
        <ItineraryClient days={days} tripSlug={params.slug} initialDayId={initialDayId} />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
