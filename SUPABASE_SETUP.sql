-- Run this in Supabase → SQL Editor → New Query → Run

create table if not exists app_state (
  user_id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table app_state enable row level security;

-- Since this is a personal single-user app with no login, allow anon access.
-- (Data is protected by the fixed user_id + your anon key staying private.)
create policy "allow anon full access"
  on app_state for all
  using (true)
  with check (true);

-- ── REALTIME (run this too, for instant cross-device sync) ──
-- Enables live push of changes to all your open devices.
alter publication supabase_realtime add table app_state;
