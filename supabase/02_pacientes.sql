create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  optica_id uuid not null references public.opticas(id) on delete cascade,
  nombre text not null,
  documento text default '',
  telefono text default '',
  email text default '',
  fecha_nacimiento date,
  notas text default '',
  creado timestamptz not null default now()
);

create index if not exists pacientes_optica_idx on public.pacientes (optica_id, nombre);

alter table public.pacientes enable row level security;

drop policy if exists "datos de la optica" on public.pacientes;
create policy "datos de la optica" on public.pacientes for all
  using (public.es_miembro(optica_id))
  with check (public.es_miembro(optica_id));

alter table public.formulas
  add column if not exists paciente_id uuid references public.pacientes(id) on delete set null;

create index if not exists formulas_paciente_idx on public.formulas (paciente_id);

insert into public.pacientes (optica_id, nombre, telefono)
select distinct on (f.optica_id, lower(trim(f.paciente)))
       f.optica_id, trim(f.paciente), coalesce(f.telefono, '')
  from public.formulas f
 where f.paciente_id is null
   and not exists (
     select 1 from public.pacientes p
      where p.optica_id = f.optica_id
        and lower(p.nombre) = lower(trim(f.paciente))
   )
 order by f.optica_id, lower(trim(f.paciente)), f.creada desc;

update public.formulas f
   set paciente_id = p.id
  from public.pacientes p
 where f.paciente_id is null
   and p.optica_id = f.optica_id
   and lower(p.nombre) = lower(trim(f.paciente));
