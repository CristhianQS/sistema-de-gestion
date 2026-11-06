// Avisa por WhatsApp al autor de un reporte cuando cambia su estado.
// Solo para reportes creados desde WhatsApp (form_data.canal = 'whatsapp'): el
// usuario ya inició la conversación con el bot.
// Al resolverse, envía además una encuesta de satisfacción (1-5) que responde
// el webhook (whatsapp-webhook).
// Uso desde el panel: supabase.functions.invoke('notificar-estado', { body: { id } })
import { ESTADOS, enviarWhatsApp, json, registrarEvento, supabase } from '../_shared/builderbot.ts';

/** Mismas opciones que el selector de tiempo del panel (ModalDetalleReporte) */
const TIEMPOS: Record<string, string> = {
  '30min': '30 min', '1h': '1 hora', '2h': '2 horas', '4h': '4 horas',
  '1d': '1 día', '2d': '2 días', '3d': '3 días', '1w': '1 semana', '2w': '2 semanas',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const responder = (body: unknown, status = 200) => {
    const res = json(body, status);
    for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
    return res;
  };
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405);

  let id: number;
  try {
    id = Number((await req.json()).id);
  } catch {
    return responder({ error: 'JSON inválido' }, 400);
  }
  if (!Number.isInteger(id) || id <= 0) return responder({ error: 'id inválido' }, 400);

  const { data: r, error } = await supabase
    .from('area_submissions')
    .select('id, status, form_data, area:areas(name)')
    .eq('id', id)
    .single();
  if (error || !r) return responder({ enviado: false, motivo: 'Reporte no encontrado' }, 404);

  const form = (r.form_data ?? {}) as Record<string, unknown>;
  const telefono = typeof form.telefono === 'string' ? form.telefono : null;
  const projectId = typeof form.whatsapp_project_id === 'string' ? form.whatsapp_project_id : null;
  if (form.canal !== 'whatsapp' || !telefono || !projectId) {
    return responder({ enviado: false, motivo: 'El reporte no viene de WhatsApp' });
  }

  const area = (r.area as { name?: string } | null)?.name ?? 'el área';
  const estado = ESTADOS[r.status] ?? r.status;
  const t = typeof form.estimated_time === 'string' ? form.estimated_time : '';
  const tiempo = t ? `\n⏱️ Tiempo estimado: *${TIEMPOS[t] ?? t}*` : '';

  let mensaje = `🔔 Tu reporte *#${r.id}* (${area}) ahora está: *${estado}*.${r.status === 'in_progress' ? tiempo : ''}`;
  if (r.status === 'resolved') {
    mensaje += '\n\n¿Cómo calificarías la atención? Responde con un número del *1* (mala) al *5* (excelente).';
  }

  const envio = await enviarWhatsApp(projectId, telefono, mensaje);
  await registrarEvento('estado_notificado', telefono, { submission_id: r.id, status: r.status, envio });
  if (envio.ok && r.status === 'resolved') {
    await registrarEvento('encuesta_enviada', telefono, { submission_id: r.id });
  }
  return responder({ enviado: envio.ok, status: envio.status });
});
