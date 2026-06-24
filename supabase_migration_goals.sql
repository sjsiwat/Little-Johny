-- ============================================================
-- Migration: Goals Architecture v2
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Goals table
create table if not exists public.goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  color      text not null default '#0A84FF',
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists goals_user_id_idx on public.goals(user_id);

-- 2. Add goal_id to tasks
alter table public.tasks
  add column if not exists goal_id uuid references public.goals(id) on delete set null;

-- 3. Add goal_id to notes
alter table public.notes
  add column if not exists goal_id uuid references public.goals(id) on delete set null;

-- 4. Add goal_id to expenses
alter table public.expenses
  add column if not exists goal_id uuid references public.goals(id) on delete set null;
