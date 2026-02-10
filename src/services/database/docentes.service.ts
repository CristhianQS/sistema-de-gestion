//import { supabase } from '../../lib/supabase';

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
  const params = new URLSearchParams({
    page: String(page),
    pagesize: String(pageSize),
    search: String(searchTerm? searchTerm : null)
  });
  const res = await fetch(`http://localhost:4000/docentes/filtrar?${params}`);
  //const res = await fetch(`http://localhost:4000/docentes/buscar?page=${page}&pagesize=${pageSize}&search=${searchTerm}`);

  if (!res.ok) {
    console.error('Error al obtener docentes');
    throw new Error('Error al obtener docentes');
  }

  const data = await res.json();

  return { data: data.data || [], count: data.count || 0 };
}

/**
 * Obtener todos los docentes sin paginación (para exportar)
 */
export async function getAllDocentesUnpaginated(): Promise<Docente[]> {
  const res = await fetch('http://localhost:4000/docentes/lista');

  if (!res.ok) {
    console.error('Error al obtener docentes');
    throw new Error('Error al obtener docentes');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener docente por DNI
 */
export async function getDocenteByDni(dni: string): Promise<Docente | null> {
  const params = new URLSearchParams({
    dni,
  });
  const res = await fetch(`http://localhost:4000/docentes/buscar?${params}`);

  if (!res.ok) {
    console.error('Error al buscar docente');
    throw new Error('Error al buscar docente');
  }

  const data = await res.json();

  return data;
}

/**
 * Obtener docente por ID
 */
export async function getDocenteById(id: number): Promise<Docente | null> {
  const params = new URLSearchParams({
    id: String(id),
  });
  const res = await fetch(`http://localhost:4000/docentes/buscar?${params}`);

  if (!res.ok) {
    console.error('Error al buscar docente');
    throw new Error('Error al buscar docente');
  }

  const data = await res.json();

  return data;
}

/**
 * Crear un nuevo docente
 */
export async function createDocente(docente: Omit<Docente, 'id' | 'created_at' | 'updated_at'>): Promise<Docente> {
  const res = await fetch('http://localhost:4000/docentes/nuevo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docente),
  });
if (!res.ok) {
    console.error('Error al crear docente');
    throw new Error('Error al crear docente');
  }

  const data = await res.json();

  return data;
}

/**
 * Actualizar un docente existente
 */
export async function updateDocente(id: number, docente: Partial<Docente>): Promise<Docente> {
  const res = await fetch(`http://localhost:4000/docentes/editar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docente),
  });

  if (!res.ok) {
    throw new Error('Error al actualizar docente');
  }

  const data = await res.json();

  return data;
}

/**
 * Eliminar un docente
 */
export async function deleteDocente(id: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/docentes/borrar/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar docente');
    throw new Error('Error al eliminar docente');
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
  const params = new URLSearchParams({
    search: String(searchTerm)
  });
  const res = await fetch(`http://localhost:4000/docentes/filtrar?${params}`);
  
  if (!res.ok) {
    console.error('Error al buscar docentes');
    throw new Error('Error al buscar docentes');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener docentes por estado
 */
export async function getDocentesByEstado(estado: 'activo' | 'inactivo' | 'licencia' = 'activo'): Promise<Docente[]> {
  const params = new URLSearchParams({
    estado,
  });
  const res = await fetch(`http://localhost:4000/docentes/buscar?${params}`);

  if (!res.ok) {
    console.error('Error al buscar docente por estado');
    throw new Error('Error al buscar docente por estado');
  }

  const data = await res.json();

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
  const res = await fetch(`http://localhost:4000/docentes/estados`);

  if (!res.ok) {
    console.error('Error al obtener estadísticas');
    throw new Error('Error al obtener estadísticas');
  }

  const data: [{estado: any}] = await res.json();

  const stats = {
    total: data?.length || 0,
    activos: data?.filter(d => d.estado === 'activo').length || 0,
    inactivos: data?.filter(d => d.estado === 'inactivo').length || 0,
    licencia: data?.filter(d => d.estado === 'licencia').length || 0
  };

  return stats;
}
