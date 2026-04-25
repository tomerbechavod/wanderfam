# 🏔️ Wanderfam — Family Trip Planner

A production-ready, PWA-enabled family trip planning web app built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

Share a single URL with your family → they open it on mobile, add it to their home screen, and get a native-app experience — **no App Store required**.

---

## ✅ Live Features (MVP)

| Feature | Status |
|---|---|
| Trip dashboard with countdown | ✅ |
| Full 9-day Austria + Munich itinerary | ✅ |
| Day-by-day timeline with done/skip/fav | ✅ |
| Rich activity detail pages | ✅ |
| Search + tag filtering | ✅ |
| Map screen with directions | ✅ |
| "Today" view for use during trip | ✅ |
| Shareable family link (view-only) | ✅ |
| PWA — add to home screen | ✅ |
| Mobile-first responsive UI | ✅ |
| Offline-ready (service worker) | ✅ |
| Settings page with API setup guide | ✅ |

---

## 🚀 Quick Start (Local Dev)

```bash
# 1. Clone / unzip the project
cd wanderfam

# 2. Install dependencies
npm install

# 3. Copy the env template
cp .env.local.example .env.local
# → The app works immediately with seed data, no env vars required for local dev

# 4. Run dev server
npm run dev

# 5. Open http://localhost:3000
# It auto-redirects to /trip/alps-bavaria-2026
```

**The app runs fully on seed data** — no database needed for local development or your first Vercel deploy.

---

## 🌐 Deploy to Vercel (5 minutes)

