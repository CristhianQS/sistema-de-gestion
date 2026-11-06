// Identifica a quien escribe al bot de WhatsApp (BuilderBot) y le da contexto a la IA.
//
// Se llama desde el nodo "Solicitud HTTP" del flujo, antes del Asistente de IA:
//   POST https://<proyecto>.supabase.co/functions/v1/identificar
//   Header: x-webhook-secret: <WEBHOOK_SECRET>
//   Body:   from = {from}            (número de WhatsApp)
//           texto = <mensaje actual> (opcional; si trae un código o DNI, se busca)
// También acepta GET ?valor=202321226&from=51999999999.
//
// - Si el texto trae un código de alumno o DNI, lo busca (docentes por DNI,
//   alumnos por código o DNI) y recuerda la identidad para ese número.
// - Si no, devuelve la identidad que ya se conocía para ese número.
// Responde siempre 200 (BuilderBot reintenta si no). Campos planos:
//   {encontrado} {tipo} {nombre} {primer_nombre} {carrera} {mensaje} {contexto}
// Desplegar con "Verify JWT" desactivado.
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
const SECRET = Deno.env.get('WEBHOOK_SECRET');

interface Identidad {
  tipo: 'alumno' | 'docente';
  nombre: string;
  primer_nombre: string;
  carrera: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const capitalizar = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase()).trim();

/** "Quispe Condori Elizabeth Esmeralda" (apellidos primero) → "Elizabeth" */
function primerNombreAlumno(completo: string) {
  const partes = completo.trim().split(/\s+/);
  return partes.length >= 3 ? partes[2] : partes[0];
}

/** Lee los parámetros de la URL y del body (JSON o formulario) */
async function leerParametros(req: Request): Promise<Record<string, string>> {
  const params: Record<string, string> = Object.fromEntries(new URL(req.url).searchParams);
  if (req.method === 'POST') {
    const raw = await req.text();
    try {
      for (const [k, v] of Object.entries(JSON.parse(raw) ?? {})) params[k] = String(v ?? '');
    } catch {
      for (const [k, v] of new URLSearchParams(raw)) params[k] = v;
    }
  }
  return params;
}

/** Primer valor que parezca un número de teléfono (ignora variables sin reemplazar como "{phone}") */
function telefonoDe(p: Record<string, string>) {
  for (const k of ['from', 'phone', 'numero', 'number', 'telefono']) {
    const d = (p[k] ?? '').replace(/\D/g, '');
    if (d.length >= 7) return d;
  }
  return null;
}

/** Código (9 dígitos) o DNI (8) dentro del texto: "mi código es 2023-21226" → "202321226" */
function codigoDe(p: Record<string, string>) {
  for (const k of ['valor', 'codigo', 'dni', 'texto', 'mensaje', 'body', 'message']) {
    const v = p[k];
    if (!v || v.includes('{')) continue;
    const limpio = v.replace(/[\s.-]/g, '');
    const m = limpio.match(/\d{8,10}/);
    if (m) return m[0];
  }
  return null;
}

async function buscar(valor: string): Promise<Identidad | null> {
  const { data: docente, error: errDoc } = await supabase
    .from('docentes')
    .select('nombres, apellidos, departamento, especialidad')
    .eq('dni', valor)
    .maybeSingle();
  if (errDoc) console.error('docentes', errDoc);
  if (docente) {
    return {
      tipo: 'docente',
      nombre: capitalizar(`${docente.nombres} ${docente.apellidos}`),
      primer_nombre: capitalizar(docente.nombres.split(/\s+/)[0]),
      carrera: docente.departamento ?? docente.especialidad ?? '',
    };
  }

  const { data: alumnos, error: errAl } = await supabase
    .from('data_alumnos')
    .select('estudiante, carrera_profesional')
    .or(`codigo.eq.${valor},dni.eq.${valor}`)
    .limit(1);
  if (errAl) console.error('data_alumnos', errAl);
  const alumno = alumnos?.[0];
  if (!alumno?.estudiante) return null;
  const nombre = capitalizar(alumno.estudiante);
  return { tipo: 'alumno', nombre, primer_nombre: primerNombreAlumno(nombre), carrera: alumno.carrera_profesional ?? '' };
}

