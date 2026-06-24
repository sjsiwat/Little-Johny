-- ============================================================
-- Migration: JohnyMemo Architecture v2
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add display_name and picture_url if not already present (may exist from previous migration)
alter table public.line_users
  add column if not exists display_name text,
  add column if not exists picture_url  text;

-- Add plan column (free / pro). Existing rows default to 'free'.
-- If you previously used 'tier' with value 'premium', migrate those rows to 'pro'.
alter table public.line_users
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'pro'));

-- Migrate any existing 'premium' tier users to 'pro' plan
update public.line_users
  set plan = 'pro'
  where plan = 'free'
    and exists (
      select 1 from information_schema.columns
      where table_name = 'line_users' and column_name = 'tier'
    )
    and (select tier from public.line_users lu2 where lu2.line_user_id = line_users.line_user_id) = 'premium';

-- Index for fast plan lookups
create index if not exists line_users_plan_idx on public.line_users(plan);
