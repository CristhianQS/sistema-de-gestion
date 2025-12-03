import { supabase } from '../../lib/supabase';
import type { AreaSubmission } from '../../lib/supabase';

/**
 * Servicio de acceso a datos para Reportes/Submissions
 * Centraliza todas las operaciones CRUD de la tabla 'area_submissions'
 */

/**
 * Obtener todos los reportes con información completa (joins)
 */
export async function getAllSubmissions(): Promise<AreaSubmission[]> {
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
 * Obtener reportes por área
 */
export async function getSubmissionsByArea(areaId: number): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('area_id', areaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes por área:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener reportes por código de estudiante
 * Útil para que los estudiantes vean sus propios reportes
 */
export async function getSubmissionsByStudentCode(codigoAlumno: string): Promise<AreaSubmission[]> {
  const { data, error } = await supabase
    .from('area_submissions')
    .select(`
      *,
      area:areas(id, name, description),
      alumno:data_alumnos(id, codigo, estudiante)
    `)
    .eq('codigo_alumno', codigoAlumno)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener reportes del estudiante:', error);
    throw error;
  }

  return data || [];
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
  status: 'pending' | 'in_progress' | 'completed'
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
 * Contar reportes por estado
 */
export async function countSubmissionsByStatus(): Promise<{
  pending: number;
  in_progress: number;
  completed: number;
  total: number;
}> {
  const { count: totalCount, error: totalError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true });

  const { count: pendingCount, error: pendingError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: inProgressCount, error: inProgressError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress');

  const { count: completedCount, error: completedError } = await supabase
    .from('area_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  if (totalError || pendingError || inProgressError || completedError) {
    console.error('Error al contar reportes por estado');
    throw totalError || pendingError || inProgressError || completedError;
  }

  return {
    pending: pendingCount || 0,
    in_progress: inProgressCount || 0,
    completed: completedCount || 0,
    total: totalCount || 0
  };
}
