-- Tabela usada pelo tp.tsx (Master) para publicar o estado do teleprompter
-- e lida pelo playout.tsx (painel "TELEPROMPTER — Acompanhamento") e por
-- outras instâncias do tp.tsx em modo "camera".

CREATE TABLE IF NOT EXISTS tp_master_state (
  canal      TEXT PRIMARY KEY,
  state      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- índice extra por segurança (canal já é PK, mas garante lookups rápidos)
CREATE INDEX IF NOT EXISTS idx_tp_master_state_updated_at
  ON tp_master_state (updated_at DESC);
