'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

interface TopBarProps {
  title?: string
  subtitle?: string
  tripSlug: string
  showBack?: boolean
  backHref?: string
  rightElement?: React.ReactNode
}

export default function TopBar({
  title = 'Wanderfam',
  subtitle,
  tripSlug,
  showBack = false,
  backHref,
  rightElement,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-sand-200">
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && backHref ? (
            <Link
              href={backHref}
              className="text-forest-600 font-medium text-sm flex items-center gap-1"
            >
              ← Back
            </Link>
          ) : (
            <div>
              <h1 className="font-serif text-xl text-forest-700 leading-none">{title}</h1>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rightElement}
          {!showBack && (
            <Link
              href={`/trip/${tripSlug}/settings`}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-sand-100 transition-colors tap-target flex items-center justify-center"
            >
              <Settings size={20} strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
