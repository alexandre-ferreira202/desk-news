-- ============================================================
-- TABELAS DO MÓDULO ESPELHO — DeskNews
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. ESPELHO BLOCOS
create table if not exists espelho_blocos (
  id            uuid primary key default gen_random_uuid(),
  data_edicao   date not null,
  nome          text not null default 'Bloco 1',
  ordem         int  not null default 1,
  programa      text not null default 'Jornal da Manhã',
  apresentador  text,
  created_at    timestamptz default now()
);

-- 2. ESPELHO ITENS
create table if not exists espelho_itens (
  id               uuid primary key default gen_random_uuid(),
  bloco_id         uuid references espelho_blocos(id) on delete cascade,
  ordem            int  not null default 1,
  assunto          text not null default 'Novo item',
  formato          text,
  tempo            text,
  status           text not null default 'pendente',
  materia_id       uuid references materias(id) on delete set null,
  editor_texto_id  uuid,
  editor_imagem_id uuid,
  cabeca           text,
  tempo_cab        text,
  tempo_total      text,
  created_at       timestamptz default now()
);

-- 3. MATERIAS (publicadas pela redação)
create table if not exists materias (
  id                  uuid primary key default gen_random_uuid(),
  titulo              text not null,
  status              text not null default 'rascunho',
  cabeca              text,
  tempo_vt            text,
  tempo_cab           text,
  deixa               text,
  entrevistado_nome   text,
  entrevistado_funcao text,
  editor_texto        text,
  editor_imagem       text,
  credito_reporter    text,
  estrutura           text,
  lide                text,
  corpo               text,
  publicado_em        timestamptz,
  created_at          timestamptz default now()
);

-- 4. PROFILES (usuários do sistema)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role         text not null default 'reporter',
  created_at   timestamptz default now()
);

-- 5. AUTOSAVE (rascunhos automáticos)
create table if not exists autosave (
  id         text primary key,
  context    text not null,
  payload    jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- RLS — Políticas abertas temporárias (sem login)
-- ============================================================

alter table espelho_blocos enable row level security;
alter table espelho_itens  enable row level security;
alter table materias       enable row level security;
alter table profiles       enable row level security;
alter table autosave       enable row level security;

create policy "allow all espelho_blocos" on espelho_blocos for all using (true) with check (true);
create policy "allow all espelho_itens"  on espelho_itens  for all using (true) with check (true);
create policy "allow all materias"       on materias       for all using (true) with check (true);
create policy "allow all profiles"       on profiles       for all using (true) with check (true);
create policy "allow all autosave"       on autosave       for all using (true) with check (true);

-- ============================================================
-- Realtime: habilitar sync ao vivo no espelho
-- ============================================================

alter publication supabase_realtime add table espelho_blocos;
alter publication supabase_realtime add table espelho_itens;
