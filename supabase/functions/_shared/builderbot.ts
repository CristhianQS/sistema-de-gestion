// Utilidades compartidas por las Edge Functions de WhatsApp (BuilderBot).
import { createClient } from 'npm:@supabase/supabase-js@2';

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BB_KEY = Deno.env.get('BUILDERBOT_API_KEY');
const BB_API = Deno.env.get('BUILDERBOT_API_URL') ?? 'https://app.builderbot.cloud/api/v2';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const capitalizar = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()).trim();

/** Compara textos sin tildes ni mayúsculas: "Mantenimiento e Infraestructura" ≈ "mantenimiento e infraestructura" */
export const normalizar = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Envía un mensaje de WhatsApp por la API de BuilderBot; devuelve el resultado para diagnóstico */
export async function enviarWhatsApp(projectId: string, number: string, content: string) {
  if (!BB_KEY) return { ok: false, status: 0, respuesta: 'BUILDERBOT_API_KEY no configurada' };
  try {
    const res = await fetch(`${BB_API}/${projectId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-builderbot': BB_KEY },
      body: JSON.stringify({ messages: { content }, number, checkIfExists: false }),
    });
    return { ok: res.ok, status: res.status, respuesta: (await res.text()).slice(0, 500) };
  } catch (e) {
    return { ok: false, status: 0, respuesta: String(e) };
  }
}

/** Registra un evento interno en whatsapp_eventos (no se muestra como mensaje en el panel) */
export async function registrarEvento(
  event_name: string,
  telefono: string | null,
  payload: Record<string, unknown>,
  mensaje: string | null = null,
) {
  const { error } = await supabase.from('whatsapp_eventos').insert({ event_name, telefono, mensaje, payload });
  if (error) console.error('registrarEvento', event_name, error);
}

export const ESTADOS: Record<string, string> = {
  pending: 'Recibido',
  in_progress: 'En proceso',
  resolved: 'Resuelto',
};
