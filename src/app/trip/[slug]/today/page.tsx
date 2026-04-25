import { SEED_TRIP, SEED_DAYS, SEED_ACTIVITIES } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import TodayClient from '@/components/trip/TodayClient'

interface Props {
  params: { slug: string }
}

export default async function TodayPage({ params }: Props) {
  if (params.slug !== SEED_TRIP.slug) notFound()

  const today = format(new Date(), 'yyyy-MM-dd')

  const days = SEED_DAYS.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => ({
      ...slot,
      activity: slot.activity_id
        ? SEED_ACTIVITIES.find((a) => a.id === slot.activity_id) ?? null
        : null,
    })),
  }))

  // Show today if in trip, otherwise show first day
  const tripStart = SEED_TRIP.start_date
  const tripEnd = SEED_TRIP.end_date
  const inTrip = today >= tripStart && today <= tripEnd
  const displayDate = inTrip ? today : tripStart

  const todayDay = days.find((d) => d.date === displayDate) ?? days[0]

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={params.slug} title="Today" subtitle={todayDay?.label} />
      <main className="max-w-lg mx-auto pb-24">
        <TodayClient day={todayDay} tripSlug={params.slug} isActuallyToday={inTrip} />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
