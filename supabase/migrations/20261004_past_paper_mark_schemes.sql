create table if not exists public.past_paper_mark_schemes (
  id uuid primary key default gen_random_uuid(),
  exam_board text not null,
  year text not null,
  session text not null,
  variant text not null,
  file_path text not null,
  file_name text,
  created_at timestamptz not null default now(),
  active boolean not null default true,
  unique (exam_board, year, session, variant)
);
alter table public.past_paper_mark_schemes enable row level security;
revoke all on public.past_paper_mark_schemes from anon, authenticated;
grant select on public.past_paper_mark_schemes to service_role;
