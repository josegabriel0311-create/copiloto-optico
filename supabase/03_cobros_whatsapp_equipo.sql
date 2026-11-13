alter table public.opticas add column if not exists mensaje_lista text not null default '';

alter table public.formulas add column if not exists precio numeric not null default 0;
alter table public.formulas add column if not exists avisado_en timestamptz;

alter table public.miembros add column if not exists email text not null default '';

update public.miembros m
   set email = u.email
  from auth.users u
 where m.user_id = u.id
   and m.email = '';

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  formula_id uuid not null references public.formulas(id) on delete cascade,
  monto numeric not null check (monto > 0),
  metodo text not null default 'Efectivo',
  nota text default '',
  usuario text not null default '',
  fecha timestamptz not null default now()
);

create index if not exists pagos_optica_idx on public.pagos (optica_id, fecha desc);
create index if not exists pagos_formula_idx on public.pagos (formula_id);

alter table public.pagos enable row level security;

drop policy if exists "datos de la optica" on public.pagos;
create policy "datos de la optica" on public.pagos for all
  using (public.es_miembro(optica_id))
  with check (public.es_miembro(optica_id));

create or replace function public.es_admin(p_optica uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.miembros
    where optica_id = p_optica and user_id = auth.uid() and rol = 'admin'
  );
$$;

grant execute on function public.es_admin(uuid) to authenticated;

create table if not exists public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  email text not null,
  nombre text default '',
  rol text not null default 'recepcion' check (rol in ('admin', 'recepcion', 'optometra', 'taller')),
  creada timestamptz not null default now(),
  unique (optica_id, email)
);

alter table public.invitaciones enable row level security;

drop policy if exists "admin gestiona invitaciones" on public.invitaciones;
create policy "admin gestiona invitaciones" on public.invitaciones for all
  using (public.es_admin(optica_id))
  with check (public.es_admin(optica_id));

drop policy if exists "editar optica" on public.opticas;
create policy "editar optica" on public.opticas
  for update using (public.es_admin(id)) with check (public.es_admin(id));

drop policy if exists "admin edita miembros" on public.miembros;
create policy "admin edita miembros" on public.miembros
  for update using (public.es_admin(optica_id)) with check (public.es_admin(optica_id));

drop policy if exists "admin quita miembros" on public.miembros;
create policy "admin quita miembros" on public.miembros
  for delete using (public.es_admin(optica_id) and user_id <> auth.uid());

create or replace function public.crear_optica(p_nombre text, p_usuario text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare nueva uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión';
  end if;
  insert into public.opticas (nombre) values (p_nombre) returning id into nueva;
  insert into public.miembros (optica_id, user_id, nombre, rol, email)
    values (
      nueva,
      auth.uid(),
      coalesce(nullif(p_usuario, ''), 'Administrador'),
      'admin',
      coalesce((select email from auth.users where id = auth.uid()), '')
    );
  return nueva;
end;
$$;

create or replace function public.aceptar_invitacion()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_confirmado timestamptz;
  inv public.invitaciones%rowtype;
begin
  if auth.uid() is null then
    return null;
  end if;
  select email, email_confirmed_at into v_email, v_confirmado from auth.users where id = auth.uid();
  if v_email is null or v_confirmado is null then
    return null;
  end if;
  select * into inv from public.invitaciones
   where lower(email) = lower(v_email)
   order by creada
   limit 1;
  if not found then
    return null;
  end if;
  insert into public.miembros (optica_id, user_id, nombre, rol, email)
    values (inv.optica_id, auth.uid(), coalesce(nullif(inv.nombre, ''), split_part(v_email, '@', 1)), inv.rol, v_email)
    on conflict (optica_id, user_id) do nothing;
  delete from public.invitaciones where id = inv.id;
  return inv.optica_id;
end;
$$;

grant execute on function public.crear_optica(text, text) to authenticated;
grant execute on function public.aceptar_invitacion() to authenticated;
