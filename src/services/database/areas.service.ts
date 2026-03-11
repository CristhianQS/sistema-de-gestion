//import { supabase } from '../../lib/supabase';
import type { Area } from '../../lib/supabase';
import type { PaginationParams, PaginationResult } from '../../types/pagination';
import { toPaginationRange, createPaginationResult, DEFAULT_PAGE_SIZE } from '../../types/pagination';

/**
 * Servicio de acceso a datos para Áreas
 * Centraliza todas las operaciones CRUD de la tabla 'areas'
 */

/**
 * Obtener todas las áreas ordenadas por nombre - PAGINADO
 */
export async function getAllAreas(
  params?: Partial<PaginationParams>
): Promise<PaginationResult<Area>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  const res = await fetch('http://localhost:4000/areas');

  if (!res.ok) {
    console.error('Error al obtener áreas:');
    throw new Error('Error al obtener áreas');
  }

  const allAreas: Area[] = await res.json();
  const orderedAreas = [...(allAreas || [])].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', 'es')
  );

  const paginatedAreas = orderedAreas.slice(from, to + 1);

  return createPaginationResult(paginatedAreas, orderedAreas.length, { page, pageSize });
}

/**
 * Obtener todas las áreas sin paginación - DEPRECADO
 * @deprecated Usar getAllAreas con parámetros de paginación
 */
export async function getAllAreasUnpaginated(): Promise<Area[]> {
  const res = await fetch(`http://localhost:4000/areas`);

  if (!res.ok) {
    console.error('Error al obtener áreas:');
    throw Error("Error, ERROR MATE!");
  }

  return res.json() || [];
}

/**
 * Obtener área por ID
 */
export async function getAreaById(id: number): Promise<Area | null> {
  const res = await fetch(`http://localhost:4000/areas/${id}`);

  //if (error) {
  if (!res.ok) {
    // PGRST116 = no se encontró el registro
    /*if (error.code === 'PGRST116') {
      return null;
    }*/
    console.error('Error al obtener área:');
    throw Error("Error en la ejecución");
  }
  const data = await res.json();

  return data;
}

/**
 * Crear nueva área
 */
export async function createArea(area: Omit<Area, 'id' | 'created_at'>): Promise<Area> {
  const res = await fetch('http://localhost:4000/nuevoarea', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(area),
  });

  if (!res.ok) {
    console.error('Error al crear área:');
    throw Error("Error en la ejecución");
  }

  const data = await res.json();
  return data;
}

/**
 * Actualizar área existente
 */
export async function updateArea(id: number, updates: Partial<Omit<Area, 'id' | 'created_at'>>): Promise<Area> {
  const res = await fetch(`http://localhost:4000/editararea/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    console.error('Error al actualizar área.');
    throw Error("Error en la ejecución");
  }

  const data = await res.json();
  return data;
}

/**
 * Eliminar área
 */
export async function deleteArea(id: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/borrararea/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar área.');
    throw Error("Error en la ejecución");
  }
}

/**
 * Buscar áreas por palabra clave en nombre o descripción - PAGINADO
 * Útil para el chatbot con IA
 */
export async function searchAreasByKeyword(
  keyword: string,
  params?: Partial<PaginationParams>
): Promise<PaginationResult<Area>> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE } = params || {};
  const { from, to } = toPaginationRange({ page, pageSize });

  const params2 = new URLSearchParams({
      keyword,
      from: String(from),
      to: String(to),
    });

  const res = await fetch(`http://localhost:4000/buscarareas?${params2}`);

  if (!res.ok) {
    console.error('Error al buscar áreas.'); 
    throw Error('Error fetching areas');
  }

  const { data, count } = await res.json();

  return createPaginationResult(data || [], count || 0, { page, pageSize });
}
