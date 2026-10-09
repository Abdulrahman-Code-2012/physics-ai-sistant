-- Allow the material types used by the teacher dashboard.
-- N#2 uses `teaching`; N#3 uses `past-paper`.
alter table public.materials drop constraint if exists materials_type_check;
alter table public.materials add constraint materials_type_check check (type = any (array['syllabus'::text, 'unit'::text, 'pastpaper'::text, 'teaching'::text, 'past-paper'::text, 'notes'::text]));
