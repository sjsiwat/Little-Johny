-- ============================================================
-- Migration: Task description/labels/progress fields
-- Run this in Supabase SQL Editor
--
-- Adds the columns the app has been writing/reading locally but which
-- were never actually present on the live `tasks` table (confirmed via
-- a 400 "Could not find the 'description' column" error during the
-- Next.js Dashboard migration). All ADD COLUMN statements are
-- idempotent (IF NOT EXISTS), so this is safe to run even if some of
-- these columns already exist (e.g. if supabase_migration_task_progress.sql
-- was partially applied before).
-- ============================================================

alter table public.tasks
  add column if not exists description     text    default '',
  add column if not exists labels           text[]  default '{}',
  add column if not exists target_value     numeric,
  add column if not exists target_unit      text    default '',
  add column if not exists progress_value   numeric default 0;
