
ALTER TABLE public.espelho_itens
  ADD COLUMN IF NOT EXISTS materia_id uuid REFERENCES public.materias(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS editor_texto_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS editor_imagem_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cabeca text;

ALTER TABLE public.espelho_blocos
  ADD COLUMN IF NOT EXISTS apresentador text;
