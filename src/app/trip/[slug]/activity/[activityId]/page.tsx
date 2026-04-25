import { notFound } from 'next/navigation'
import { SEED_TRIP, SEED_ACTIVITIES } from '@/lib/seed-data'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import ActivityDetailClient from '@/components/activity/ActivityDetailClient'

interface Props {
  params: { slug: string; activityId: string }
}

export default async function ActivityPage({ params }: Props) {
  if (params.slug !== SEED_TRIP.slug) notFound()

  const activity = SEED_ACTIVITIES.find((a) => a.id === params.activityId)
  if (!activity) notFound()

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar
        tripSlug={params.slug}
        showBack
        backHref={`/trip/${params.slug}/explore`}
        rightElement={<span className="text-2xl">{activity.emoji}</span>}
      />
      <main className="max-w-lg mx-auto pb-24">
        <ActivityDetailClient activity={activity} tripSlug={params.slug} />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
