import { SEED_ACTIVITIES, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import ActivityDetailClient from '@/components/activity/ActivityDetailClient'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { redirect } from 'next/navigation'

export default function ActivityPage({
  params,
}: {
  params: { slug: string; id: string }
}) {
  const all = [
    ...SEED_ACTIVITIES,
    ...(OPTIONAL_ACTIVITIES ?? []),
    ...(EXTRA_ACTIVITIES ?? []),
  ]

  const idx = all.findIndex(function(a) { return a.id === params.id })
  if (idx === -1) redirect(`/trip/${params.slug}/explore`)

  const act = all[idx]

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar
        tripSlug={params.slug}
        showBack
        backHref={`/trip/${params.slug}/explore`}
        title={act.title_he ?? act.title}
      />
      <main className="pb-24">
        <ActivityDetailClient
          activity={JSON.parse(JSON.stringify(act))}
          tripSlug={params.slug}
          lang="he"
        />
      </main>
      <BottomNav tripSlug={params.slug} active="explore" />
    </div>
  )
}