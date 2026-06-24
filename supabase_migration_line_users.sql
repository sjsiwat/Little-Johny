-- ============================================================
-- Migration: LINE User Linking
-- Run this in Supabase SQL Editor
-- ============================================================

create table if not exists public.line_users (
  line_user_id  text      primary key,
  user_id       uuid      not null references auth.users(id) on delete cascade,
  linked_at     timestamptz not null default now()
);

alter table public.line_users enable row level security;

-- Authenticated user can read/write only their own row
create policy "Users manage own LINE link"
  on public.line_users for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role (used by worker) can read all rows (no RLS bypass needed — worker uses service_role key)
create index if not exists line_users_user_id_idx on public.line_users(user_id);
