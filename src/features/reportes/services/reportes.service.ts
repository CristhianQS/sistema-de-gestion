import { supabase } from '../../../lib/supabase';

/**
 * Acceso a datos de la feature Reportes (area_submissions + nombre de área).
 */

export interface ReporteRow {
  id: number;
  area_id: number;
  status: string;
  form_data: Record<string, unknown>;
  submitted_at: string;
}

export type ReporteConArea<T = ReporteRow> = T & { area_nombre: string };

const AREA_DESCONOCIDA = 'Área desconocida';

/**
 * Reportes con el nombre de su área. Con `areaIds` se limitan a esas áreas
 * (admins); sin él, todos (super admin). Reportes y áreas van en paralelo.
 */
export async function getReportesConArea<T extends { area_id: number } = ReporteRow>(
  areaIds?: number[] | null
): Promise<ReporteConArea<T>[]> {
  if (areaIds && areaIds.length === 0) return [];

  let reportesQuery = supabase
    .from('area_submissions')
    .select('*')
    .order('prioridad', { ascending: false }) // Reportes de docentes (prioridad alta) primero
    .order('submitted_at', { ascending: false });
  if (areaIds) reportesQuery = reportesQuery.in('area_id', areaIds);

  const [reportesRes, areasRes] = await Promise.all([
    reportesQuery,
    supabase.from('areas').select('id, name'),
  ]);
  if (reportesRes.error) throw reportesRes.error;
  if (areasRes.error) throw areasRes.error;

  const nombrePorArea = new Map((areasRes.data ?? []).map((a) => [a.id as number, a.name as string]));
  return (reportesRes.data ?? []).map((r) => ({
    ...(r as T),
    area_nombre: nombrePorArea.get(r.area_id) ?? AREA_DESCONOCIDA,
  }));
}

/**
 * Reportes de una sola área (Admin Oro). Área y reportes se piden en paralelo.
 */
export async function getReportesDeArea<T extends { area_id: number } = ReporteRow>(
  areaId: number
): Promise<{ areaNombre: string | null; reportes: ReporteConArea<T>[] }> {
  const [areaRes, reportesRes] = await Promise.all([
    supabase.from('areas').select('name').eq('id', areaId).maybeSingle(),
    supabase
      .from('area_submissions')
      .select('*')
      .eq('area_id', areaId)
      .order('submitted_at', { ascending: false }),
  ]);
  if (reportesRes.error) throw reportesRes.error;

  const areaNombre = (areaRes.data?.name as string | undefined) ?? null;
  return {
    areaNombre,
    reportes: (reportesRes.data ?? []).map((r) => ({
      ...(r as T),
      area_nombre: areaNombre ?? AREA_DESCONOCIDA,
    })),
  };
}

/**
 * Cambia el estado de un reporte. Con `estimatedTime` (solo en 'in_progress')
 * guarda el tiempo estimado en form_data; en otros estados lo elimina.
 */
export async function updateReporteStatus(
  reporteId: number,
  newStatus: string,
  estimatedTime?: string
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('area_submissions')
    .select('form_data')
    .eq('id', reporteId)
    .single();
  if (fetchError) throw fetchError;

  const formData: Record<string, unknown> = { ...(current.form_data ?? {}) };
  if (newStatus === 'in_progress' && estimatedTime) {
    formData.estimated_time = estimatedTime;
  } else if (newStatus !== 'in_progress') {
    delete formData.estimated_time;
  }

  const { error } = await supabase
    .from('area_submissions')
    .update({ status: newStatus, form_data: formData })
    .eq('id', reporteId);
  if (error) throw error;

  if (formData.canal === 'whatsapp') notificarEstado(reporteId);
}

/**
 * Avisa por WhatsApp al autor del reporte (solo reportes creados por WhatsApp).
 * No bloquea ni hace fallar el cambio de estado si el aviso no se puede enviar.
 */
export function notificarEstado(reporteId: number): void {
  supabase.functions
    .invoke('notificar-estado', { body: { id: reporteId } })
    .then(({ error }) => {
      if (error) console.warn('No se pudo avisar por WhatsApp:', error.message);
    })
    .catch((e) => console.warn('No se pudo avisar por WhatsApp:', e));
}

/** Cambio de estado simple, sin tocar form_data (vista Admin Oro). */
export async function setReporteStatus(reporteId: number, newStatus: string): Promise<void> {
  const { error } = await supabase.from('area_submissions').update({ status: newStatus }).eq('id', reporteId);
  if (error) throw error;
}
