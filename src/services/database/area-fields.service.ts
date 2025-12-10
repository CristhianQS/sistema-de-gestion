import { supabase } from '../../lib/supabase';
import type { AreaField } from '../../types';

/**
 * Servicio para gestionar los campos personalizados de las áreas
 */

/**
 * Obtener todos los campos de un área específica
 */
export async function getFieldsByAreaId(areaId: number): Promise<AreaField[]> {
  const { data, error } = await supabase
    .from('area_fields')
    .select('*')
    .eq('area_id', areaId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error al obtener campos del área:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener campos de todas las áreas (para detección de IA)
 */
export async function getAllAreaFields(): Promise<Map<number, AreaField[]>> {
  const { data, error } = await supabase
    .from('area_fields')
    .select('*')
    .order('area_id', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error al obtener todos los campos:', error);
    throw error;
  }

  // Agrupar por area_id
  const fieldsMap = new Map<number, AreaField[]>();

  data?.forEach((field) => {
    if (!fieldsMap.has(field.area_id)) {
      fieldsMap.set(field.area_id, []);
    }
    fieldsMap.get(field.area_id)!.push(field);
  });

  return fieldsMap;
}

/**
 * Obtener solo los campos de tipo específico de un área
 */
export async function getFieldsByType(
  areaId: number,
  fieldType: AreaField['field_type']
): Promise<AreaField[]> {
  const { data, error } = await supabase
    .from('area_fields')
    .select('*')
    .eq('area_id', areaId)
    .eq('field_type', fieldType)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error al obtener campos por tipo:', error);
    throw error;
  }

  return data || [];
}
