
ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS editor_texto text;
ALTER TABLE public.materias ADD COLUMN IF NOT EXISTS editor_imagem text;
DELETE FROM public.espelho_itens WHERE materia_id IS NOT NULL;
DELETE FROM public.materias;
