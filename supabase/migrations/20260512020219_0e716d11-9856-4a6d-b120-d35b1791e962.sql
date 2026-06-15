create or replace function public.enforce_pauta_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status in ('revisao','publicado') and not public.is_staff(auth.uid()) then
      raise exception 'Apenas editor-chefe ou editor podem mover pauta para % ', new.status using errcode = '42501';
    end if;
  end if;
  if tg_op = 'INSERT' and new.status in ('revisao','publicado') and not public.is_staff(auth.uid()) then
    raise exception 'Apenas editor-chefe ou editor podem criar pauta com status %', new.status using errcode = '42501';
  end if;
  return new;
end; $$;

drop trigger if exists trg_enforce_pauta_status on public.pautas;
create trigger trg_enforce_pauta_status
  before insert or update on public.pautas
  for each row execute function public.enforce_pauta_status_change();

create or replace function public.enforce_materia_publish()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'publicado' and not public.is_staff(auth.uid()) then
      raise exception 'Apenas editor-chefe ou editor podem publicar matérias' using errcode = '42501';
    end if;
  end if;
  if tg_op = 'INSERT' and new.status = 'publicado' and not public.is_staff(auth.uid()) then
    raise exception 'Apenas editor-chefe ou editor podem publicar matérias' using errcode = '42501';
  end if;
  return new;
end; $$;

drop trigger if exists trg_enforce_materia_publish on public.materias;
create trigger trg_enforce_materia_publish
  before insert or update on public.materias
  for each row execute function public.enforce_materia_publish();