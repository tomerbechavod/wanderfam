import { SEED_TRIP, SEED_ACTIVITIES } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import ExploreClient from '@/components/trip/ExploreClient'

interface Props {
  params: { slug: string }
  searchParams: { filter?: string; q?: string }
}

export default async function ExplorePage({ params, searchParams }: Props) {
  if (params.slug !== SEED_TRIP.slug) notFound()

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={params.slug} subtitle="Browse all activities" />
      <main className="max-w-lg mx-auto pb-24">
        <ExploreClient
          activities={SEED_ACTIVITIES}
          tripSlug={params.slug}
          initialFilter={searchParams.filter}
          initialQuery={searchParams.q}
        />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
