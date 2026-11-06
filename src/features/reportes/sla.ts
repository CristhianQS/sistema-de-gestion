/**
 * Tiempos objetivo de atención (SLA) por área, en horas, desde que llega el
 * reporte hasta que se resuelve. Los de docentes tienen la mitad del tiempo.
 * Ajusta los valores aquí; las áreas que no están usan SLA_POR_DEFECTO.
 */
export const SLA_HORAS: Record<string, number> = {
  'Centro Médico': 1,
  'Seguridad y Salud en el Trabajo': 1,
  'Soporte Técnico': 4,
  'Laboratorios de Cómputo': 4,
  Limpieza: 4,
  'Mesa de Servicio': 8,
  'Infraestructura TI': 24,
  'Plataformas de Aprendizaje': 24,
  'Mantenimiento e Infraestructura': 48,
  'Asuntos Académicos': 72,
};
export const SLA_POR_DEFECTO = 48;

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
const POR_AREA = new Map(Object.entries(SLA_HORAS).map(([k, v]) => [normalizar(k), v]));

export interface SlaInfo {
  limiteHoras: number;
  vencido: boolean;
  /** ms que faltan (negativo si ya venció) */
  restanteMs: number;
  /** Queda menos del 25 % del tiempo */
  porVencer: boolean;
}

interface ReporteSla {
  status: string;
  submitted_at: string;
  area_nombre?: string;
  es_docente?: boolean;
}

/** null si el reporte ya está resuelto (no aplica SLA) */
export function slaDe(r: ReporteSla, ahora = Date.now()): SlaInfo | null {
  if (r.status === 'resolved') return null;
  const base = POR_AREA.get(normalizar(r.area_nombre ?? '')) ?? SLA_POR_DEFECTO;
  const limiteHoras = r.es_docente ? base / 2 : base;
  const limiteMs = limiteHoras * 3600_000;
  const restanteMs = new Date(r.submitted_at).getTime() + limiteMs - ahora;
  return { limiteHoras, vencido: restanteMs <= 0, restanteMs, porVencer: restanteMs > 0 && restanteMs < limiteMs * 0.25 };
}

/** "2 h", "35 min", "3 d" */
export function duracionCorta(ms: number): string {
  const min = Math.round(Math.abs(ms) / 60_000);
  if (min < 60) return `${Math.max(min, 1)} min`;
  const h = Math.round(min / 60);
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} d`;
}
