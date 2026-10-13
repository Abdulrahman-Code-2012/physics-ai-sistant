-- Student learning progress and personalized revision planner.
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  percentage integer not null check (percentage between 0 and 100),
  paper text not null,
  topic text not null,
  topic_results jsonb not null default '[]'::jsonb,
  mistakes jsonb not null default '[]'::jsonb,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_student_created_idx on public.quiz_attempts(student_id, created_at desc);
alter table public.quiz_attempts enable row level security;
drop policy if exists "Students can read own quiz attempts" on public.quiz_attempts;
create policy "Students can read own quiz attempts" on public.quiz_attempts for select to authenticated using (student_id = (select auth.uid()));
drop policy if exists "Students can save own quiz attempts" on public.quiz_attempts;
create policy "Students can save own quiz attempts" on public.quiz_attempts for insert to authenticated with check (student_id = (select auth.uid()));
drop policy if exists "Students can delete own quiz attempts" on public.quiz_attempts;
create policy "Students can delete own quiz attempts" on public.quiz_attempts for delete to authenticated using (student_id = (select auth.uid()));

create table if not exists public.revision_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recommendation_key text not null,
  title text not null,
  topic text,
  reason text,
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  due_date date,
  completed_at timestamptz,
  source_type text not null default 'recommendation',
  source_id uuid,
  created_at timestamptz not null default now(),
  unique(user_id, recommendation_key)
);
create index if not exists revision_tasks_user_status_idx on public.revision_tasks(user_id, completed_at, due_date);
alter table public.revision_tasks enable row level security;
drop policy if exists "Students manage own revision tasks" on public.revision_tasks;
create policy "Students manage own revision tasks" on public.revision_tasks for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table if not exists public.revision_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  exam_date date,
  updated_at timestamptz not null default now()
);
alter table public.revision_preferences enable row level security;
drop policy if exists "Students manage own revision preferences" on public.revision_preferences;
create policy "Students manage own revision preferences" on public.revision_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
