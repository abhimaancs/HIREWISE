-- =============================================================================
-- Migration: Add missing RLS policies for candidate_profiles and company_profiles
-- =============================================================================
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Without these policies, upsert/insert/update on candidate_profiles and
-- company_profiles will be silently denied (RLS is enabled but no rules exist).
-- =============================================================================

-- ── candidate_profiles ───────────────────────────────────────────────────────

-- Candidates can read their own profile
create policy "Candidates can view own profile"
  on candidate_profiles
  for select
  using (auth.uid() = id);

-- Candidates can create their own profile row
create policy "Candidates can insert own profile"
  on candidate_profiles
  for insert
  with check (auth.uid() = id);

-- Candidates can update their own profile row
create policy "Candidates can update own profile"
  on candidate_profiles
  for update
  using (auth.uid() = id);

-- Companies need to read candidate profiles (for matching and applicant view)
create policy "Companies can view candidate profiles"
  on candidate_profiles
  for select
  using (auth.role() = 'authenticated');

-- ── company_profiles ─────────────────────────────────────────────────────────

-- Companies can read their own profile
create policy "Companies can view own profile"
  on company_profiles
  for select
  using (auth.uid() = id);

-- Companies can create their own profile row
create policy "Companies can insert own profile"
  on company_profiles
  for insert
  with check (auth.uid() = id);

-- Companies can update their own profile row
create policy "Companies can update own profile"
  on company_profiles
  for update
  using (auth.uid() = id);

-- Candidates need to see company profiles (shown on job cards and candidate pages)
create policy "Candidates can view company profiles"
  on company_profiles
  for select
  using (auth.role() = 'authenticated');
