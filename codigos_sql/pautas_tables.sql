-- ============================================================
-- TABELAS DO MÓDULO PAUTAS — DeskNews
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. PAUTAS
create table if not exists pautas (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  retranca      text,
  tipo          text,
  turno         text,
  data_pauta    date,
  reporter      text,
  imagens       text,
  produtor      text,
  horario       text,
  local         text,
  sonora        text,
  contato       text,
  proposta      text,
  encaminhamento text,
  observacoes   text,
  status        text not null default 'sugestao',
  criado_por    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);

-- 2. QUADRO SEMANAL
create table if not exists quadro_cards (
  id            uuid primary key default gen_random_uuid(),
  semana_inicio date not null,
  dia_semana    int  not null, -- 0=Segunda ... 6=Domingo
  turno         text not null check (turno in ('manha', 'tarde')),
  retranca      text not null,
  reporter      text,
  horario       text,
  ordem         int  not null default 0,
  autor_id      uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);

-- 3. AVISOS
create table if not exists avisos (
  id         uuid primary key default gen_random_uuid(),
  assunto    text not null,
  data       date not null default current_date,
  autor_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. GAVETA DE VTs
create table if not exists vt_gaveta (
  id          uuid primary key default gen_random_uuid(),
  programa    text not null,
  retranca    text not null,
  data_pronto date not null,
  observacao  text,
  autor_id    uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

-- ============================================================
-- RLS — Row Level Security
-- Por enquanto: leitura e escrita liberadas para todos
-- (ajustar quando o login estiver pronto)
-- ============================================================

alter table pautas      enable row level security;
alter table quadro_cards enable row level security;
alter table avisos       enable row level security;
alter table vt_gaveta    enable row level security;

-- Políticas abertas temporárias (sem login)
create policy "allow all pautas"       on pautas       for all using (true) with check (true);
create policy "allow all quadro_cards" on quadro_cards  for all using (true) with check (true);
create policy "allow all avisos"       on avisos        for all using (true) with check (true);
create policy "allow all vt_gaveta"    on vt_gaveta     for all using (true) with check (true);
