import { supabase } from '../../lib/supabase';
import type { DataAlumno } from '../../lib/supabase';
import type { PaginationParams, PaginationResult } from '../../types/pagination';
import { toPaginationRange, createPaginationResult, DEFAULT_PAGE_SIZE } from '../../types/pagination';

/**
 * Servicio de acceso a datos para Estudiantes
 * Centraliza todas las operaciones CRUD de la tabla 'data_alumnos'
 */

/**
 * Obtener todos los estudiantes - PAGINADO
 */
export async function getAllStudents(
  params?: Partial<PaginationParams>
): Promise<PaginationResult<DataAlumno>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  // Obtener el conteo total
  const { count, error: countError } = await supabase
    .from('data_alumnos')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error al contar estudiantes:', countError);
    throw countError;
  }

  // Obtener los datos paginados
  const { data, error } = await supabase
    .from('data_alumnos')
    .select('*')
    .order('estudiante', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error al obtener estudiantes:', error);
    throw error;
  }

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener todos los estudiantes sin paginación - DEPRECADO
 * @deprecated Usar getAllStudents con parámetros de paginación
 */
export async function getAllStudentsUnpaginated(): Promise<DataAlumno[]> {
  const { data, error } = await supabase
    .from('data_alumnos')
    .select('*')
    .order('estudiante', { ascending: true });

  if (error) {
    console.error('Error al obtener estudiantes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener estudiante por código
 * Esta es la función más usada para validación
 */
export async function getStudentByCode(codigo: string): Promise<DataAlumno | null> {
  const { data, error } = await supabase
    .from('data_alumnos')
    .select('*')
    .eq('codigo', codigo)
    .single();

  if (error) {
    // PGRST116 = no se encontró el registro
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener estudiante:', error);
    throw error;
  }

  return data;
}

/**
 * Obtener estudiante por ID
 */
export async function getStudentById(id: number): Promise<DataAlumno | null> {
  const { data, error } = await supabase
    .from('data_alumnos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener estudiante:', error);
    throw error;
  }

  return data;
}

/**
 * Crear nuevo estudiante
 */
export async function createStudent(student: Omit<DataAlumno, 'id' | 'created_at'>): Promise<DataAlumno> {
  const { data, error } = await supabase
    .from('data_alumnos')
    .insert([student])
    .select()
    .single();

  if (error) {
    console.error('Error al crear estudiante:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar estudiante existente
 */
export async function updateStudent(
  id: number,
  updates: Partial<Omit<DataAlumno, 'id' | 'created_at'>>
): Promise<DataAlumno> {
  const { data, error } = await supabase
    .from('data_alumnos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar estudiante:', error);
    throw error;
  }

  return data;
}

/**
 * Eliminar estudiante
 */
export async function deleteStudent(id: number): Promise<void> {
  const { error } = await supabase
    .from('data_alumnos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar estudiante:', error);
    throw error;
  }
}

/**
 * Buscar estudiantes por nombre o código - PAGINADO
 */
export async function searchStudents(
  searchTerm: string,
  params?: Partial<PaginationParams>
): Promise<PaginationResult<DataAlumno>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  // Obtener el conteo total
  const { count, error: countError } = await supabase
    .from('data_alumnos')
    .select('*', { count: 'exact', head: true })
    .or(`estudiante.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);

  if (countError) {
    console.error('Error al contar estudiantes en búsqueda:', countError);
    throw countError;
  }

  // Obtener los datos paginados
  const { data, error } = await supabase
    .from('data_alumnos')
    .select('*')
    .or(`estudiante.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`)
    .order('estudiante', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error al buscar estudiantes:', error);
    throw error;
  }

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Verificar si un código de estudiante existe
 * Útil para validaciones rápidas
 */
export async function studentCodeExists(codigo: string): Promise<boolean> {
  const student = await getStudentByCode(codigo);
  return student !== null;
}
