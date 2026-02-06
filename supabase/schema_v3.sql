-- ✅ Run in Supabase SQL Editor (once).
-- Community board + admin + hero banner settings for INO (FM-style community)

-- === Existing schema_v2.sql should already be applied. This v3 adds:
-- 1) site_settings (hero title/subtitle/image)
-- 2) admins (who can edit hero + notices)
-- 3) RLS policies for the above

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id) on delete set null
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.admins enable row level security;

-- Public can read settings
drop policy if exists "site_settings_read_all" on public.site_settings;
create policy "site_settings_read_all" on public.site_settings
  for select using (true);

-- Only admins can update settings
drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin" on public.site_settings
  for update to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "site_settings_insert_admin" on public.site_settings;
create policy "site_settings_insert_admin" on public.site_settings
  for insert to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins table: only admins can view the list (optional)
drop policy if exists "admins_read_admin" on public.admins;
create policy "admins_read_admin" on public.admins
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Only admins can add/remove admins (manual admin bootstrap needed)
drop policy if exists "admins_insert_admin" on public.admins;
create policy "admins_insert_admin" on public.admins
  for insert to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "admins_delete_admin" on public.admins;
create policy "admins_delete_admin" on public.admins
  for delete to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Seed default hero (safe upsert)
insert into public.site_settings(key, value)
values
  ('hero_title', '이노레이블 스타부 - 이노대'),
  ('hero_sub', '팬 커뮤니티 · 공지 · 소식 · 밈'),
  ('hero_image', 'assets/logo.jpg')
on conflict (key) do nothing;

-- NOTE: Bootstrap the first admin manually in SQL after you know your user_id:
-- insert into public.admins(user_id) values ('YOUR_USER_UUID');
