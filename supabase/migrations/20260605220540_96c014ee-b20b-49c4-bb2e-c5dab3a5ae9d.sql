
-- 1. Force new users to 'reporter' role (ignore client-provided role metadata)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));

  -- Always default to 'reporter'. Role escalation must be done by an existing chefe_redacao.
  insert into public.user_roles (user_id, role) values (new.id, 'reporter'::public.app_role);
  return new;
end;
$function$;

-- 2. Attach the materia publish-guard trigger (function existed but was not attached)
DROP TRIGGER IF EXISTS enforce_materia_publish_trg ON public.materias;
CREATE TRIGGER enforce_materia_publish_trg
  BEFORE INSERT OR UPDATE ON public.materias
  FOR EACH ROW EXECUTE FUNCTION public.enforce_materia_publish();

-- Also attach pauta status guard for consistency
DROP TRIGGER IF EXISTS enforce_pauta_status_change_trg ON public.pautas;
CREATE TRIGGER enforce_pauta_status_change_trg
  BEFORE INSERT OR UPDATE ON public.pautas
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pauta_status_change();
