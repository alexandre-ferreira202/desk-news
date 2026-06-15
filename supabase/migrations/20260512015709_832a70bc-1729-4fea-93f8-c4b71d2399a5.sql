create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  chosen text;
  chosen_role public.app_role;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));

  chosen := new.raw_user_meta_data->>'role';
  if chosen in ('chefe_redacao','editor','reporter') then
    chosen_role := chosen::public.app_role;
  else
    chosen_role := 'reporter'::public.app_role;
  end if;

  insert into public.user_roles (user_id, role) values (new.id, chosen_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();