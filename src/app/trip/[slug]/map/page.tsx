import { SEED_TRIP, SEED_ACTIVITIES } from '@/lib/seed-data'
import { notFound } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import MapClient from '@/components/map/MapClient'

interface Props { params: { slug: string } }

export default async function MapPage({ params }: Props) {
  if (params.slug !== SEED_TRIP.slug) notFound()

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={params.slug} subtitle="All locations" />
      <main className="max-w-lg mx-auto pb-24">
        <MapClient activities={SEED_ACTIVITIES} tripSlug={params.slug} />
      </main>
      <BottomNav tripSlug={params.slug} />
    </div>
  )
}
