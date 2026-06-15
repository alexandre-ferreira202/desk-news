
-- 1. Add horario to quadro_cards
ALTER TABLE public.quadro_cards ADD COLUMN IF NOT EXISTS horario text;

-- 2. Avisos
CREATE TABLE IF NOT EXISTS public.avisos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assunto text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  autor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY avisos_read ON public.avisos FOR SELECT TO authenticated USING (true);
CREATE POLICY avisos_insert_self ON public.avisos FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY avisos_update_owner_or_staff ON public.avisos FOR UPDATE TO authenticated
  USING ((auth.uid() = autor_id) OR is_staff(auth.uid()));
CREATE POLICY avisos_delete_owner_or_staff ON public.avisos FOR DELETE TO authenticated
  USING ((auth.uid() = autor_id) OR is_staff(auth.uid()));

-- 3. Gaveta de VTs
CREATE TABLE IF NOT EXISTS public.vts_gaveta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa text NOT NULL,
  retranca text NOT NULL,
  data_pronto date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  autor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vts_gaveta ENABLE ROW LEVEL SECURITY;

CREATE POLICY vts_gaveta_read ON public.vts_gaveta FOR SELECT TO authenticated USING (true);
CREATE POLICY vts_gaveta_insert_self ON public.vts_gaveta FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY vts_gaveta_update_owner_or_staff ON public.vts_gaveta FOR UPDATE TO authenticated
  USING ((auth.uid() = autor_id) OR is_staff(auth.uid()));
CREATE POLICY vts_gaveta_delete_owner_or_staff ON public.vts_gaveta FOR DELETE TO authenticated
  USING ((auth.uid() = autor_id) OR is_staff(auth.uid()));
