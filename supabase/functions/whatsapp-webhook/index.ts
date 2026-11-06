// Receptor de webhooks de BuilderBot (WhatsApp).
// - Guarda cada evento (message.incoming, message.outgoing, status.*) en whatsapp_eventos.
// - Código/DNI entrante: identifica al alumno o docente y lo saluda por su nombre.
// - Confirmación del bot ("Estamos registrando tu reporte"): crea el reporte en area_submissions a partir
//   del resumen que mostró la IA y le confirma al usuario el número de reporte.
// - Respuesta 1-5 a una encuesta: guarda la calificación en el reporte.
// Secretos: WEBHOOK_SECRET (header x-webhook-secret) y BUILDERBOT_API_KEY.
// Desplegar con "Verify JWT" desactivado: BuilderBot no envía token de Supabase.
import {
  capitalizar,
  enviarWhatsApp,
  json,
  normalizar,
  registrarEvento,
  supabase,
} from '../_shared/builderbot.ts';
import { MARCA_RESUMEN, esConfirmacion, parseCalificacion, parseResumen, ubicarEnCampus } from '../_shared/ticket.ts';

const SECRET = Deno.env.get('WEBHOOK_SECRET');
const text = (v: unknown) => (typeof v === 'string' ? v : null);

interface Identificado {
  tipo: 'alumno' | 'docente';
  nombre: string;
  detalle: string | null;
  id: number | null;
  dni: string | null;
  codigo: number | null;
}

/** Busca un docente por DNI y un alumno por código o DNI */
async function identificar(valor: string): Promise<Identificado | null> {
  const { data: docente } = await supabase
    .from('docentes')
    .select('id, nombres, apellidos, dni, departamento, especialidad')
    .eq('dni', valor)
    .maybeSingle();
  if (docente) {
    return {
      tipo: 'docente',
      nombre: capitalizar(`${docente.nombres} ${docente.apellidos}`),
      detalle: docente.departamento ?? docente.especialidad ?? null,
      id: docente.id,
      dni: docente.dni,
      codigo: null,
    };
  }

  const { data: alumnos } = await supabase
    .from('data_alumnos')
    .select('id, estudiante, carrera_profesional, dni, codigo')
    .or(`codigo.eq.${valor},dni.eq.${valor}`)
    .limit(1);
  const a = alumnos?.[0];
  if (!a?.estudiante) return null;
  return {
    tipo: 'alumno',
    nombre: capitalizar(a.estudiante),
    detalle: a.carrera_profesional,
    id: a.id,
    dni: a.dni,
    codigo: a.codigo,
  };
}

/**
 * Saludo corto con el primer nombre. Alumnos vienen como "Apellido Apellido Nombre…";
 * docentes como "Nombres Apellidos".
 */
function saludo(id: Identificado) {
  const partes = id.nombre.split(/\s+/);
  if (id.tipo === 'docente') {
    return `¡Hola, *${partes[0]}*! 👋 Tu reporte tendrá *atención prioritaria*.`;
  }
  return `¡Hola, *${partes.length >= 3 ? partes[2] : partes[0]}*! 👋`;
}

/** Última identidad conocida para este número */
async function identidadDe(telefono: string): Promise<Identificado | null> {
  const { data } = await supabase
    .from('whatsapp_eventos')
    .select('identificado:payload->identificado')
    .eq('telefono', telefono)
    .not('payload->identificado->>nombre', 'is', null)
    .order('recibido_at', { ascending: false })
    .limit(1);
  return (data?.[0]?.identificado as Identificado | undefined) ?? null;
}

