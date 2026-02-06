-- Run in Supabase SQL Editor (one-time)

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text default '',
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id, created_at);
create index if not exists post_images_post_id_idx on public.post_images(post_id, created_at);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_images enable row level security;

drop policy if exists "posts_read_all" on public.posts;
create policy "posts_read_all" on public.posts
  for select using (true);

drop policy if exists "posts_insert_auth" on public.posts;
create policy "posts_insert_auth" on public.posts
  for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete to authenticated
  using (auth.uid() = author_id);

drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all" on public.comments
  for select using (true);

drop policy if exists "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments
  for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own" on public.comments
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete to authenticated
  using (auth.uid() = author_id);

drop policy if exists "post_images_read_all" on public.post_images;
create policy "post_images_read_all" on public.post_images
  for select using (true);

drop policy if exists "post_images_insert_auth" on public.post_images;
create policy "post_images_insert_auth" on public.post_images
  for insert to authenticated
  with check (true);

drop policy if exists "post_images_delete_auth" on public.post_images;
create policy "post_images_delete_auth" on public.post_images
  for delete to authenticated
  using (true);

-- Storage:
-- 1) Create bucket: community-images (public recommended)
-- 2) Policies in Storage UI:
--    - read: public
--    - write: authenticated
