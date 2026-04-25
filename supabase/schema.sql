-- ============================================================
-- Wanderfam — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TRIPS
-- ============================================================
create table public.trips (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  name            text not null,
  tagline         text,
  start_date      date not null,
  end_date        date not null,
  cover_emoji     text default '⛰️',
  cover_image_url text,

  -- travelers
  adults_count    int not null default 2,
  children_ages   int[] default '{}',

  -- style
  travel_style    text default 'relaxed' check (travel_style in ('relaxed', 'moderate', 'intensive')),
  kid_focused     boolean default true,
  nature_first    boolean default true,

  -- access
  is_public       boolean default true,
  pin_hash        text,
  share_token     text unique not null default encode(gen_random_bytes(8), 'hex'),

  -- owner (nullable for anonymous/seed trips)
  owner_id        uuid references auth.users(id) on delete set null,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- TRIP DESTINATIONS
-- ============================================================
create table public.trip_destinations (
  id                  uuid primary key default uuid_generate_v4(),
  trip_id             uuid references public.trips(id) on delete cascade not null,
  name                text not null,
  country             text not null,
  lat                 double precision not null,
  lng                 double precision not null,
  arrival_date        date not null,
  departure_date      date not null,
  accommodation_name  text,
  sort_order          int default 0,
  created_at          timestamptz default now()
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table public.activities (
  id                  uuid primary key default uuid_generate_v4(),
  trip_id             uuid references public.trips(id) on delete cascade not null,
  title               text not null,
  description         text not null,
  emoji               text default '📍',

  -- location
  location_name       text not null,
  region              text not null,
  country             text not null,
  lat                 double precision not null,
  lng                 double precision not null,
  google_maps_url     text,
  website             text,

  -- logistics
  duration_minutes    int not null,
  difficulty          text default 'easy' check (difficulty in ('easy', 'moderate', 'hard')),
  recommended_ages    text default 'All ages',
  activity_type       text default 'outdoor' check (activity_type in ('outdoor', 'indoor', 'mixed')),
  weather_suitability text default 'good-weather' check (weather_suitability in ('good-weather', 'any-weather', 'indoor-only')),

  -- pricing
  price_level         text default '€' check (price_level in ('free', '€', '€€', '€€€', '€€€€')),
  price_estimate      text,
  booking_required    boolean default false,
  booking_url         text,

  -- rich content
  tips                text,
  family_notes        text,
  tags                text[] default '{}',
  images              text[] default '{}',

  -- ratings (mocked; replace with real API)
  google_rating       numeric(3,1),
  google_review_count int,
  tripadvisor_rating  numeric(3,1),

  -- nearby
  nearby_restaurants  jsonb default '[]',
  nearby_attractions  jsonb default '[]',

  is_rainy_day_alt    boolean default false,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- ITINERARY DAYS
-- ============================================================
create table public.itinerary_days (
  id              uuid primary key default uuid_generate_v4(),
  trip_id         uuid references public.trips(id) on delete cascade not null,
  date            date not null,
  day_number      int not null,
  label           text not null,
  theme           text,
  base_location   text not null,
  base_lat        double precision not null,
  base_lng        double precision not null,
  phase           text default 'austria' check (phase in ('austria', 'munich', 'transit')),
  created_at      timestamptz default now(),
  unique(trip_id, date)
);

-- ============================================================
-- ITINERARY SLOTS
-- ============================================================
create table public.itinerary_slots (
  id                              uuid primary key default uuid_generate_v4(),
  day_id                          uuid references public.itinerary_days(id) on delete cascade not null,
  activity_id                     uuid references public.activities(id) on delete set null,
  sort_order                      int not null default 0,
  start_time                      text,          -- "09:00"
  end_time                        text,          -- "12:30"
  custom_note                     text,
  status                          text default 'planned' check (status in ('planned', 'done', 'skipped', 'favorite')),
  travel_time_from_prev_minutes   int,
  is_meal                         boolean default false,
  meal_suggestion                 text,
  created_at                      timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.trips enable row level security;
alter table public.trip_destinations enable row level security;
alter table public.activities enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_slots enable row level security;

-- Public trips are readable by anyone
create policy "Public trips are viewable by all"
  on public.trips for select
  using (is_public = true);

-- Owners can do everything to their trips
create policy "Owners have full access to trips"
  on public.trips for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Related tables: readable if parent trip is public
create policy "Public trip destinations readable"
  on public.trip_destinations for select
  using (exists (
    select 1 from public.trips
    where trips.id = trip_destinations.trip_id and trips.is_public = true
  ));

create policy "Public activities readable"
  on public.activities for select
  using (exists (
    select 1 from public.trips
    where trips.id = activities.trip_id and trips.is_public = true
  ));

create policy "Public itinerary days readable"
  on public.itinerary_days for select
  using (exists (
    select 1 from public.trips
    where trips.id = itinerary_days.trip_id and trips.is_public = true
  ));

create policy "Public itinerary slots readable"
  on public.itinerary_slots for select
  using (exists (
    select 1 from public.itinerary_days
    join public.trips on trips.id = itinerary_days.trip_id
    where itinerary_days.id = itinerary_slots.day_id and trips.is_public = true
  ));

-- ============================================================
-- USEFUL INDEXES
-- ============================================================
create index trips_slug_idx on public.trips(slug);
create index trips_share_token_idx on public.trips(share_token);
create index activities_trip_id_idx on public.activities(trip_id);
create index days_trip_id_idx on public.itinerary_days(trip_id);
create index slots_day_id_idx on public.itinerary_slots(day_id);
create index slots_sort_idx on public.itinerary_slots(day_id, sort_order);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_updated_at before update on public.trips
  for each row execute function public.handle_updated_at();

create trigger activities_updated_at before update on public.activities
  for each row execute function public.handle_updated_at();