/** Crea el reporte a partir del último resumen mostrado a este número */
async function crearTicket(telefono: string, projectId: string | null) {
  const { data: resumenes } = await supabase
    .from('whatsapp_eventos')
    .select('id, mensaje')
    .eq('telefono', telefono)
    .eq('event_name', 'message.outgoing')
    .ilike('mensaje', `%${MARCA_RESUMEN}%`)
    .order('recibido_at', { ascending: false })
    .limit(1);
  const resumenEvento = resumenes?.[0];
  const resumen = resumenEvento?.mensaje ? parseResumen(resumenEvento.mensaje) : null;
  if (!resumenEvento || !resumen) {
    await registrarEvento('ticket_error', telefono, { motivo: 'No se encontró el resumen del ticket' });
    return;
  }

  // Evitar duplicados si BuilderBot reenvía el webhook
  const { data: previo } = await supabase
    .from('whatsapp_eventos')
    .select('id')
    .eq('event_name', 'ticket_creado')
    .eq('payload->>resumen_evento_id', String(resumenEvento.id))
    .limit(1);
  if (previo?.length) return;

  const [{ data: areas }, { data: pabellones }, { data: salones }] = await Promise.all([
    supabase.from('areas').select('id, name'),
    supabase.from('pabellones').select('id, nombre'),
    supabase.from('salones').select('id, pabellon_id, nombre'),
  ]);
  const area = areas?.find((a) => normalizar(a.name) === normalizar(resumen.area));
  if (!area) {
    await registrarEvento('ticket_sin_area', telefono, { resumen, motivo: `No existe el área "${resumen.area}" en el sistema` });
    if (projectId) {
      await enviarWhatsApp(projectId, telefono, '✅ Recibimos tu reporte. El equipo de la UPeU Juliaca lo revisará y te escribirá por aquí.');
    }
    return;
  }

  // Ubicación escrita → pabellón y salón registrados (el detalle del reporte los muestra)
  const lugar = resumen.ubicacion ? ubicarEnCampus(resumen.ubicacion, pabellones ?? [], salones ?? []) : null;

  const id = await identidadDe(telefono);
  const esDocente = id?.tipo === 'docente';

  // Fotos que el usuario envió en las últimas 3 h → evidencia del reporte
  const hace3h = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
  const { data: conAdjuntos } = await supabase
    .from('whatsapp_eventos')
    .select('adjuntos')
    .eq('telefono', telefono)
    .eq('event_name', 'message.incoming')
    .gte('recibido_at', hace3h)
    .neq('adjuntos', '[]');
  const evidencias: Record<string, string> = {};
  let n = 0;
  for (const fila of conAdjuntos ?? []) {
    for (const a of (fila.adjuntos as unknown[]) ?? []) {
      const o = a && typeof a === 'object' ? (a as Record<string, unknown>) : null;
      const url = typeof a === 'string' ? a : (o?.url ?? o?.mediaUrl ?? o?.link ?? o?.fileUrl);
      if (typeof url === 'string' && /^https?:\/\//.test(url)) evidencias[`evidencia_whatsapp_${++n}`] = url;
    }
  }
  const nombre = id?.nombre ?? capitalizar(resumen.nombres || 'Sin nombre');

  const { data: creado, error } = await supabase
    .from('area_submissions')
    .insert({
      area_id: area.id,
      alumno_id: esDocente ? null : id?.id ?? null,
      alumno_dni: id?.dni ?? '',
      alumno_codigo: id?.codigo ?? 0,
      alumno_nombre: nombre,
      es_docente: esDocente,
      docente_id: esDocente ? id?.id ?? null : null,
      docente_dni: esDocente ? id?.dni ?? null : null,
      docente_nombre: esDocente ? nombre : null,
      prioridad: esDocente ? 'alta' : 'normal',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      form_data: {
        descripcion: resumen.problema,
        ubicacion: resumen.ubicacion || undefined,
        pabellon_id: lugar?.pabellon?.id,
        pabellon_nombre: lugar?.pabellon?.nombre,
        salon_id: lugar?.salon?.id,
        salon_nombre: lugar?.salon?.nombre,
        tipo_incidencia: resumen.tipo_incidencia || undefined,
        informacion_adicional: resumen.informacion_adicional || undefined,
        imagen: resumen.imagen || undefined,
        ...evidencias,
        canal: 'whatsapp',
        telefono,
        whatsapp_project_id: projectId,
        created_by: 'whatsapp',
      },
    })
    .select('id')
    .single();

  if (error || !creado) {
    await registrarEvento('ticket_error', telefono, { resumen, error: error?.message ?? 'sin datos' });
    return;
  }

  await registrarEvento('ticket_creado', telefono, {
    submission_id: creado.id,
    resumen_evento_id: String(resumenEvento.id),
    area: area.name,
  });
  if (projectId) {
    await enviarWhatsApp(
      projectId,
      telefono,
      `✅ Tu reporte *#${creado.id}* quedó registrado para el área de *${area.name}*.${esDocente ? ' Tiene *atención prioritaria*.' : ''}\nTe avisaremos por aquí cuando cambie su estado.`,
    );
  }
}

/** Si hay una encuesta pendiente para este número, guarda la calificación */
async function responderEncuesta(telefono: string, nota: number, projectId: string | null): Promise<boolean> {
  const hace48h = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data: encuestas } = await supabase
    .from('whatsapp_eventos')
    .select('id, payload')
    .eq('telefono', telefono)
    .eq('event_name', 'encuesta_enviada')
    .gte('recibido_at', hace48h)
    .order('recibido_at', { ascending: false })
    .limit(1);
  const encuesta = encuestas?.[0];
  const submissionId = Number((encuesta?.payload as { submission_id?: number } | null)?.submission_id);
  if (!encuesta || !submissionId) return false;

  const { data: yaRespondida } = await supabase
    .from('whatsapp_eventos')
    .select('id')
    .eq('event_name', 'encuesta_respondida')
    .eq('payload->>encuesta_id', String(encuesta.id))
    .limit(1);
  if (yaRespondida?.length) return false;

  const { data: reporte } = await supabase.from('area_submissions').select('form_data').eq('id', submissionId).single();
  const form = (reporte?.form_data ?? {}) as Record<string, unknown>;
  await supabase
    .from('area_submissions')
    .update({ form_data: { ...form, satisfaccion: nota, satisfaccion_at: new Date().toISOString() } })
    .eq('id', submissionId);

  await registrarEvento('encuesta_respondida', telefono, { encuesta_id: String(encuesta.id), submission_id: submissionId, nota });
  if (projectId) {
    await enviarWhatsApp(projectId, telefono, `🙏 ¡Gracias! Registramos tu calificación de *${nota}/5* para el reporte #${submissionId}.`);
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  if (!SECRET || req.headers.get('x-webhook-secret') !== SECRET) {
    return json({ error: 'No autorizado' }, 401);
  }

  let payload: {
    eventName?: unknown;
    data?: Record<string, unknown>;
    identificado?: Identificado | null;
    envio?: Record<string, unknown>;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const eventName = text(payload.eventName) ?? 'desconocido';
  const data = payload.data ?? {};
  const from = text(data.from);
  const body = text(data.body)?.trim() ?? '';
  const projectId = text(data.projectId);

  // Código de alumno (9 dígitos) o DNI (8). Acepta "2023-21226" o "2023 21226"
  const limpio = body.replace(/[\s.-]/g, '');
  const esCodigo = eventName === 'message.incoming' && /^\d{8,10}$/.test(limpio);
  let identificado: Identificado | null = null;
  if (esCodigo) {
    identificado = await identificar(limpio);
    payload.identificado = identificado;
    if (identificado && from && projectId) {
      const content = saludo(identificado);
      payload.envio = { content, ...(await enviarWhatsApp(projectId, from, content)) };
    }
  }

  // Guardar primero el evento: crearTicket necesita el resumen ya registrado
  const { error } = await supabase.from('whatsapp_eventos').insert({
    event_name: eventName,
    telefono: from,
    nombre: identificado?.nombre ?? (eventName === 'message.incoming' ? text(data.name) : null),
    mensaje: text(data.body),
    adjuntos: Array.isArray(data.attachment) ? data.attachment : [],
    payload,
  });
  if (error) console.error('Error guardando evento', error);

  if (from && eventName === 'message.outgoing' && esConfirmacion(body)) {
    await crearTicket(from, projectId);
  }

  const nota = eventName === 'message.incoming' ? parseCalificacion(body) : null;
  if (from && nota) {
    await responderEncuesta(from, nota, projectId);
  }

  return error ? json({ error: 'No se pudo guardar' }, 500) : json({ ok: true });
});
