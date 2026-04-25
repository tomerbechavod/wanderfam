// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export type PriceLevel = 'free' | '€' | '€€' | '€€€' | '€€€€'
export type Difficulty = 'easy' | 'moderate' | 'hard'
export type ActivityType = 'outdoor' | 'indoor' | 'mixed'
export type WeatherSuitability = 'good-weather' | 'any-weather' | 'indoor-only'
export type TravelStyle = 'relaxed' | 'moderate' | 'intensive'
export type TripPhase = 'austria' | 'munich' | 'transit'
export type ActivityStatus = 'planned' | 'done' | 'skipped' | 'favorite'

// ============================================================
// ACTIVITY
// ============================================================
export interface Activity {
  id: string
  trip_id: string
  title: string
  description: string
  emoji: string

  // Location
  location_name: string
  region: string
  country: string
  lat: number
  lng: number
  google_maps_url: string | null
  website: string | null

  // Logistics
  duration_minutes: number
  difficulty: Difficulty
  recommended_ages: string       // e.g. "All ages" | "5+" | "Adults"
  activity_type: ActivityType
  weather_suitability: WeatherSuitability

  // Pricing
  price_level: PriceLevel
  price_estimate: string | null  // "€18 adult, €8 child"
  booking_required: boolean
  booking_url: string | null

  // Rich data
  tips: string | null
  family_notes: string | null
  tags: string[]
  images: string[]               // Unsplash or Supabase Storage URLs

  // Ratings (mocked, swap for real API)
  google_rating: number | null
  google_review_count: number | null
  tripadvisor_rating: number | null

  // Nearby
  nearby_restaurants: NearbyPlace[]
  nearby_attractions: NearbyPlace[]

  // Rainy day alternative flag
  is_rainy_day_alt: boolean

  created_at: string
  updated_at: string
}

export interface NearbyPlace {
  name: string
  type: string
  distance_km: number
  google_maps_url?: string
}

// ============================================================
// ITINERARY
// ============================================================
export interface ItineraryDay {
  id: string
  trip_id: string
  date: string                   // ISO date "2026-08-18"
  day_number: number
  label: string                  // "Arrival", "Hallstatt Day", etc.
  theme: string | null
  base_location: string          // "Flachau, Austria"
  base_lat: number
  base_lng: number
  phase: TripPhase
  slots: ItinerarySlot[]
}

export interface ItinerarySlot {
  id: string
  day_id: string
  activity_id: string | null
  activity?: Activity            // joined
  sort_order: number
  start_time: string | null      // "09:00"
  end_time: string | null        // "12:30"
  custom_note: string | null
  status: ActivityStatus
  travel_time_from_prev_minutes: number | null
  is_meal: boolean
  meal_suggestion: string | null
}

// ============================================================
// TRIP
// ============================================================
export interface Trip {
  id: string
  slug: string                   // URL-safe, e.g. "alps-bavaria-2026"
  name: string
  tagline: string | null
  start_date: string
  end_date: string
  cover_emoji: string
  cover_image_url: string | null

  // Travelers
  adults_count: number
  children_ages: number[]        // [6, 9, 12]

  // Style
  travel_style: TravelStyle
  kid_focused: boolean
  nature_first: boolean

  // Access
  is_public: boolean             // true = anyone with link can view
  pin_hash: string | null        // bcrypt hash of PIN, null = no pin
  share_token: string            // random token for share URL

  // Destinations
  destinations: TripDestination[]

  // Owner
  owner_id: string | null        // null for anonymous/seed trips

  created_at: string
  updated_at: string
}

export interface TripDestination {
  id: string
  trip_id: string
  name: string
  country: string
  lat: number
  lng: number
  arrival_date: string
  departure_date: string
  accommodation_name: string | null
  sort_order: number
}

// ============================================================
// USER PREFERENCES (local state, not DB)
// ============================================================
export interface UserTripState {
  trip_id: string
  activity_statuses: Record<string, ActivityStatus>
  favorite_activity_ids: string[]
  notes: Record<string, string>   // slot_id -> note
}

// ============================================================
// WEATHER (OpenWeatherMap shape, mocked until API key added)
// ============================================================
export interface DayWeather {
  date: string
  temp_min: number
  temp_max: number
  description: string
  icon: string
  is_rainy: boolean
}

// ============================================================
// API RESPONSES
// ============================================================
export interface TripWithDays extends Trip {
  days: ItineraryDay[]
}

export interface SharePageProps {
  trip: TripWithDays
  isOwner: boolean
  viewOnly: boolean
}