### Option A — GitHub (recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial Wanderfam"
gh repo create wanderfam --private --push
```

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Vercel auto-detects Next.js — click **Deploy**
4. Done! Your app is live at `https://wanderfam.vercel.app`

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts — no config changes needed
```

### Environment Variables on Vercel

In **Vercel Dashboard → Project → Settings → Environment Variables**, add these as needed:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Enable database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Enable database |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side DB ops |
| `NEXT_PUBLIC_APP_URL` | Optional | Your Vercel URL |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Optional | Live map embed |
| `NEXT_PUBLIC_OPENWEATHER_KEY` | Optional | Live weather |
| `NEXT_PUBLIC_UNSPLASH_KEY` | Optional | Real photos |

> **The app ships with seed data** — it works without any env vars. Add them progressively to unlock real APIs.

---

## 🗄️ Supabase Setup (Optional — needed for multiple trips or auth)

### 1. Create a project

1. Go to [app.supabase.com](https://app.supabase.com) → **New Project**
2. Choose region (Frankfurt `eu-central-1` is closest to Austria/Germany)
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Run the schema

1. Go to **SQL Editor** → **New Query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 3. Add env vars

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Seed the database (optional)

The app falls back to TypeScript seed data automatically. If you want the data in Supabase for persistence:

```bash
# Coming soon: npm run db:seed
# For now, use the Supabase Table Editor to insert data manually
# or write a one-time migration script using the SEED_ACTIVITIES and SEED_DAYS exports
```

---

## 🔗 Sharing with Family

### The share link

Your family trip is accessible at:
```
https://YOUR-APP.vercel.app/trip/alps-bavaria-2026
```

For a **clean view-only share link**:
```
https://YOUR-APP.vercel.app/share/fam2026alps
```

The share token (`fam2026alps`) is defined in `src/lib/seed-data.ts` → `SEED_TRIP.share_token`. Change it to anything you like.

### PIN protection (optional)

To add a PIN to the share page, add to `.env.local`:
```
TRIP_PIN_SECRET=any_random_string_32_chars
```

Then modify `src/app/share/[shareToken]/page.tsx` to check a PIN cookie before rendering. A full PIN-gate middleware can be added to `middleware.ts`.

---

## 📱 PWA — Add to Home Screen

### iPhone (Safari)
1. Open the app URL in Safari
2. Tap the **Share button** (box with arrow at bottom of screen)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add** in the top right
5. The Wanderfam icon appears on your home screen

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **three-dot menu** (⋮) at top right
3. Tap **"Add to Home screen"**
4. Tap **Add**
5. The icon appears on your home screen

### What the family gets
- Opens **full-screen** (no browser UI) — exactly like a native app
- **Works offline** — service worker caches all pages and activities
- **Fast** — cached assets load instantly
- The URL stays private (not listed anywhere public)

---

## 🗺️ Enabling Real APIs

### Google Maps (live map + directions)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Maps JavaScript API** and **Maps Embed API**
3. Create an API key → restrict to your Vercel domain
4. Add `NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key` to Vercel env vars
5. Redeploy — the map screen now shows a live Google Map

### OpenWeatherMap (real weather)

1. Sign up at [openweathermap.org](https://openweathermap.org/api) (free tier is enough)
2. Get your API key
3. Add `NEXT_PUBLIC_OPENWEATHER_KEY=your_key`
4. Update `src/lib/utils.ts` → `getMockWeather()` to call the real API

### Unsplash (real photos)

1. Create an app at [unsplash.com/developers](https://unsplash.com/developers)
2. Get your Access Key
3. Add `NEXT_PUBLIC_UNSPLASH_KEY=your_key`
4. In `ActivityCard.tsx`, replace static image URLs with:
   ```ts
   `https://api.unsplash.com/photos/random?query=${encodeURIComponent(activity.title)}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_KEY}`
   ```

---

## 📁 Project Structure

```
wanderfam/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Redirects to seed trip
│   │   ├── layout.tsx                  # Root layout + PWA meta
│   │   ├── globals.css
│   │   ├── trip/[slug]/
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── itinerary/page.tsx      # Day-by-day timeline
│   │   │   ├── explore/page.tsx        # Activity browser
│   │   │   ├── activity/[id]/page.tsx  # Activity detail
│   │   │   ├── map/page.tsx            # Map view
│   │   │   ├── today/page.tsx          # Today view
│   │   │   └── settings/page.tsx       # Settings + share
│   │   └── share/[shareToken]/page.tsx # Public family share page
│   ├── components/
│   │   ├── layout/                     # TopBar, BottomNav, Providers
│   │   ├── trip/                       # TripDashboard, Itinerary, Timeline, Today
│   │   ├── activity/                   # ActivityCard, ActivityDetail
│   │   └── map/                        # MapClient
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase clients
│   │   ├── utils.ts                    # Helpers + mock weather
│   │   └── seed-data.ts                # Full Austria+Munich trip data
│   ├── store/
│   │   └── trip-store.ts               # Zustand (done/skip/fav state)
│   └── types/
│       └── index.ts                    # All TypeScript types
├── supabase/
│   └── schema.sql                      # Full DB schema + RLS policies
├── public/
│   └── manifest.json                   # PWA manifest
├── .env.local.example                  # Env template
├── next.config.js                      # Next.js + PWA config
├── tailwind.config.ts
└── README.md
```

---

## 🔮 Future Roadmap

| Feature | Effort |
|---|---|
| Supabase Auth (invite family members) | Medium |
| Real-time sync (family marks activity done) | Medium |
| PIN-protected share links | Small |
| Create new trip UI (trip builder wizard) | Large |
| Live weather via OpenWeatherMap | Small |
| Drag-and-drop itinerary reordering | Medium |
| Photo gallery per activity | Medium |
| Push notifications (day reminders) | Medium |
| Packing list | Small |
| Budget tracker | Medium |
| Multi-language (Hebrew RTL) | Medium |
| Itinerary AI generator | Large |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (persisted) |
| Data fetching | TanStack Query |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (optional) |
| PWA | next-pwa (Workbox) |
| Deployment | Vercel |
| Fonts | DM Sans + Playfair Display |

---

## 🆘 Troubleshooting

**`Module not found: next-pwa`**
```bash
npm install next-pwa
```

**PWA not working locally**
Normal — PWA service worker is disabled in development (`NODE_ENV === 'development'`). Test on Vercel or run `npm run build && npm start`.

**Supabase connection errors**
The app falls back to seed data automatically. Check your `.env.local` keys.

**iOS Safari: app doesn't go full-screen**
Make sure you used Safari (not Chrome) on iOS to add to home screen. Only Safari triggers full-screen PWA mode on iOS.
