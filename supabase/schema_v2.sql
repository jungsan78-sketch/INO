-- ✅ Run in Supabase SQL Editor (once). Safe to run multiple times.
-- Adds board-style community features: boards, views, upvotes, comment_count, popular(72h) logic.

-- 1) Extend posts table
alter table public.posts add column if not exists board text not null default '자유';
alter table public.posts add column if not exists views int not null default 0;
alter table public.posts add column if not exists upvotes int not null default 0;
alter table public.posts add column if not exists comment_count int not null default 0;
alter table public.posts add column if not exists is_notice boolean not null default false;

-- 2) Upvote log table (prevents duplicate upvotes per user)
create table if not exists public.post_upvotes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 3) Triggers to keep comment_count accurate
create or replace function public._inc_comment_count() returns trigger
language plpgsql as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end $$;

create or replace function public._dec_comment_count() returns trigger
language plpgsql as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end $$;

drop trigger if exists trg_comments_inc on public.comments;
create trigger trg_comments_inc
after insert on public.comments
for each row execute function public._inc_comment_count();

drop trigger if exists trg_comments_dec on public.comments;
create trigger trg_comments_dec
after delete on public.comments
for each row execute function public._dec_comment_count();

-- 4) Security-definer RPCs for view/upvote (works with RLS)
create or replace function public.increment_post_views(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts set views = views + 1 where id = p_post_id;
end $$;

create or replace function public.toggle_post_upvote(p_post_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if exists (select 1 from public.post_upvotes where post_id = p_post_id and user_id = v_uid) then
    delete from public.post_upvotes where post_id = p_post_id and user_id = v_uid;
    update public.posts set upvotes = greatest(upvotes - 1, 0) where id = p_post_id;
  else
    insert into public.post_upvotes(post_id, user_id) values (p_post_id, v_uid);
    update public.posts set upvotes = upvotes + 1 where id = p_post_id;
  end if;

  return (select upvotes from public.posts where id = p_post_id);
end $$;

-- 5) Indexes
create index if not exists posts_board_created_at_idx on public.posts(board, created_at desc);
create index if not exists posts_popular_idx on public.posts(created_at desc, upvotes desc, views desc);

-- 6) RLS
alter table public.post_upvotes enable row level security;

-- Read policies (public read)
drop policy if exists "posts_read_all" on public.posts;
create policy "posts_read_all" on public.posts for select using (true);

drop policy if exists "comments_read_all" on public.comments;
create policy "comments_read_all" on public.comments for select using (true);

drop policy if exists "post_images_read_all" on public.post_images;
create policy "post_images_read_all" on public.post_images for select using (true);

drop policy if exists "upvotes_read_all" on public.post_upvotes;
create policy "upvotes_read_all" on public.post_upvotes for select using (true);

-- Insert/update/delete policies (authenticated users)
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

drop policy if exists "post_images_insert_auth" on public.post_images;
create policy "post_images_insert_auth" on public.post_images
  for insert to authenticated
  with check (true);

drop policy if exists "post_images_delete_auth" on public.post_images;
create policy "post_images_delete_auth" on public.post_images
  for delete to authenticated
  using (true);

drop policy if exists "upvotes_insert_auth" on public.post_upvotes;
create policy "upvotes_insert_auth" on public.post_upvotes
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "upvotes_delete_own" on public.post_upvotes;
create policy "upvotes_delete_own" on public.post_upvotes
  for delete to authenticated
  using (auth.uid() = user_id);
