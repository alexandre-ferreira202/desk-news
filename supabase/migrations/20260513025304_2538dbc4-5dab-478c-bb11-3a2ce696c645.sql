ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS tempo_cab text;

CREATE TABLE IF NOT EXISTS public.relatorios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL DEFAULT CURRENT_DATE,
  retranca text NOT NULL,
  evento text NOT NULL,
  programa text NOT NULL,
  texto text NOT NULL,
  autor_id uuid NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relatorios_read" ON public.relatorios FOR SELECT TO authenticated USING (true);
CREATE POLICY "relatorios_insert_self" ON public.relatorios FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "relatorios_update_owner_or_staff" ON public.relatorios FOR UPDATE TO authenticated USING (auth.uid() = autor_id OR public.is_staff(auth.uid()));
CREATE POLICY "relatorios_delete_owner_or_staff" ON public.relatorios FOR DELETE TO authenticated USING (auth.uid() = autor_id OR public.is_staff(auth.uid()));