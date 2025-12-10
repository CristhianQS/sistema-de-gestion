import { supabase } from '../../lib/supabase';
import type { AreaSubmission } from '../../lib/supabase';
import type { PaginationParams, PaginationResult } from '../../types/pagination';
import { toPaginationRange, createPaginationResult, DEFAULT_PAGE_SIZE } from '../../types/pagination';

/**
 * Servicio de acceso a datos para Reportes/Submissions
 * Centraliza todas las operaciones CRUD de la tabla 'area_submissions'
 */

/**
 * Obtener todos los reportes con información completa (joins) - PAGINADO
 */
export async function getAllSubmissions(
  params?: Partial<PaginationParams>
): Promise<PaginationResult<AreaSubmission>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  // Obtener el conteo total
  const { count, error: countError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error al contar reportes:', countError);
    throw countError;
  }

  // Obtener los datos paginados
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error al obtener reportes:', error);
    throw error;
  }

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener todos los reportes sin paginación - DEPRECADO, usar getAllSubmissions con paginación
 * @deprecated Usar getAllSubmissions con parámetros de paginación
 */
export async function getAllSubmissionsUnpaginated(): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener reporte por ID
 */
export async function getSubmissionById(id: number): Promise<AreaSubmission | null> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener reporte:', error);
    throw error;
  }

  return data;
}

/**
 * Obtener reportes por área - PAGINADO
 */
export async function getSubmissionsByArea(
  areaId: number,
  params?: Partial<PaginationParams>
): Promise<PaginationResult<AreaSubmission>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  // Obtener el conteo total
  const { count, error: countError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('area_id', areaId);

  if (countError) {
    console.error('Error al contar reportes por área:', countError);
    throw countError;
  }

  // Obtener los datos paginados
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('area_id', areaId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error al obtener reportes por área:', error);
    throw error;
  }

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener reportes por código de estudiante - PAGINADO
 * Útil para que los estudiantes vean sus propios reportes
 */
export async function getSubmissionsByStudentCode(
  codigoAlumno: string,
  params?: Partial<PaginationParams>
): Promise<PaginationResult<AreaSubmission>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  // Obtener el conteo total
  const { count, error: countError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('codigo_alumno', codigoAlumno);

  if (countError) {
    console.error('Error al contar reportes del estudiante:', countError);
    throw countError;
  }

  // Obtener los datos paginados
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('codigo_alumno', codigoAlumno)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error al obtener reportes del estudiante:', error);
    throw error;
  }

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener reportes por estado
 */
export async function getSubmissionsByStatus(status: 'pending' | 'in_progress' | 'completed'): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes por estado:', error);
    throw error;
  }

  return data || [];
}

/**
 * Crear nuevo reporte
 */
export async function createSubmission(
  submission: Omit<AreaSubmission, 'id' | 'created_at' | 'updated_at'>
): Promise<AreaSubmission> {
  const { data, error } = await supabase
    .from('area_submissions')
    .insert([submission])
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .single();

  if (error) {
    console.error('Error al crear reporte:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar reporte completo
 */
export async function updateSubmission(
  id: number,
  updates: Partial<Omit<AreaSubmission, 'id' | 'created_at'>>
): Promise<AreaSubmission> {
  const { data, error } = await supabase
    .from('area_submissions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .single();

  if (error) {
    console.error('Error al actualizar reporte:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar solo el estado del reporte
 * Función específica para cambios de estado frecuentes
 */
export async function updateSubmissionStatus(
  id: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<AreaSubmission> {
  return updateSubmission(id, { status });
}

/**
 * Eliminar reporte
 */
export async function deleteSubmission(id: number): Promise<void> {
  const { error } = await supabase
    .from('area_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar reporte:', error);
    throw error;
  }
}

/**
 * Obtener reportes recientes (últimos N días)
 */
export async function getRecentSubmissions(days: number = 7): Promise<AreaSubmission[]> {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - days);

  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .gte('created_at', fechaLimite.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes recientes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener reportes creados por IA
 * Filtra reportes que tienen el flag ia_enabled en su metadata
 */
export async function getAIGeneratedSubmissions(): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .not('form_data->ia_metadata->ia_enabled', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes generados por IA:', error);
    throw error;
  }

  return data || [];
}

/**
 * Contar reportes por estado - OPTIMIZADO
 * En lugar de 4 queries, hace 1 sola query y cuenta en memoria
 */
export async function countSubmissionsByStatus(): Promise<{
  pending: number;
  in_progress: number;
  completed: number;
  total: number;
}> {
  // Una sola query obteniendo solo el campo status
  const { data, error } = await supabase
    .from('area_submissions')
    .select('status');

  if (error) {
    console.error('Error al contar reportes por estado:', error);
    throw error;
  }

  // Contar en memoria (más eficiente que 4 queries separadas)
  const counts = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    total: data?.length || 0,
  };

  data?.forEach((item) => {
    if (item.status === 'pending') counts.pending++;
    else if (item.status === 'in_progress') counts.in_progress++;
    else if (item.status === 'completed') counts.completed++;
  });

  return counts;
}

/**
 * Marcar un reporte como revisado
 */
export async function markAsReviewed(
  submissionId: number,
  reviewedBy: string
): Promise<void> {
  const { error } = await supabase.rpc('mark_report_as_reviewed', {
    p_submission_id: submissionId,
    p_reviewed_by: reviewedBy
  });

  if (error) {
    console.error('Error al marcar como revisado:', error);
    throw error;
  }
}

/**
 * Obtener conteo de reportes no revisados por área
 */
export async function getUnreviewedCountByArea(areaId: number): Promise<number> {
  const { data, error } = await supabase.rpc('get_unreviewed_count_by_area', {
    p_area_id: areaId
  });

  if (error) {
    console.error('Error al obtener conteo de no revisados:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Obtener todos los reportes no revisados
 */
export async function getUnreviewedSubmissions(): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('reviewed', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes no revisados:', error);
    throw error;
  }

  return data || [];
}
