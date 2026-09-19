-- ============================================================
-- FLUXMEDIA — Supabase schema
-- Mirrors the data contract used by lib/db.ts (local adapter).
-- Run in the Supabase SQL editor. Multilingual text is stored as
-- JSONB {"en":"","fr":"","ar":""}.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Site-wide ----------
create table if not exists site_settings (
  id            int primary key default 1 check (id = 1),
  site_name     text not null default 'FLUXMEDIA',
  tagline       jsonb not null default '{}',
  contact_email text,
  whatsapp      text,
  address       jsonb not null default '{}',
  footer_note   jsonb not null default '{}',
  updated_at    timestamptz not null default now()
);

create table if not exists site_content (          -- generic key/value blocks (homepage, about…)
  key         text primary key,
  value       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

create table if not exists navigation_items (
  id         uuid primary key default gen_random_uuid(),
  label      jsonb not null,
  href       text not null,
  sort_order int  not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Automations ----------
create table if not exists automation_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null,
  sort_order int not null default 0,
  active     boolean not null default true
);

create table if not exists automations (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  category_id  uuid references automation_categories(id) on delete set null,
  icon         text not null default 'sparkles',
  title        jsonb not null,
  short        jsonb not null default '{}',
  description  jsonb not null default '{}',
  benefits     jsonb not null default '[]',     -- array of ML
  workflow     jsonb not null default '[]',     -- array of ML (ordered)
  integrations text[] not null default '{}',
  sort_order   int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- Social media (public page) ----------
create table if not exists social_page_content (
  id                    int primary key default 1 check (id = 1),
  hero_badge            jsonb, hero_title jsonb, hero_description jsonb,
  primary_cta           jsonb, secondary_cta jsonb,
  services_title        jsonb, services_description jsonb,
  services              jsonb not null default '[]',   -- service cards
  platforms_title       jsonb, platforms_description jsonb,
  platforms             text[] not null default '{}',
  packages_title        jsonb, packages_description jsonb,
  process_title         jsonb, process_description jsonb,
  process_steps         jsonb not null default '[]',
  final_cta_title       jsonb, final_cta_description jsonb,
  final_cta_primary     jsonb, final_cta_secondary jsonb,
  updated_at            timestamptz not null default now()
);

create table if not exists social_platforms (
  id    text primary key,          -- instagram, facebook, tiktok, linkedin, youtube, x
  name  text not null,
  active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists social_packages (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  description       jsonb not null default '{}',
  price             numeric(10,2) not null default 0,
  currency          text not null default 'USD',
  billing_period    jsonb not null default '{"en":"per month","fr":"par mois","ar":"شهريًا"}',
  badge             jsonb not null default '{}',
  popular           boolean not null default false,
  visible           boolean not null default true,
  sort_order        int not null default 0,
  posts_per_month   int not null default 0,
  reels_per_month   int not null default 0,
  stories_per_month int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists social_package_features (
  id          uuid primary key default gen_random_uuid(),
  package_id  uuid not null references social_packages(id) on delete cascade,
  text        jsonb not null,
  sort_order  int not null default 0
);

create table if not exists social_package_platforms (
  package_id  uuid references social_packages(id) on delete cascade,
  platform_id text references social_platforms(id) on delete cascade,
  primary key (package_id, platform_id)
);

create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  scope      text not null default 'social-media',
  question   jsonb not null,
  answer     jsonb not null,
  sort_order int not null default 0,
  visible    boolean not null default true
);

-- ---------- Social links (/social page) ----------
create table if not exists social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null,
  name        text not null,
  username    text,
  description jsonb not null default '{}',
  url         text not null,
  active      boolean not null default true,
  sort_order  int not null default 0
);

-- ---------- Requests & messages ----------
do $$ begin
  create type request_type as enum ('automation','social_media');
  create type request_status as enum ('new','reviewing','contacted','in_progress','completed','archived');
exception when duplicate_object then null; end $$;

create table if not exists service_requests (
  id              uuid primary key default gen_random_uuid(),
  type            request_type not null,
  full_name       text not null,
  email           text not null,
  whatsapp        text not null,
  company         text,
  selected_id     text not null,           -- automation id or package id
  selected_name   text not null,
  selected_price  text,
  description     text not null,
  additional      text,
  platforms       text[] default '{}',
  goals           text,
  brand_info      text,
  status          request_status not null default 'new',
  created_at      timestamptz not null default now()
);
create index if not exists service_requests_created_idx on service_requests (created_at desc);

create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  whatsapp   text,
  company    text,
  message    text not null,
  status     text not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------- Social operations workspace ----------
create table if not exists social_clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  industry     text,
  package_id   uuid references social_packages(id) on delete set null,
  platforms    text[] default '{}',
  since        date,
  status       text not null default 'active',
  created_at   timestamptz not null default now()
);

create table if not exists social_accounts (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references social_clients(id) on delete cascade,
  platform   text not null,
  handle     text not null,
  connected  boolean not null default false,
  note       text
);

create table if not exists social_posts (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references social_clients(id) on delete cascade,
  platform      text not null,
  caption       text,
  media_url     text,
  content_type  text,
  campaign      text,
  status        text not null default 'draft',   -- draft|review|approved|scheduled|published
  schedule_date date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists social_posts_date_idx on social_posts (schedule_date);

create table if not exists social_inbox (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references social_clients(id) on delete cascade,
  platform        text not null,
  author          text,
  handle          text,
  body            text not null,
  category        text not null default 'question', -- lead|sales|support|question|spam
  unread          boolean not null default true,
  suggested_reply text,
  created_at      timestamptz not null default now()
);

create table if not exists social_analytics (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references social_clients(id) on delete cascade,
  platform       text not null,
  day            date not null,
  followers      int, reach int, impressions int, engagement int,
  likes int, comments int, shares int, saves int, profile_visits int, clicks int, leads int,
  unique (client_id, platform, day)
);

create table if not exists social_reports (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references social_clients(id) on delete cascade,
  period     text not null,       -- YYYY-MM
  summary    jsonb not null default '{}',
  status     text not null default 'draft',
  file_url   text,
  created_at timestamptz not null default now()
);

-- ---------- Row level security ----------
-- Public site reads through the server with the service role; anon key only
-- needs SELECT on public content. Writes go through admin API routes.
alter table social_packages          enable row level security;
alter table social_package_features  enable row level security;
alter table social_links             enable row level security;
alter table social_page_content      enable row level security;
alter table automations              enable row level security;
alter table automation_categories    enable row level security;
alter table faqs                     enable row level security;
alter table navigation_items         enable row level security;
alter table service_requests         enable row level security;
alter table contact_messages         enable row level security;

create policy "public read packages"   on social_packages         for select using (visible);
create policy "public read features"   on social_package_features for select using (true);
create policy "public read links"      on social_links            for select using (active);
create policy "public read page"       on social_page_content     for select using (true);
create policy "public read automations" on automations            for select using (active);
create policy "public read categories" on automation_categories   for select using (active);
create policy "public read faqs"       on faqs                    for select using (visible);
create policy "public read nav"        on navigation_items        for select using (active);
create policy "public insert requests" on service_requests        for insert with check (true);
create policy "public insert messages" on contact_messages        for insert with check (true);
-- Admin (service role) bypasses RLS.

-- ---------- Seed platforms ----------
insert into social_platforms (id, name, sort_order) values
  ('instagram','Instagram',1),('facebook','Facebook',2),('linkedin','LinkedIn',3),
  ('tiktok','TikTok',4),('youtube','YouTube',5),('x','X / Twitter',6)
on conflict (id) do nothing;
