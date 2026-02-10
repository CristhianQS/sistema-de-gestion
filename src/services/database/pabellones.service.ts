//import { supabase } from '../../lib/supabase';

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
  const res = await fetch('http://localhost:4000/pabellones/lista');

  if (!res.ok) {
    console.error('Error al obtener pabellones');
    throw new Error('Error al obtener pabellones');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener pabellón por ID
 */
export async function getPabellonById(id: number): Promise<Pabellon | null> {
  const res = await fetch(`http://localhost:4000/pabellones/buscar/${id}`);

  if (!res.ok) {
    console.error('Error al obtener pabellón');
    throw new Error('Error al obtener pabellón');
  }

  const data = await res.json();

  return data;
}

/**
 * Crear nuevo pabellón
 */
export async function createPabellon(pabellon: Omit<Pabellon, 'id' | 'created_at'>): Promise<Pabellon> {
  const res = await fetch(`http://localhost:4000/pabellones/nuevo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pabellon),
  });

  if (!res.ok) {
    console.error('Error al crear pabellón');
    throw new Error('Error al crear pabellón');
  }

  const data = await res.json();

  return data;
}

/**
 * Actualizar pabellón
 */
export async function updatePabellon(
  id: number,
  updates: Partial<Omit<Pabellon, 'id' | 'created_at'>>
): Promise<Pabellon> {
  const res = await fetch(`http://localhost:4000/pabellones/editar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    console.error('Error al actualizar pabellón');
    throw new Error('Error al actualizar pabellón');
  }

  const data = await res.json();

  return data;
}

/**
 * Eliminar pabellón
 */
export async function deletePabellon(id: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/pabellon/borrar/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar pabellón');
    throw new Error('Error al eliminar pabellón');
  }
}

// ============================================
// FUNCIONES PARA SALONES
// ============================================

/**
 * Obtener todos los salones con información del pabellón
 */
export async function getAllSalones(): Promise<Salon[]> {
  const res = await fetch(`http://localhost:4000/salones/lista`);

  if (!res.ok) {
    console.error('Error al obtener salones');
    throw new Error('Error al obtener salones');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener salones por pabellón
 * Esta es la función más usada en el chatbot
 */
export async function getSalonesByPabellon(pabellonId: number): Promise<Salon[]> {
  const res = await fetch(`http://localhost:4000/salones/filtrar?pabId=${pabellonId}`);

  if (!res.ok) {
    console.error('Error al obtener salones del pabellón');
    throw new Error('Error al obtener salones del pabellón');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener salón por ID
 */
export async function getSalonById(id: number): Promise<Salon | null> {
  const res = await fetch(`http://localhost:4000/salones/buscar/${id}`);

  if (!res.ok) {
    console.error('Error al obtener salón');
    throw new Error('Error al obtener salón');
  }

  const data = await res.json();

  return data;
}

/**
 * Crear nuevo salón
 */
export async function createSalon(salon: Omit<Salon, 'id' | 'created_at' | 'pabellon'>): Promise<Salon> {
  const res = await fetch(`http://localhost:4000/salones/nuevo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salon),
  });

  if (!res.ok) {
    console.error('Error al crear salón');
    throw new Error('Error al crear salón');
  }

  const data = await res.json();

  return data;
}

/**
 * Actualizar salón
 */
export async function updateSalon(
  id: number,
  updates: Partial<Omit<Salon, 'id' | 'created_at' | 'pabellon'>>
): Promise<Salon> {
  const res = await fetch(`http://localhost:4000/salones/editar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    console.error('Error al actualizar salón');
    throw new Error('Error al actualizar salón');
  }

  const data = await res.json();

  return data;
}

/**
 * Eliminar salón
 */
export async function deleteSalon(id: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/salones/borrar/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar salón');
    throw new Error('Error al eliminar salón');
  }
}

/**
 * Contar salones por pabellón
 */
export async function countSalonesByPabellon(pabellonId: number): Promise<number> {
  const res = await fetch(`http://localhost:4000/salones/conteo/${pabellonId}`);

  if (!res.ok) {
    console.error('Error al contar salones');
    throw new Error('Error al contar salones');
  }

  const count = await res.json();

  return count || 0;
}
