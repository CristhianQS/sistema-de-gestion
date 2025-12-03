import { supabase } from '../../lib/supabase';
import type { Area } from '../../lib/supabase';

/**
 * Servicio de acceso a datos para Áreas
 * Centraliza todas las operaciones CRUD de la tabla 'areas'
 */

/**
 * Obtener todas las áreas ordenadas por nombre
 */
export async function getAllAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener áreas:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener área por ID
 */
export async function getAreaById(id: number): Promise<Area | null> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // PGRST116 = no se encontró el registro
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener área:', error);
    throw error;
  }

  return data;
}

/**
 * Crear nueva área
 */
export async function createArea(area: Omit<Area, 'id' | 'created_at'>): Promise<Area> {
  const { data, error } = await supabase
    .from('areas')
    .insert([area])
    .select()
    .single();

  if (error) {
    console.error('Error al crear área:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar área existente
 */
export async function updateArea(id: number, updates: Partial<Omit<Area, 'id' | 'created_at'>>): Promise<Area> {
  const { data, error } = await supabase
    .from('areas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar área:', error);
    throw error;
  }

  return data;
}

/**
 * Eliminar área
 */
export async function deleteArea(id: number): Promise<void> {
  const { error } = await supabase
    .from('areas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar área:', error);
    throw error;
  }
}

/**
 * Buscar áreas por palabra clave en nombre o descripción
 * Útil para el chatbot con IA
 */
export async function searchAreasByKeyword(keyword: string): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al buscar áreas:', error);
    throw error;
  }

  return data || [];
}
