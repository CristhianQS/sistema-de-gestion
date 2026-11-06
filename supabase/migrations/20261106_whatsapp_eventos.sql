-- Eventos recibidos desde BuilderBot (WhatsApp) vía la Edge Function whatsapp-webhook.
create table if not exists public.whatsapp_eventos (
  id bigint generated always as identity primary key,
  event_name text not null,
  telefono text,
  nombre text,
  mensaje text,
  adjuntos jsonb not null default '[]'::jsonb,
  payload jsonb not null,
  recibido_at timestamptz not null default now()
);

create index if not exists whatsapp_eventos_recibido_idx
  on public.whatsapp_eventos (recibido_at desc);

-- Solo la Edge Function (service role) escribe. El panel (clave anon, igual
-- que el resto de tablas del sistema) solo puede leer.
alter table public.whatsapp_eventos enable row level security;
drop policy if exists "panel lee whatsapp_eventos" on public.whatsapp_eventos;
create policy "panel lee whatsapp_eventos" on public.whatsapp_eventos
  for select to anon, authenticated using (true);
