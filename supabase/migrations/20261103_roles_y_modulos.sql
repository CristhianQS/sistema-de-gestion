-- =============================================================================
-- Roles unificados (super_admin / admin) y permisos por módulo
-- =============================================================================
-- Ejecutar en Supabase → SQL Editor. Todo corre en una transacción:
-- si algo falla, no se aplica nada.
--
-- Antes:  admin_black  → control total
--         admin_oro    → jefe de área (áreas en user_areas)
--         admin_plata  → solo lectura (área en admin_user.area_id)
-- Después: super_admin → control total (no necesita módulos)
--          admin       → solo los módulos de admin_modules, con acceso
--                        'view' (ver) o 'edit' (ver y editar), y solo las
--                        áreas de user_areas
-- =============================================================================

begin;

-- 0. Seguridad: detener si alguna función/trigger usa los roles antiguos.
--    (p. ej. un trigger que notifica a los 'admin_oro' de un área). Si aparece
--    este error, comparte la lista para adaptar esas funciones primero.
do $$
declare
  afectadas text;
begin
  select string_agg(n.nspname || '.' || p.proname, ', ')
    into afectadas
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prosrc ~ 'admin_(black|oro|plata)';

  if afectadas is not null then
    raise exception 'Estas funciones usan los roles antiguos y deben adaptarse antes de migrar: %', afectadas;
  end if;
end $$;

-- 1. Tabla de permisos por módulo
create table if not exists public.admin_modules (
  user_id    bigint not null references public.admin_user(id) on delete cascade,
  module_key text   not null check (module_key in
               ('reportes', 'areas', 'pabellones', 'alumnos', 'docentes', 'chatbot')),
  access     text   not null check (access in ('view', 'edit')),
  created_at timestamptz not null default now(),
  primary key (user_id, module_key)
);

-- Mismo nivel de acceso que el resto de tablas de la app (cliente con clave anon).
-- IMPORTANTE: esto NO protege los datos; ver nota de seguridad al final.
alter table public.admin_modules enable row level security;
drop policy if exists "admin_modules acceso app" on public.admin_modules;
create policy "admin_modules acceso app" on public.admin_modules
  for all using (true) with check (true);

-- 2. Admin Plata guardaba su área en admin_user.area_id: pasarla a user_areas
insert into public.user_areas (user_id, area_id)
select u.id, u.area_id
from public.admin_user u
where u.role = 'admin_plata'
  and u.area_id is not null
  and not exists (
    select 1 from public.user_areas ua
    where ua.user_id = u.id and ua.area_id = u.area_id
  );

-- 3. Permisos equivalentes a lo que cada rol podía hacer
insert into public.admin_modules (user_id, module_key, access)
select id, 'reportes', 'edit' from public.admin_user where role = 'admin_oro'
on conflict do nothing;

insert into public.admin_modules (user_id, module_key, access)
select id, m.module_key, 'view'
from public.admin_user
cross join (values ('reportes'), ('alumnos')) as m(module_key)
where role = 'admin_plata'
on conflict do nothing;

-- 4. Cambiar la restricción de roles y migrar los valores
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.admin_user'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.admin_user drop constraint %I', c.conname);
  end loop;
end $$;

update public.admin_user set role = 'super_admin' where role = 'admin_black';
update public.admin_user set role = 'admin'       where role in ('admin_oro', 'admin_plata');

alter table public.admin_user
  add constraint admin_user_role_check check (role in ('super_admin', 'admin'));

commit;

-- =============================================================================
-- Verificación (ejecutar después):
--   select role, count(*) from admin_user group by role;
--   select u.email, m.module_key, m.access
--     from admin_modules m join admin_user u on u.id = m.user_id order by 1, 2;
--
-- NOTA DE SEGURIDAD: los permisos se aplican en la interfaz. Mientras las
-- políticas RLS permitan todo a la clave anon (como hoy en todas las tablas),
-- alguien con conocimientos técnicos puede leer/escribir directo a la API.
-- La solución de fondo es migrar el login a Supabase Auth y escribir políticas
-- RLS basadas en admin_modules.
-- =============================================================================
