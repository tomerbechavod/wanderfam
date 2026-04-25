export type PriceLevel = 'free' | '€' | '€€' | '€€€' | '€€€€'
export type Difficulty = 'easy' | 'moderate' | 'hard'
export type ActivityType = 'outdoor' | 'indoor' | 'mixed'
export type WeatherSuitability = 'good-weather' | 'any-weather' | 'indoor-only'
export type TravelStyle = 'relaxed' | 'moderate' | 'intensive'
export type TripPhase = 'austria' | 'munich' | 'transit'
export type ActivityStatus = 'planned' | 'done' | 'skipped' | 'favorite'
export type Lang = 'he' | 'en'

export interface Activity {
  id: string
  trip_id: string
  title: string
  title_he?: string
  description: string
  description_he?: string
  emoji: string
  location_name: string
  region: string
  country: string
  lat: number
  lng: number
  google_maps_url: string | null
  website: string | null
  youtube_url?: string | null
  waze_url?: string | null
  duration_minutes: number
  difficulty: Difficulty
  recommended_ages: string
  activity_type: ActivityType
  weather_suitability: WeatherSuitability
  price_level: PriceLevel
  price_estimate: string | null
  booking_required: boolean
  booking_url: string | null
  tips: string | null
  family_notes: string | null
  tags: string[]
  images: string[]
  google_rating: number | null
  google_review_count: number | null
  tripadvisor_rating: number | null
  nearby_restaurants: NearbyPlace[]
  nearby_attractions: NearbyPlace[]
  is_rainy_day_alt: boolean
  phase?: TripPhase
  created_at: string
  updated_at: string
}

export interface NearbyPlace {
  name: string
  type: string
  distance_km: number
  google_maps_url?: string
}

export interface ItinerarySlot {
  id: string
  day_id: string
  activity_id: string | null
  activity?: Activity | null
  sort_order: number
  start_time: string | null
  end_time: string | null
  custom_note: string | null
  status: ActivityStatus
  travel_time_from_prev_minutes: number | null
  is_meal: boolean
  meal_suggestion: string | null
}

export interface ItineraryDay {
  id: string
  trip_id: string
  date: string
  day_number: number
  label: string
  label_en?: string
  theme: string | null
  base_location: string
  base_lat: number
  base_lng: number
  phase: TripPhase
  slots: ItinerarySlot[]
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

export interface Trip {
  id: string
  slug: string
  name: string
  tagline: string | null
  start_date: string
  end_date: string
  cover_emoji: string
  cover_image_url: string | null
  adults_count: number
  children_ages: number[]
  travel_style: TravelStyle
  kid_focused: boolean
  nature_first: boolean
  is_public: boolean
  pin_hash: string | null
  share_token: string
  destinations: TripDestination[]
  owner_id: string | null
  created_at: string
  updated_at: string
}

export interface TripWithDays extends Trip {
  days: ItineraryDay[]
}

export interface DayWeather {
  date: string
  temp_min: number
  temp_max: number
  description: string
  icon: string
  is_rainy: boolean
}