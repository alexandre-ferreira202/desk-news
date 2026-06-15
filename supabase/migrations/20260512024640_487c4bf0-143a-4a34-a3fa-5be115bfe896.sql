ALTER TABLE public.materias
  ADD COLUMN IF NOT EXISTS cabeca text,
  ADD COLUMN IF NOT EXISTS tempo_vt text,
  ADD COLUMN IF NOT EXISTS deixa text,
  ADD COLUMN IF NOT EXISTS entrevistado_nome text,
  ADD COLUMN IF NOT EXISTS entrevistado_funcao text,
  ADD COLUMN IF NOT EXISTS credito_reporter text,
  ADD COLUMN IF NOT EXISTS estrutura text;