-- ========================================================================
-- Pilgrimage Website: Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ========================================================================

-- 1. SUBSCRIBERS TABLE: Stores emails for journey updates
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- Index for quick lookups
create index if not exists subscribers_email_idx on public.subscribers (email);
create index if not exists subscribers_created_at_idx on public.subscribers (created_at desc);

-- 2. SITE SETTINGS TABLE: Dynamic website configuration (GoFundMe link, stats, trail status)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed initial settings if not present
insert into public.site_settings (key, value)
values
  (
    'gofundme',
    jsonb_build_object(
      'url', 'https://www.gofundme.com/f/bryn-walks-south-heath-to-rome',
      'amountRaised', 14850,
      'targetAmount', 25000,
      'donorCount', 342,
      'currencySymbol', '£'
    )
  ),
  (
    'journey_status',
    jsonb_build_object(
      'currentSegmentIndex', 0,
      'statusNote', 'Preparing to set off from Buckinghamshire'
    )
  )
on conflict (key) do nothing;

-- 3. BROADCAST EMAILS LOG TABLE: History of progress emails sent via Resend
create table if not exists public.broadcast_emails (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  content text not null,
  recipient_count integer not null default 0,
  status text not null default 'sent',
  sent_at timestamptz not null default now()
);

create index if not exists broadcast_emails_sent_at_idx on public.broadcast_emails (sent_at desc);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS
alter table public.subscribers enable row level security;
alter table public.site_settings enable row level security;
alter table public.broadcast_emails enable row level security;

-- Subscribers policies:
-- Anyone can subscribe (INSERT)
drop policy if exists "Allow public email subscriptions" on public.subscribers;
create policy "Allow public email subscriptions"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Authenticated users (admin) can view subscribers
drop policy if exists "Allow authenticated admin to view subscribers" on public.subscribers;
create policy "Allow authenticated admin to view subscribers"
  on public.subscribers
  for select
  to authenticated
  using (true);

-- Site settings policies:
-- Anyone can read site settings (GoFundMe link, status)
drop policy if exists "Allow public to read site settings" on public.site_settings;
create policy "Allow public to read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- Only authenticated users (admin) can update site settings
drop policy if exists "Allow authenticated admin to update site settings" on public.site_settings;
create policy "Allow authenticated admin to update site settings"
  on public.site_settings
  for all
  to authenticated
  using (true)
  with check (true);

-- Broadcast emails policies:
-- Only authenticated users (admin) can view and insert broadcast logs
drop policy if exists "Allow authenticated admin to manage broadcast emails" on public.broadcast_emails;
create policy "Allow authenticated admin to manage broadcast emails"
  on public.broadcast_emails
  for all
  to authenticated
  using (true)
  with check (true);

