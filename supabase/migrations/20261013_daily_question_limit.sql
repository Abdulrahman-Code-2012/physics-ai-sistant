-- Atomic daily question allowance for Physics AI-sistant.
-- The daily boundary follows Riyadh local time (Asia/Riyadh).
create table if not exists public.daily_question_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  question_count integer not null default 0 check (question_count between 0 and 20),
  primary key (user_id, usage_date)
);
create table if not exists public.daily_question_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.daily_question_usage enable row level security;
alter table public.daily_question_events enable row level security;
revoke all on public.daily_question_usage from anon, authenticated;
revoke all on public.daily_question_events from anon, authenticated;

create or replace function public.get_daily_question_usage()
returns table(used integer, remaining integer, limit_count integer)
language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_date date; v_count integer;
begin
  v_user := auth.uid();
  if v_user is null then raise exception 'Authentication required'; end if;
  v_date := (now() at time zone 'Asia/Riyadh')::date;
  select coalesce((select u.question_count from public.daily_question_usage u where u.user_id=v_user and u.usage_date=v_date),0) into v_count;
  return query select v_count, greatest(0,20-v_count),20;
end;
$$;

create or replace function public.consume_daily_question()
returns table(allowed boolean, used integer, remaining integer, reservation_id uuid)
language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_date date; v_count integer; v_allowed boolean; v_reservation uuid;
begin
  v_user := auth.uid();
  if v_user is null then raise exception 'Authentication required'; end if;
  v_date := (now() at time zone 'Asia/Riyadh')::date;
  delete from public.daily_question_events where usage_date < v_date - 7;
  delete from public.daily_question_usage where usage_date < v_date - 90;
  insert into public.daily_question_usage(user_id,usage_date,question_count)
  values(v_user,v_date,1)
  on conflict(user_id,usage_date) do update
    set question_count = public.daily_question_usage.question_count + 1
    where public.daily_question_usage.question_count < 20
  returning public.daily_question_usage.question_count into v_count;
  v_allowed := found;
  if not v_allowed then
    select u.question_count into v_count from public.daily_question_usage u where u.user_id=v_user and u.usage_date=v_date;
    return query select false, coalesce(v_count,20), 0, null::uuid;
    return;
  end if;
  insert into public.daily_question_events(user_id,usage_date) values(v_user,v_date) returning id into v_reservation;
  return query select true, v_count, greatest(0,20-v_count), v_reservation;
end;
$$;

create or replace function public.release_daily_question(p_reservation_id uuid)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_date date;
begin
  v_user := auth.uid();
  if v_user is null or p_reservation_id is null then return false; end if;
  update public.daily_question_events e set refunded_at=now()
    where e.id=p_reservation_id and e.user_id=v_user and e.refunded_at is null
    returning e.usage_date into v_date;
  if not found then return false; end if;
  update public.daily_question_usage u set question_count=greatest(0,u.question_count-1)
    where u.user_id=v_user and u.usage_date=v_date;
  return true;
end;
$$;
revoke all on function public.get_daily_question_usage() from public, anon;
revoke all on function public.consume_daily_question() from public, anon;
revoke all on function public.release_daily_question(uuid) from public, anon;
grant execute on function public.get_daily_question_usage() to authenticated;
grant execute on function public.consume_daily_question() to authenticated;
grant execute on function public.release_daily_question(uuid) to authenticated;
