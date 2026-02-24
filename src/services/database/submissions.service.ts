//import { supabase } from '../../lib/supabase';
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
  const res = await fetch('http://localhost:4000/reportes/conteo');

  if (!res.ok) {
    console.error('Error al contar reportes');
    throw new Error('Error al contar reportes');
  }

  const count = await res.json();

  // Obtener los datos paginados ordenados por prioridad primero
  const res2 = await fetch(`http://localhost:4000/reportes/filtrar?from=${from}&to=${to}`);

  if (!res.ok) {
    console.error('Error al obtener reportes');
    throw new Error('Error al obtener reportes');
  }

  const data = await res2.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener todos los reportes sin paginación - DEPRECADO, usar getAllSubmissions con paginación
 * @deprecated Usar getAllSubmissions con parámetros de paginación
 */
export async function getAllSubmissionsUnpaginated(): Promise<AreaSubmission[]> {
  const res = await fetch('http://localhost:4000/reportes/lista');

  if (!res.ok) {
    console.error('Error al obtener reportes');
    throw new Error('Error al obtener reportes');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener reporte por ID
 */
export async function getSubmissionById(id: number): Promise<AreaSubmission | null> {
  const res = await fetch(`http://localhost:4000/reportes/buscar/${id}`);

  if (!res.ok) {
    console.error('Error al obtener reporte');
    throw new Error('Error al obtener reporte');
  }

  const data = await res.json();

  /*if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener reporte:', error);
    throw error;
  }*/

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
  const res = await fetch(`http://localhost:4000/reportes/conteo_area/${areaId}`);

  if (!res.ok) {
    console.error('Error al contar reportes por área');
    throw new Error('Error al contar reportes por área');
  }

  const count = await res.json();

  const params2 = new URLSearchParams({
    areaId: String(areaId),
    from: String(from),
    to: String(to)
  });

  // Obtener los datos paginados
  const res2 = await fetch(`http://localhost:4000/reportes/filtro_area?${params2}`);

  if (!res2.ok) {
    console.error('Error al obtener reportes por área');
    throw new Error('Error al obtener reportes por área');
  }

  const data = await res2.json();

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
  const res = await fetch(`http://localhost:4000/reportes/conteo_estudiante/${codigoAlumno}`);

  if (!res.ok) {
    console.error('Error al contar reportes del estudiante');
    throw new Error('Error al contar reportes del estudiante');
  }

  const count = await res.json();

  const params2 = new URLSearchParams({
    codigoAlumno: String(codigoAlumno),
    from: String(from),
    to: String(to)
  });

  // Obtener los datos paginados
  const res2 = await fetch(`http://localhost:4000/reportes/filtro_estudiante?${params2}`);

  if (!res2.ok) {
    console.error('Error al obtener reportes del estudiante');
    throw new Error('Error al obtener reportes del estudiante');
  }

  const data = await res2.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener reportes por estado
 */
export async function getSubmissionsByStatus(status: 'pending' | 'in_progress' | 'completed'): Promise<AreaSubmission[]> {
  const res = await fetch(`http://localhost:4000/reportes/estado/${status}`);

  if (!res.ok) {
    console.error('Error al obtener reportes por estado');
    throw new Error('Error al obtener reportes por estado');
  }

  return await res.json();
}

/**
 * Crear nuevo reporte
 */
export async function createSubmission(
  submission: Omit<AreaSubmission, 'id' | 'created_at' | 'updated_at'>
): Promise<AreaSubmission> {
  const res = await fetch('http://localhost:4000/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission),
  });

  if (!res.ok) {
    console.error('Error al crear reporte');
    throw new Error('Error al crear reporte');
  }

  return await res.json();
}

/**
 * Actualizar reporte completo
 */
export async function updateSubmission(
  id: number,
  updates: Partial<Omit<AreaSubmission, 'id' | 'created_at'>>
): Promise<AreaSubmission> {
  const res = await fetch(`http://localhost:4000/reportes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    console.error('Error al actualizar reporte');
    throw new Error('Error al actualizar reporte');
  }

  return await res.json();
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
  const res = await fetch(`http://localhost:4000/reportes/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    console.error('Error al eliminar reporte');
    throw new Error('Error al eliminar reporte');
  }
}

/**
 * Obtener reportes recientes (últimos N días)
 */
export async function getRecentSubmissions(days: number = 7): Promise<AreaSubmission[]> {
  const res = await fetch(`http://localhost:4000/reportes/recientes?days=${days}`);

  if (!res.ok) {
    console.error('Error al obtener reportes recientes');
    throw new Error('Error al obtener reportes recientes');
  }

  return await res.json();
}

/**
 * Obtener reportes creados por IA
 * Filtra reportes que tienen el flag ia_enabled en su metadata
 */
export async function getAIGeneratedSubmissions(): Promise<AreaSubmission[]> {
  const res = await fetch(`http://localhost:4000/reportes/ia`);

  if (!res.ok) {
    console.error('Error al obtener reportes generados por IA');
    throw new Error('Error al obtener reportes generados por IA');
  }

  return await res.json();
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
  const res = await fetch(`http://localhost:4000/reportes/conteo_estados`);

  if (!res.ok) {
    console.error('Error al contar reportes por estado');
    throw new Error('Error al contar reportes por estado');
  }

  return await res.json();
}

/**
 * Marcar un reporte como revisado
 */
export async function markAsReviewed(
  submissionId: number,
  reviewedBy: string
): Promise<void> {
  const res = await fetch(`http://localhost:4000/reportes/marcar_revisado`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId, reviewedBy }),
  });

  if (!res.ok) {
    console.error('Error al marcar como revisado');
    throw new Error('Error al marcar como revisado');
  }
}

