-- Speed up teacher-uploaded past-paper mark-scheme lookup.
-- The dedicated past_paper_mark_schemes table already has a unique composite index
-- on (exam_board, year, session, variant); this partial index covers the fallback
-- lookup in materials without indexing unrelated uploads.
create index if not exists materials_pastpaper_lookup_idx
on public.materials (year, session, paper, created_at desc)
where type = 'past-paper' and file_url is not null;
