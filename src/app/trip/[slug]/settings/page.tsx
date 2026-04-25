'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

interface Props {
  params: { slug: string }
}

const API_INTEGRATIONS = [
  {
    icon: '🗺️',
    name: 'Google Maps',
    key: 'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
    desc: 'Live map embed + directions',
    docs: 'https://developers.google.com/maps',
  },
  {
    icon: '🌤️',
    name: 'OpenWeatherMap',
    key: 'NEXT_PUBLIC_OPENWEATHER_KEY',
    desc: 'Real daily weather forecasts',
    docs: 'https://openweathermap.org/api',
  },
  {
    icon: '📸',
    name: 'Unsplash',
    key: 'NEXT_PUBLIC_UNSPLASH_KEY',
    desc: 'Real photos for activity cards',
    docs: 'https://unsplash.com/developers',
  },
  {
    icon: '🔍',
    name: 'Supabase',
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    desc: 'Database + auth + storage',
    docs: 'https://supabase.com',
  },
]

export default function SettingsPage({ params }: Props) {
  const slug = params.slug
  const [copied, setCopied] = useState(false)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/fam2026alps`
      : `https://wanderfam.vercel.app/share/fam2026alps`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <TopBar tripSlug={slug} showBack backHref={`/trip/${slug}`} title="Settings" />
      <main className="max-w-lg mx-auto pb-24 px-4 pt-4 space-y-4">
        {/* Share */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">
            Share with family
          </h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-4 space-y-3">
            <p className="text-sm text-slate-600">
              Share this link. Family members get a read-only view of the full trip.
            </p>
            <div className="flex items-center gap-2 bg-sand-50 border border-sand-200 rounded-xl p-3">
              <p className="text-xs text-forest-700 flex-1 break-all font-mono">{shareUrl}</p>
              <button
                onClick={copy}
                className="flex-shrink-0 flex items-center gap-1 text-xs bg-forest-600 text-white px-3 py-1.5 rounded-lg"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              💡 Family can add this to their phone home screen for a native-app experience.
            </p>
          </div>
        </div>

        {/* PWA */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">
            Add to home screen
          </h2>
          <div className="bg-white rounded-2xl border border-sand-200 p-4 space-y-3">
            {[
              {
                n: 1,
                text: (
                  <>
                    <strong>iPhone/Safari:</strong> Tap the Share button → &quot;Add to Home Screen&quot; → Add
                  </>
                ),
              },
              {
                n: 2,
                text: (
                  <>
                    <strong>Android/Chrome:</strong> Tap the three-dot menu → &quot;Add to Home screen&quot; → Add
                  </>
                ),
              },
              {
                n: 3,
                text: 'The app opens full-screen — exactly like a native app, no App Store needed.',
              },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-forest-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {n}
                </div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API integrations */}
        <div>
          <h2 className="font-serif text-lg font-semibold text-slate-800 mb-2">
            API integrations
          </h2>
          <div className="bg-white rounded-2xl border border-sand-200 divide-y divide-sand-100">
            {API_INTEGRATIONS.map((api) => (
              <div key={api.key} className="p-4 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{api.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-900">{api.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{api.desc}</p>
                  <code className="text-xs text-slate-300 font-mono">{api.key}</code>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                    Setup
                  </span>
                  <a
                    href={api.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-forest-600 flex items-center gap-0.5"
                  >
                    Docs <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-slate-400">Wanderfam v0.1 · Next.js + Supabase</p>
        </div>
      </main>
    </div>
  )
}