/**
 * Obtener conteo de reportes no revisados por área
 */
export async function getUnreviewedCountByArea(areaId: number): Promise<number> {
  const res = await fetch(`http://localhost:4000/reportes/no_revisados/conteo/${areaId}`);

  if (!res.ok) {
    console.error('Error al obtener conteo de no revisados');
    return 0;
  }

  return await res.json();
}

/**
 * Obtener todos los reportes no revisados
 */
export async function getUnreviewedSubmissions(): Promise<AreaSubmission[]> {
  const res = await fetch(`http://localhost:4000/reportes/no_revisados`);

  if (!res.ok) {
    console.error('Error al obtener reportes no revisados');
    throw new Error('Error al obtener reportes no revisados');
  }

  return await res.json();
}

/**
 * Obtener reportes de docentes con prioridad
 * Los reportes de docentes se muestran primero
 */
export async function getDocenteSubmissions(
  params?: Partial<PaginationParams>
): Promise<PaginationResult<AreaSubmission>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  const res = await fetch(
    `http://localhost:4000/reportes/docentes?from=${from}&to=${to}`
  );

  if (!res.ok) {
    console.error('Error al obtener reportes de docentes');
    throw new Error('Error al obtener reportes de docentes');
  }

  const { data, count } = await res.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener todos los reportes con prioridad para docentes
 * Los reportes de docentes (prioridad alta) se muestran primero
 */
export async function getAllSubmissionsWithPriority(
  params?: Partial<PaginationParams>
): Promise<PaginationResult<AreaSubmission>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  const res = await fetch(
    `http://localhost:4000/reportes/prioridad?from=${from}&to=${to}`
  );

  if (!res.ok) {
    console.error('Error al obtener reportes con prioridad');
    throw new Error('Error al obtener reportes con prioridad');
  }

  const { data, count } = await res.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Crear reporte de docente
 * Automáticamente marca el reporte como es_docente y prioridad alta
 */
export async function createDocenteSubmission(
  submission: Omit<AreaSubmission, 'id' | 'created_at' | 'updated_at' | 'es_docente' | 'prioridad'>,
  docenteId: number,
  docenteDni: string,
  docenteNombre: string
): Promise<AreaSubmission> {
  const res = await fetch(`http://localhost:4000/reportes/docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...submission,
      docenteId,
      docenteDni,
      docenteNombre,
    }),
  });

  if (!res.ok) {
    console.error('Error al crear reporte de docente');
    throw new Error('Error al crear reporte de docente');
  }

  return await res.json();
}
