-- Fixes from the Supabase security and performance advisors.

-- handle_new_user only runs as the auth.users trigger; it must not be
-- callable through /rest/v1/rpc.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Cover the remaining foreign keys.
create index bars_song_idx on public.bars (song_id);
create index likes_bar_idx on public.likes (bar_id);

-- One SELECT policy on bars instead of two overlapping permissive ones,
-- and owner writes limited to signed-in users.
drop policy "Owners manage their bars" on public.bars;
drop policy "Public bars are readable by everyone" on public.bars;

create policy "Bars are readable by their owner or when public" on public.bars
  for select using (is_public or (select auth.uid()) = owner_id);
create policy "Owners create their bars" on public.bars
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owners update their bars" on public.bars
  for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Owners delete their bars" on public.bars
  for delete to authenticated using ((select auth.uid()) = owner_id);
