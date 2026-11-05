-- =====================================================================
-- Copiloto Óptico · Esquema de base de datos (Supabase)
-- Pegar completo en Supabase → SQL Editor → New query → Run
-- Se puede volver a ejecutar sin romper nada (usa "if not exists").
-- =====================================================================

-- ---------- Tablas ----------

create table if not exists public.opticas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nit text default '',
  telefono text default '',
  ciudad text default '',
  creada timestamptz not null default now()
);

create table if not exists public.miembros (
  optica_id uuid not null references public.opticas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'admin' check (rol in ('admin', 'recepcion', 'optometra', 'taller')),
  creado timestamptz not null default now(),
  primary key (optica_id, user_id)
);

create table if not exists public.formulas (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  paciente text not null,
  telefono text default '',
  estado text not null default 'recibida'
    check (estado in ('recibida', 'gabinete', 'taller', 'lista', 'entregada')),
  od jsonb not null default '{}'::jsonb,
  oi jsonb not null default '{}'::jsonb,
  tipo_lente text default '',
  montura text default '',
  notas text default '',
  creada timestamptz not null default now()
);

create table if not exists public.formula_historial (
  id bigint generated always as identity primary key,
  formula_id uuid not null references public.formulas(id) on delete cascade,
  optica_id uuid not null references public.opticas(id) on delete cascade,
  estado text not null,
  usuario text not null default '',
  fecha timestamptz not null default now()
);

create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  codigo text default '',
  marca text not null,
  modelo text not null,
  color text default '',
  cantidad integer not null default 0 check (cantidad >= 0),
  costo numeric not null default 0,
  creado timestamptz not null default now()
);

create table if not exists public.mermas (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null default 'Lente',
  referencia text default '',
  motivo text default '',
  cantidad integer not null default 1 check (cantidad > 0),
  usuario text not null default '',
  creada timestamptz not null default now()
);

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  paciente text not null,
  telefono text default '',
  fecha date not null,
  hora text not null default '09:00',
  motivo text default '',
  creada timestamptz not null default now()
);

create index if not exists formulas_optica_idx on public.formulas (optica_id, creada desc);
create index if not exists historial_formula_idx on public.formula_historial (formula_id);
create index if not exists historial_optica_idx on public.formula_historial (optica_id, fecha desc);
create index if not exists inventario_optica_idx on public.inventario (optica_id);
create index if not exists mermas_optica_idx on public.mermas (optica_id, fecha);
create index if not exists citas_optica_idx on public.citas (optica_id, fecha);

-- ---------- Seguridad: cada óptica solo ve sus propios datos ----------

create or replace function public.es_miembro(p_optica uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.miembros
    where optica_id = p_optica and user_id = auth.uid()
  );
$$;

alter table public.opticas enable row level security;
alter table public.miembros enable row level security;
alter table public.formulas enable row level security;
alter table public.formula_historial enable row level security;
alter table public.inventario enable row level security;
alter table public.mermas enable row level security;
alter table public.citas enable row level security;

drop policy if exists "ver optica" on public.opticas;
create policy "ver optica" on public.opticas
  for select using (public.es_miembro(id));

drop policy if exists "editar optica" on public.opticas;
create policy "editar optica" on public.opticas
  for update using (public.es_miembro(id)) with check (public.es_miembro(id));

drop policy if exists "ver miembros" on public.miembros;
create policy "ver miembros" on public.miembros
  for select using (user_id = auth.uid() or public.es_miembro(optica_id));

do $$
declare t text;
begin
  foreach t in array array['formulas', 'formula_historial', 'inventario', 'mermas', 'citas'] loop
    execute format('drop policy if exists "datos de la optica" on public.%I', t);
    execute format(
      'create policy "datos de la optica" on public.%I for all
         using (public.es_miembro(optica_id))
         with check (public.es_miembro(optica_id))', t);
  end loop;
end $$;

-- ---------- Funciones que llama la app ----------

-- Crea la óptica del usuario recién registrado y lo deja como administrador
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
  insert into public.miembros (optica_id, user_id, nombre, rol)
    values (nueva, auth.uid(), coalesce(nullif(p_usuario, ''), 'Administrador'), 'admin');
  return nueva;
end;
$$;

-- Suma o resta unidades de una montura sin bajar de cero
create or replace function public.ajustar_stock(p_id uuid, p_delta integer)
returns integer
language sql
security invoker
set search_path = public
as $$
  update public.inventario
     set cantidad = greatest(0, cantidad + p_delta)
   where id = p_id
  returning cantidad;
$$;

grant execute on function public.crear_optica(text, text) to authenticated;
grant execute on function public.ajustar_stock(uuid, integer) to authenticated;
grant execute on function public.es_miembro(uuid) to authenticated;
