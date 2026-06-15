
-- Roles enum
create type public.app_role as enum ('chefe_redacao', 'editor', 'reporter');
create type public.pauta_status as enum ('sugestao','apuracao','redacao','revisao','publicado');
create type public.materia_status as enum ('rascunho','revisao','publicado');
create type public.item_status as enum ('pendente','pronto','no_ar','cortado');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('chefe_redacao','editor'))
$$;

-- Auto-create profile + default reporter role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'reporter');
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Pautas
create table public.pautas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  editoria text,
  angulo text,
  fontes text,
  prazo timestamptz,
  status pauta_status not null default 'sugestao',
  responsavel_id uuid references auth.users(id) on delete set null,
  criado_por uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pautas enable row level security;

-- Materias
create table public.materias (
  id uuid primary key default gen_random_uuid(),
  pauta_id uuid references public.pautas(id) on delete set null,
  titulo text not null,
  lide text,
  corpo text,
  status materia_status not null default 'rascunho',
  autor_id uuid not null references auth.users(id) on delete cascade,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.materias enable row level security;

-- Espelho
create table public.espelho_blocos (
  id uuid primary key default gen_random_uuid(),
  data_edicao date not null,
  nome text not null,
  ordem int not null default 1,
  created_at timestamptz not null default now()
);
alter table public.espelho_blocos enable row level security;

create table public.espelho_itens (
  id uuid primary key default gen_random_uuid(),
  bloco_id uuid not null references public.espelho_blocos(id) on delete cascade,
  ordem int not null default 1,
  assunto text not null,
  formato text,
  tempo text,
  status item_status not null default 'pendente',
  created_at timestamptz not null default now()
);
alter table public.espelho_itens enable row level security;

-- Metricas
create table public.metricas (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid references public.materias(id) on delete cascade,
  data date not null default current_date,
  cliques int not null default 0,
  tempo_medio_seg int not null default 0,
  fonte text not null default 'web'
);
alter table public.metricas enable row level security;

-- Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger pautas_touch before update on public.pautas
for each row execute function public.touch_updated_at();
create trigger materias_touch before update on public.materias
for each row execute function public.touch_updated_at();

-- RLS Policies
-- profiles: read all auth, update self
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_update_self" on public.profiles for update to authenticated using (auth.uid() = id);

-- user_roles: read self+staff, only chefe manages
create policy "roles_read_all_auth" on public.user_roles for select to authenticated using (true);
create policy "roles_chefe_manage" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'chefe_redacao')) with check (public.has_role(auth.uid(),'chefe_redacao'));

-- pautas
create policy "pautas_read" on public.pautas for select to authenticated using (true);
create policy "pautas_insert_any_auth" on public.pautas for insert to authenticated with check (auth.uid() = criado_por);
create policy "pautas_update_owner_or_staff" on public.pautas for update to authenticated
  using (auth.uid() = criado_por or auth.uid() = responsavel_id or public.is_staff(auth.uid()));
create policy "pautas_delete_staff" on public.pautas for delete to authenticated using (public.is_staff(auth.uid()));

-- materias
create policy "materias_read" on public.materias for select to authenticated using (true);
create policy "materias_insert_self" on public.materias for insert to authenticated with check (auth.uid() = autor_id);
create policy "materias_update_owner_or_staff" on public.materias for update to authenticated
  using (auth.uid() = autor_id or public.is_staff(auth.uid()));
create policy "materias_delete_staff" on public.materias for delete to authenticated using (public.is_staff(auth.uid()));

-- espelho
create policy "blocos_read" on public.espelho_blocos for select to authenticated using (true);
create policy "blocos_write_staff" on public.espelho_blocos for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "itens_read" on public.espelho_itens for select to authenticated using (true);
create policy "itens_write_staff" on public.espelho_itens for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- metricas
create policy "metricas_read" on public.metricas for select to authenticated using (true);
create policy "metricas_write_staff" on public.metricas for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
