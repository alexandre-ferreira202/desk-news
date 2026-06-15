ALTER TABLE public.espelho_itens 
  ADD COLUMN IF NOT EXISTS tempo_cab text,
  ADD COLUMN IF NOT EXISTS tempo_total text;