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

  const params2 = new URLSearchParams({
    start: String(from),
    end: String(to),
  });

  // Obtener el conteo total
  var res = await fetch(`http://localhost:4000/estudiantes/conteo`);

  if (!res.ok) {
    console.error('Error al contar estudiantes');
    throw new Error('Error al contar estudiantes');
  }

  const count = await res.json();

  // Obtener los datos paginados
  res = await fetch(`http://localhost:4000/estudiantes/listapag?${params2}`);

  if (!res.ok) {
    console.error('Error al obtener estudiantes');
    throw new Error('Error al obtener estudiantes');
  }

  const data = await res.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}

/**
 * Obtener todos los estudiantes sin paginación - DEPRECADO
 * @deprecated Usar getAllStudents con parámetros de paginación
 */
export async function getAllStudentsUnpaginated(): Promise<DataAlumno[]> {
  const res = await fetch('http://localhost:4000/alumnos/lista');

  if (!res.ok) {
    console.error('Error al obtener estudiantes');
    throw new Error('Error al obtener estudiantes');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener estudiante por código
 * Esta es la función más usada para validación
 */
export async function getStudentByCode(codigo: string): Promise<DataAlumno | null> {
  const res = await fetch(`http://localhost:4000/alumnos/buscar?codigo=${codigo}`);

  if (!res.ok) {
    console.error('Error al obtener estudiante');
    throw new Error('Error al obtener estudiante');
  }

  const data = await res.json();

  return data;
}

/**
 * Obtener estudiante por ID
 */
export async function getStudentById(id: number): Promise<DataAlumno | null> {
  const res = await fetch(`http://localhost:4000/alumnos/buscar?id=${id}`);

  if (!res.ok) {
    console.error('Error al obtener estudiante');
    throw new Error('Error al obtener estudiante');
  }

  const data = await res.json();

  return data;
}

/**
 * Crear nuevo estudiante
 */
export async function createStudent(student: Omit<DataAlumno, 'id' | 'created_at'>): Promise<DataAlumno> {
  const res = await fetch(`http://localhost:4000/alumnos/nuevo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });

  if (!res.ok) {
    console.error('Error al crear estudiante');
    throw new Error('Error al crear estudiante');
  }

  const data = await res.json();

  return data;
}

/**
 * Actualizar estudiante existente
 */
export async function updateStudent(
  id: number,
  updates: Partial<Omit<DataAlumno, 'id' | 'created_at'>>
): Promise<DataAlumno> {
  const res = await fetch(`http://localhost:4000/alumnos/editar/$${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    console.error('Error al actualizar estudiante');
    throw new Error('Error al actualizar estudiante');
  }

  const data = await res.json();

  return data;
}

/**
 * Eliminar estudiante
 */
export async function deleteStudent(id: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/alumnos/borrar/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar estudiante');
    throw new Error('Error al eliminar estudiante');
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
