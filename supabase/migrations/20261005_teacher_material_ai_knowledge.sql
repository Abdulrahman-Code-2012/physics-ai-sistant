-- Teacher materials become explicit, teacher-controlled AI knowledge sources.
alter table public.materials add column if not exists ai_enabled boolean not null default true;
create index if not exists materials_ai_enabled_created_idx on public.materials(ai_enabled, created_at desc);
create index if not exists materials_content_search_idx on public.materials using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(unit_name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(content_text,'')));
alter table public.materials enable row level security;
drop policy if exists "Teachers can insert own materials" on public.materials;
create policy "Teachers can insert own materials" on public.materials for insert to authenticated with check ((select auth.uid()) = teacher_id and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='teacher'));
drop policy if exists "Teachers can delete own materials" on public.materials;
create policy "Teachers can delete own materials" on public.materials for delete to authenticated using ((select auth.uid()) = teacher_id and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='teacher'));
drop policy if exists "Teachers can update own materials" on public.materials;
create policy "Teachers can update own materials" on public.materials for update to authenticated using ((select auth.uid()) = teacher_id and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='teacher')) with check ((select auth.uid()) = teacher_id and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='teacher'));
