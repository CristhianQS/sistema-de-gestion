-- 1) Realtime: el panel (Reportes y WhatsApp) se actualiza solo cuando cambian estas tablas.
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'area_submissions') then
    alter publication supabase_realtime add table public.area_submissions;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'whatsapp_eventos') then
    alter publication supabase_realtime add table public.whatsapp_eventos;
  end if;
end $$;

-- 2) Áreas de la mesa de ayuda (las mismas del prompt de BuilderBot). Los tickets de
--    WhatsApp se asignan por nombre. Solo se crean las que no existan (sin tildes/mayúsculas).
insert into public.areas (name, description)
select v.name, v.description
from (values
  ('Laboratorios de Cómputo', 'Incidentes tecnológicos dentro de laboratorios de cómputo.'),
  ('Soporte Técnico', 'Incidentes de hardware y tecnología en aulas y otras áreas del campus fuera de laboratorios.'),
  ('Infraestructura TI', 'Infraestructura de red y sistemas de vigilancia fuera de laboratorios.'),
  ('Mesa de Servicio', 'Mesa de ayuda tecnológica general, cuentas institucionales, accesos, contraseñas, LAMB y soporte de software.'),
  ('Plataformas de Aprendizaje', 'Soporte de la plataforma B-Learning y aulas virtuales.'),
  ('Limpieza', 'Limpieza y saneamiento de espacios.'),
  ('Mantenimiento e Infraestructura', 'Instalaciones físicas, electricidad, iluminación, mobiliario, puertas, ventanas, plomería, agua, aire acondicionado y ventilación.'),
  ('Seguridad y Salud en el Trabajo', 'Asistencia médica, accidentes, lesiones y situaciones de salud que involucren a personas no estudiantes.'),
  ('Centro Médico', 'Asistencia médica, primeros auxilios y situaciones de salud que involucren a estudiantes.'),
  ('Asuntos Académicos', 'Gestión académica, horarios, cursos, aulas y asuntos relacionados con la programación académica.')
) as v(name, description)
where not exists (
  select 1 from public.areas a
  where lower(translate(a.name, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou')) = lower(translate(v.name, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'))
);
