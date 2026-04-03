-- ============================================================
-- Migration: add review_due_date to policies
-- ============================================================
alter table policies
  add column if not exists review_due_date date;
