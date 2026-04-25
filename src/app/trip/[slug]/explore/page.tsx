import { SEED_ACTIVITIES, SEED_DAYS, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import ExploreClient from '@/components/trip/ExploreClient'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function ExplorePage({ params }: { params: { slug: string } }) {
  const allActivities = [
    ...SEED_ACTIVITIES,
    ...(OPTIONAL_ACTIVITIES || []),
    ...(EXTRA_ACTIVITIES || []),
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={params.slug} title="גלה אטרקציות" />
      <main className="pb-24">
        <ExploreClient
          activities={allActivities}
          days={SEED_DAYS}
          tripSlug={params.slug}
        />
      </main>
      <BottomNav tripSlug={params.slug} active="explore" />
    </div>
  )
}
