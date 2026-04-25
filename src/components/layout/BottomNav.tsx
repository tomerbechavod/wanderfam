'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, Search, Map, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/trip', icon: Home, label: 'Home' },
  { href: '/trip/itinerary', icon: Calendar, label: 'Itinerary' },
  { href: '/trip/explore', icon: Search, label: 'Explore' },
  { href: '/trip/map', icon: Map, label: 'Map' },
  { href: '/trip/today', icon: Sun, label: 'Today' },
]

export default function BottomNav({ tripSlug }: { tripSlug: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const basePath = `/trip/${tripSlug}`

  const items = [
    { href: basePath, icon: Home, label: 'Home' },
    { href: `${basePath}/itinerary`, icon: Calendar, label: 'Itinerary' },
    { href: `${basePath}/explore`, icon: Search, label: 'Explore' },
    { href: `${basePath}/map`, icon: Map, label: 'Map' },
    { href: `${basePath}/today`, icon: Sun, label: 'Today' },
  ]

  return (
    <nav className="bottom-nav bg-white border-t border-sand-200 shadow-bottom-nav">
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== basePath && pathname.startsWith(href))
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 tap-target',
                'transition-colors duration-150 text-xs font-medium',
                isActive
                  ? 'text-forest-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.75}
                className={isActive ? 'text-forest-600' : 'text-slate-400'}
              />
              <span className="leading-none">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
