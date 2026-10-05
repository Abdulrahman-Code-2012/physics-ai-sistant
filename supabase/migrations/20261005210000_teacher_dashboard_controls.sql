ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_banned_idx ON public.profiles(banned);
DROP POLICY IF EXISTS "Teachers can read all conversations" ON public.conversations;
CREATE POLICY "Teachers can read all conversations" ON public.conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='teacher'));
DROP POLICY IF EXISTS "Teachers can read all messages" ON public.messages;
CREATE POLICY "Teachers can read all messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='teacher'));
DROP POLICY IF EXISTS "Teachers can read all paper checks" ON public.paper_checks;
CREATE POLICY "Teachers can read all paper checks" ON public.paper_checks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='teacher'));