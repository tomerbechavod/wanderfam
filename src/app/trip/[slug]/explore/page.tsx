import { SEED_ACTIVITIES, SEED_DAYS, OPTIONAL_ACTIVITIES, EXTRA_ACTIVITIES } from '@/lib/seed-data'
import ExploreClient from '@/components/trip/ExploreClient'

export default function ExplorePage({ params }: { params: { slug: string } }) {
  const allActivities = [
    ...SEED_ACTIVITIES,
    ...(OPTIONAL_ACTIVITIES || []),
    ...(EXTRA_ACTIVITIES || []),
  ]

  return (
    <div className="min-h-screen bg-sand-50 pb-24">
      <div className="sticky top-0 z-40 bg-white border-b border-sand-200 px-4 py-3">
        <h1 className="font-serif text-lg font-semibold text-slate-900">גלה אטרקציות</h1>
        <p className="text-xs text-slate-400 mt-0.5">{allActivities.length} אטרקציות באוסטריה ומינכן</p>
      </div>
      <ExploreClient
        activities={allActivities}
        days={SEED_DAYS}
        tripSlug={params.slug}
      />
    </div>
  )
}
