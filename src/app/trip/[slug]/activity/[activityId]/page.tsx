import { notFound } from 'next/navigation'
import { SEED_ACTIVITIES, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import ActivityDetailClient from '@/components/activity/ActivityDetailClient'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

function findActivity(actId: string) {
  const all = [
    ...SEED_ACTIVITIES,
    ...(OPTIONAL_ACTIVITIES || []),
    ...(EXTRA_ACTIVITIES || []),
  ]
  return all.find(function(act) { return act.id === actId }) || null
}

export default function ActivityPage({
  params,
}: {
  params: { slug: string; id: string }
}) {
  const activity = findActivity(params.id)

  if (!activity) notFound()

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar
        tripSlug={params.slug}
        showBack
        backHref={`/trip/${params.slug}/explore`}
        title={activity.title_he || activity.title}
      />
      <main className="pb-24">
        <ActivityDetailClient
          activity={activity}
          tripSlug={params.slug}
          lang="he"
        />
      </main>
      <BottomNav tripSlug={params.slug} active="explore" />
    </div>
  )
}
