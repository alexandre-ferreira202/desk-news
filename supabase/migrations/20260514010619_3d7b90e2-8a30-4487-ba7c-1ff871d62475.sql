-- DeskNews: extra fields on pautas + new quadro_cards table

ALTER TABLE public.pautas
  ADD COLUMN IF NOT EXISTS retranca text,
  ADD COLUMN IF NOT EXISTS tipo text,
  ADD COLUMN IF NOT EXISTS turno text,
  ADD COLUMN IF NOT EXISTS data_pauta date,
  ADD COLUMN IF NOT EXISTS reporter text,
  ADD COLUMN IF NOT EXISTS imagens text,
  ADD COLUMN IF NOT EXISTS produtor text,
  ADD COLUMN IF NOT EXISTS horario text,
  ADD COLUMN IF NOT EXISTS local text,
  ADD COLUMN IF NOT EXISTS sonora text,
  ADD COLUMN IF NOT EXISTS contato text,
  ADD COLUMN IF NOT EXISTS proposta text,
  ADD COLUMN IF NOT EXISTS encaminhamento text,
  ADD COLUMN IF NOT EXISTS observacoes text;

CREATE TABLE IF NOT EXISTS public.quadro_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_inicio date NOT NULL,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  turno text NOT NULL CHECK (turno IN ('manha','tarde')),
  retranca text NOT NULL,
  reporter text,
  ordem integer NOT NULL DEFAULT 1,
  autor_id uuid NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quadro_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quadro_read" ON public.quadro_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "quadro_insert_self" ON public.quadro_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "quadro_update_owner_or_staff" ON public.quadro_cards FOR UPDATE TO authenticated USING ((auth.uid() = autor_id) OR public.is_staff(auth.uid()));
CREATE POLICY "quadro_delete_owner_or_staff" ON public.quadro_cards FOR DELETE TO authenticated USING ((auth.uid() = autor_id) OR public.is_staff(auth.uid()));