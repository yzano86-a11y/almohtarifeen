-- Security hardening: players must never be able to read another player's hand.
drop policy if exists tarneeb_players_member_select on public.tarneeb_players;

create policy tarneeb_players_own_select
on public.tarneeb_players
for select
to authenticated
using (user_id = (select auth.uid()));