/** Identidad ya conocida para este número de WhatsApp */
async function identidadGuardada(telefono: string): Promise<Identidad | null> {
  const { data, error } = await supabase
    .from('whatsapp_eventos')
    .select('identificado:payload->identificado')
    .eq('telefono', telefono)
    .not('payload->identificado->>nombre', 'is', null)
    .order('recibido_at', { ascending: false })
    .limit(1);
  if (error) console.error('identidad guardada', error);
  const id = data?.[0]?.identificado as (Identidad & { detalle?: string | null }) | undefined;
  if (!id?.nombre) return null;
  return {
    tipo: id.tipo,
    nombre: id.nombre,
    primer_nombre: id.primer_nombre ?? (id.tipo === 'alumno' ? primerNombreAlumno(id.nombre) : id.nombre.split(' ')[0]),
    carrera: id.carrera ?? id.detalle ?? '',
  };
}

const quien = (id: Identidad) =>
  `${id.tipo} ${id.nombre}${id.carrera ? ` (${id.carrera})` : ''}`;

function saludo(id: Identidad) {
  return id.tipo === 'docente'
    ? `¡Hola, *${id.primer_nombre}*! 👋 Tu reporte tendrá *atención prioritaria*. ¿Qué problema quieres reportar?`
    : `¡Hola, *${id.primer_nombre}*! 👋 ¿Qué problema quieres reportar?`;
}

const PRIORIDAD = ' Es docente: su reporte tiene atención prioritaria.';

Deno.serve(async (req) => {
  if (!SECRET || req.headers.get('x-webhook-secret') !== SECRET) {
    return json({ error: 'No autorizado' }, 401);
  }

  const p = await leerParametros(req);
  const telefono = telefonoDe(p);
  const codigo = codigoDe(p);

  let respuesta: Record<string, unknown>;

  if (codigo) {
    const id = await buscar(codigo);
    if (id) {
      if (telefono) {
        // Recordar la identidad para los siguientes mensajes de este número
        await supabase.from('whatsapp_eventos').insert({
          event_name: 'identificado',
          telefono,
          nombre: id.nombre,
          mensaje: codigo,
          payload: { identificado: id },
        });
      }
      respuesta = {
        encontrado: true,
        ...id,
        mensaje: saludo(id),
        contexto: `SISTEMA: El usuario acaba de identificarse con ${codigo}. Es ${quien(id)}.${id.tipo === 'docente' ? PRIORIDAD : ''} Tu respuesta DEBE empezar exactamente con: "${saludo(id)}" No le pidas su nombre ni si es alumno o docente.`,
      };
    } else {
      respuesta = {
        encontrado: false, tipo: '', nombre: '', primer_nombre: '', carrera: '',
        mensaje: `No encontré el código o DNI *${codigo}* en el sistema. 😕 Revisa que esté bien escrito y envíalo de nuevo (solo números).`,
        contexto: `SISTEMA: El código o DNI ${codigo} NO existe en la base de datos. Dile que no lo encontraste y pídele que lo revise y lo envíe de nuevo.`,
      };
    }
  } else {
    const id = telefono ? await identidadGuardada(telefono) : null;
    respuesta = id
      ? {
          encontrado: true,
          ...id,
          mensaje: saludo(id),
          contexto: `SISTEMA: Usuario ya identificado: ${quien(id)}.${id.tipo === 'docente' ? PRIORIDAD : ''} Llámalo siempre por su nombre: ${id.primer_nombre}. Si te saluda, responde "¡Hola, ${id.primer_nombre}! 👋" y pregúntale qué problema quiere reportar. No le pidas código, nombre ni si es alumno o docente.`,
        }
      : {
          encontrado: false, tipo: '', nombre: '', primer_nombre: '', carrera: '',
          mensaje: 'Por favor, envíame tu código de estudiante o tu DNI (solo números).',
          contexto: 'SISTEMA: Usuario aún no identificado. Pídele su código de estudiante o su DNI (solo números).',
        };
  }

  // Registro para diagnóstico (no se muestra en el panel)
  await supabase.from('whatsapp_eventos').insert({
    event_name: 'identificar',
    telefono,
    mensaje: codigo,
    payload: { metodo: req.method, params: p, resultado: respuesta },
  });

  return json(respuesta);
});
