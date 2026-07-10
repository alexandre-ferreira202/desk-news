-- Tabela usada para sincronizar o evento RODA_VT entre o Teleponto (tp.tsx)
-- e o Playout (playout.tsx), inclusive entre máquinas diferentes.
-- (Banco Neon / Postgres puro — sem RLS/políticas do Supabase)

CREATE TABLE IF NOT EXISTS tp_playout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  materia_id uuid,
  item_id uuid,
  assunto text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para acelerar o polling (busca pelo evento mais recente)
CREATE INDEX IF NOT EXISTS idx_tp_playout_events_created_at
  ON tp_playout_events (created_at DESC);

