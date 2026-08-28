-- ============================================================
-- Migration: Task Numeric Progress Tracking
-- Run this in Supabase SQL Editor
-- ============================================================

alter table public.tasks
  add column if not exists target_value  numeric,
  add column if not exists target_unit   text    default '',
  add column if not exists progress_value numeric default 0;
