import { supabase } from '../../lib/supabase';

export interface Docente {
  id?: number;
  nombres: string;
  apellidos: string;
  dni: string;
  email?: string;
  telefono?: string;
  especialidad?: string;
  departamento?: string;
  estado?: 'activo' | 'inactivo' | 'licencia';
  fecha_ingreso?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Obtener todos los docentes con paginación
 */
export async function getAllDocentes(
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string
): Promise<{ data: Docente[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('docentes')
    .select('*', { count: 'exact' })
    .order('apellidos', { ascending: true })
    .order('nombres', { ascending: true });

  // Búsqueda por término
  if (searchTerm && searchTerm.trim()) {
    query = query.or(
      `nombres.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,dni.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error al obtener docentes:', error);
    throw error;
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Obtener todos los docentes sin paginación (para exportar)
 */
export async function getAllDocentesUnpaginated(): Promise<Docente[]> {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .order('apellidos', { ascending: true })
    .order('nombres', { ascending: true });

  if (error) {
    console.error('Error al obtener docentes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener docente por DNI
 */
export async function getDocenteByDni(dni: string): Promise<Docente | null> {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('dni', dni)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No encontrado
    }
    console.error('Error al buscar docente:', error);
    throw error;
  }

  return data;
}

/**
 * Obtener docente por ID
 */
export async function getDocenteById(id: number): Promise<Docente | null> {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al buscar docente:', error);
    throw error;
  }

  return data;
}

/**
 * Crear un nuevo docente
 */
export async function createDocente(docente: Omit<Docente, 'id' | 'created_at' | 'updated_at'>): Promise<Docente> {
  const { data, error } = await supabase
    .from('docentes')
    .insert([docente])
    .select()
    .single();

  if (error) {
    console.error('Error al crear docente:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar un docente existente
 */
export async function updateDocente(id: number, docente: Partial<Docente>): Promise<Docente> {
  const { data, error } = await supabase
    .from('docentes')
    .update(docente)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar docente:', error);
    throw error;
  }

  return data;
}

/**
 * Eliminar un docente
 */
export async function deleteDocente(id: number): Promise<void> {
  const { error } = await supabase
    .from('docentes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar docente:', error);
    throw error;
  }
}

/**
 * Importar múltiples docentes desde Excel
 */
export async function importDocentes(docentes: Omit<Docente, 'id' | 'created_at' | 'updated_at'>[]): Promise<{
  success: number;
  errors: { row: number; dni: string; error: string }[];
}> {
  const results = {
    success: 0,
    errors: [] as { row: number; dni: string; error: string }[]
  };

  for (let i = 0; i < docentes.length; i++) {
    const docente = docentes[i];
    try {
      // Verificar si ya existe
      const existente = await getDocenteByDni(docente.dni);

      if (existente) {
        // Actualizar
        await updateDocente(existente.id!, docente);
      } else {
        // Crear nuevo
        await createDocente(docente);
      }

      results.success++;
    } catch (error: any) {
      results.errors.push({
        row: i + 2, // +2 porque fila 1 es header y el índice empieza en 0
        dni: docente.dni,
        error: error.message || 'Error desconocido'
      });
    }
  }

  return results;
}

/**
 * Buscar docentes por nombre
 */
export async function searchDocentes(searchTerm: string): Promise<Docente[]> {
  const { data, error } = await supabase.rpc('search_docentes', {
    search_term: searchTerm
  });

  if (error) {
    console.error('Error al buscar docentes:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener docentes por estado
 */
export async function getDocentesByEstado(estado: 'activo' | 'inactivo' | 'licencia' = 'activo'): Promise<Docente[]> {
  const { data, error } = await supabase.rpc('get_docentes_by_estado', {
    p_estado: estado
  });

  if (error) {
    console.error('Error al obtener docentes por estado:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener estadísticas de docentes
 */
export async function getDocentesStats(): Promise<{
  total: number;
  activos: number;
  inactivos: number;
  licencia: number;
}> {
  const { data, error } = await supabase
    .from('docentes')
    .select('estado');

  if (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }

  const stats = {
    total: data?.length || 0,
    activos: data?.filter(d => d.estado === 'activo').length || 0,
    inactivos: data?.filter(d => d.estado === 'inactivo').length || 0,
    licencia: data?.filter(d => d.estado === 'licencia').length || 0
  };

  return stats;
}
