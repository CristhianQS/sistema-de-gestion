// Lectura del resumen de ticket que muestra la IA de BuilderBot antes de confirmar.
// Sin dependencias de Deno: se prueba con Vitest (src/features/whatsapp/ticket.test.ts).

export interface TicketResumen {
  nombres: string;
  problema: string;
  ubicacion: string;
  imagen: string;
  informacion_adicional: string;
  area: string;
  tipo_incidencia: string;
}

/**
 * Frase con la que la IA confirma el ticket (el usuario la ve, por eso es un mensaje
 * normal). Se acepta también la señal antigua ISSUE_SAVED.
 */
export const FRASE_CONFIRMACION = 'Estamos registrando tu reporte';
export const esConfirmacion = (texto: string) =>
  texto.includes('ISSUE_SAVED') || texto.toLowerCase().includes(FRASE_CONFIRMACION.toLowerCase());

/** Marca que identifica el mensaje de resumen */
export const MARCA_RESUMEN = 'será atendida por el Área de';

const VACIOS = new Set(['', 'vacío', 'vacio', '-', 'n/a', 'ninguno', 'ninguna', 'no', '[valor o vacío]', '[valor]']);

function limpiar(v: string | undefined): string {
  const t = (v ?? '').replace(/[*_]/g, '').trim();
  return VACIOS.has(t.toLowerCase()) ? '' : t;
}

/** Valor de una línea "Campo: valor" (tolera *negritas* y espacios) */
function campo(texto: string, nombre: string): string {
  const re = new RegExp(`^[*_\\s]*${nombre}[*_\\s]*:[*_\\s]*(.*)$`, 'im');
  return limpiar(texto.match(re)?.[1]);
}

export function parseResumen(texto: string): TicketResumen | null {
  if (!texto.includes(MARCA_RESUMEN)) return null;
  const area = limpiar(texto.match(/atendida por el Área de\s+([^\n_*]+)/i)?.[1]?.replace(/[.\s]+$/, ''));
  const tipo = limpiar(texto.match(/Tipo de incidencia:\s*([^\n_*]+)/i)?.[1]);
  const problema = campo(texto, 'Problema');
  if (!area || !problema) return null;
  return {
    nombres: campo(texto, 'Nombres'),
    problema,
    ubicacion: campo(texto, 'Ubicación') || campo(texto, 'Ubicacion'),
    imagen: campo(texto, 'Imagen'),
    informacion_adicional: campo(texto, 'Información adicional') || campo(texto, 'Informacion adicional'),
    area,
    tipo_incidencia: tipo,
  };
}

export interface PabellonRef {
  id: number;
  nombre: string;
}
export interface SalonRef {
  id: number;
  pabellon_id: number;
  nombre: string;
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** "Pabellón B" / "Pabello B" / "pabellon b" → "b"; "canchas" → "canchas" */
const clavePabellon = (nombre: string) => norm(nombre).replace(/^pabell?o?n?\s+/, '').replace(/^pab\s+/, '');

/**
 * Relaciona la ubicación escrita por el usuario ("Pabellón B, aula 201", "B-201",
 * "b201", "cancha 1") con los pabellones y salones registrados.
 */
export function ubicarEnCampus(
  texto: string,
  pabellones: PabellonRef[],
  salones: SalonRef[],
): { pabellon: PabellonRef | null; salon: SalonRef | null } {
  const t = ` ${norm(texto)} `;
  // "b201" → "b 201"
  const separado = t.replace(/\b([a-z])(\d{2,4})\b/g, '$1 $2');

  let pabellon: PabellonRef | null = null;
  for (const p of pabellones) {
    const clave = clavePabellon(p.nombre);
    if (!clave) continue;
    const re = clave.length === 1
      ? // letra sola: "pabellon b" o "b 201" (no la preposición "a" de "frente a la…")
        new RegExp(`(pabell?on|pab)\\s+${clave}(\\s|$)|(^|\\s)${clave}\\s+\\d`)
      : new RegExp(`\\b${clave.replace(/s$/, '')}s?\\b`); // nombres: "cancha", "canchas"
    if (re.test(separado)) {
      pabellon = p;
      break;
    }
  }

  const numeros: string[] = separado.match(/\d{1,4}/g) ?? [];
  const candidatos = pabellon ? salones.filter((s) => s.pabellon_id === pabellon!.id) : salones;
  let salon: SalonRef | null = null;
  for (const s of candidatos) {
    const ns = norm(s.nombre);
    const numSalon = ns.match(/\d{1,4}/)?.[0];
    if (numSalon && numeros.includes(numSalon)) {
      salon = s;
      break;
    }
  }
  if (!pabellon && salon) pabellon = pabellones.find((p) => p.id === salon!.pabellon_id) ?? null;
  return { pabellon, salon };
}

/** Respuesta de encuesta: un solo número del 1 al 5 */
export function parseCalificacion(texto: string): number | null {
  const m = texto.trim().match(/^([1-5])(\s*(estrellas?|\/\s*5))?$/i);
  return m ? Number(m[1]) : null;
}
