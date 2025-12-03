import { supabase } from '../../lib/supabase';

/**
 * Servicio de acceso a datos para Pabellones y Salones
 * Centraliza todas las operaciones CRUD de las tablas 'pabellones' y 'salones'
 */

// Tipos para Pabellón y Salón
export interface Pabellon {
  id: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
}

export interface Salon {
  id: number;
  pabellon_id: number;
  nombre: string;
  capacidad?: number;
  tipo?: string;
  created_at?: string;
  pabellon?: Pabellon;
}

// ============================================
// FUNCIONES PARA PABELLONES
// ============================================

/**
 * Obtener todos los pabellones
 */
export async function getAllPabellones(): Promise<Pabellon[]> {
  const { data, error } = await supabase
    .from('pabellones')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener pabellones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener pabellón por ID
 */
export async function getPabellonById(id: number): Promise<Pabellon | null> {
  const { data, error } = await supabase
    .from('pabellones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener pabellón:', error);
    throw error;
  }

  return data;
}

/**
 * Crear nuevo pabellón
 */
export async function createPabellon(pabellon: Omit<Pabellon, 'id' | 'created_at'>): Promise<Pabellon> {
  const { data, error } = await supabase
    .from('pabellones')
    .insert([pabellon])
    .select()
    .single();

  if (error) {
    console.error('Error al crear pabellón:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar pabellón
 */
export async function updatePabellon(
  id: number,
  updates: Partial<Omit<Pabellon, 'id' | 'created_at'>>
): Promise<Pabellon> {
  const { data, error } = await supabase
    .from('pabellones')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error al actualizar pabellón:', error);
    throw error;
  }

  return data;
}

/**
 * Eliminar pabellón
 */
export async function deletePabellon(id: number): Promise<void> {
  const { error } = await supabase
    .from('pabellones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar pabellón:', error);
    throw error;
  }
}

// ============================================
// FUNCIONES PARA SALONES
// ============================================

/**
 * Obtener todos los salones con información del pabellón
 */
export async function getAllSalones(): Promise<Salon[]> {
  const { data, error } = await supabase
    .from('salones')
    .select(`
      *,
      pabellon:pabellones(id, nombre, descripcion)
    `)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener salones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener salones por pabellón
 * Esta es la función más usada en el chatbot
 */
export async function getSalonesByPabellon(pabellonId: number): Promise<Salon[]> {
  const { data, error } = await supabase
    .from('salones')
    .select(`
      *,
      pabellon:pabellones(id, nombre, descripcion)
    `)
    .eq('pabellon_id', pabellonId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener salones del pabellón:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener salón por ID
 */
export async function getSalonById(id: number): Promise<Salon | null> {
  const { data, error } = await supabase
    .from('salones')
    .select(`
      *,
      pabellon:pabellones(id, nombre, descripcion)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener salón:', error);
    throw error;
  }

  return data;
}

/**
 * Crear nuevo salón
 */
export async function createSalon(salon: Omit<Salon, 'id' | 'created_at' | 'pabellon'>): Promise<Salon> {
  const { data, error } = await supabase
    .from('salones')
    .insert([salon])
    .select(`
      *,
      pabellon:pabellones(id, nombre, descripcion)
    `)
    .single();

  if (error) {
    console.error('Error al crear salón:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar salón
 */
export async function updateSalon(
  id: number,
  updates: Partial<Omit<Salon, 'id' | 'created_at' | 'pabellon'>>
): Promise<Salon> {
  const { data, error } = await supabase
    .from('salones')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      pabellon:pabellones(id, nombre, descripcion)
    `)
    .single();

  if (error) {
    console.error('Error al actualizar salón:', error);
    throw error;
  }

  return data;
}

/**
 * Eliminar salón
 */
export async function deleteSalon(id: number): Promise<void> {
  const { error } = await supabase
    .from('salones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar salón:', error);
    throw error;
  }
}

/**
 * Contar salones por pabellón
 */
export async function countSalonesByPabellon(pabellonId: number): Promise<number> {
  const { count, error } = await supabase
    .from('salones')
    .select('*', { count: 'exact', head: true })
    .eq('pabellon_id', pabellonId);

  if (error) {
    console.error('Error al contar salones:', error);
    throw error;
  }

  return count || 0;
}
