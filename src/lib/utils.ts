import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInDays, addDays } from 'date-fns'
import type { PriceLevel, Difficulty, DayWeather } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string, fmt = 'EEE, MMM d') {
  return format(parseISO(iso), fmt)
}

export function tripDayCount(start: string, end: string) {
  return differenceInDays(parseISO(end), parseISO(start)) + 1
}

export function dateRange(start: string, end: string): string[] {
  const days: string[] = []
  const count = differenceInDays(parseISO(end), parseISO(start))
  for (let i = 0; i <= count; i++) {
    days.push(format(addDays(parseISO(start), i), 'yyyy-MM-dd'))
  }
  return days
}

export function isToday(iso: string) {
  return format(new Date(), 'yyyy-MM-dd') === iso
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function priceBadgeClass(level: PriceLevel): string {
  if (level === 'free') return 'bg-forest-50 text-forest-700 border-forest-200'
  if (level === '€') return 'bg-sand-50 text-sand-700 border-sand-200'
  if (level === '€€') return 'bg-terracotta-50 text-terracotta-700 border-terracotta-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

export function difficultyBadgeClass(d: Difficulty): string {
  if (d === 'easy') return 'bg-forest-50 text-forest-700'
  if (d === 'moderate') return 'bg-sand-50 text-sand-700'
  return 'bg-red-50 text-red-700'
}

export function starString(rating: number): string {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

export function getMockWeather(date: string): DayWeather {
  const seed = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rainy = seed % 7 === 0
  return {
    date,
    temp_min: 14 + (seed % 6),
    temp_max: 22 + (seed % 8),
    description: rainy ? 'Partly cloudy with showers' : 'Sunny with light breeze',
    icon: rainy ? '🌦️' : '☀️',
    is_rainy: rainy,
  }
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 10) +
         Math.random().toString(36).substring(2, 10)
}

export function mapsLink(lat: number, lng: number, label?: string): string {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export function mapsDirectionsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
