import { supabase } from '../../lib/supabase';

/**
 * Servicio de acceso a datos para Autenticación
 * Centraliza todas las operaciones de la tabla 'admins'
 */

// Tipo para Admin
export interface Admin {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin_black' | 'admin_oro' | 'admin_plata';
  area_id?: number;
  created_at?: string;
  area?: {
    id: number;
    name: string;
    description?: string;
  };
}

/**
 * Obtener todos los administradores
 */
export async function getAllAdmins(): Promise<Admin[]> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener administradores:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener administrador por ID
 */
export async function getAdminById(id: number): Promise<Admin | null> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener administrador:', error);
    throw error;
  }

  return data;
}

/**
 * Obtener administrador por email
 * Útil para el proceso de login
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener administrador por email:', error);
    throw error;
  }

  return data;
}

/**
 * Verificar credenciales de administrador
 * Retorna el admin si las credenciales son correctas, null si no
 * IMPORTANTE: En producción se debería usar hash de contraseñas
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<Admin | null> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Credenciales incorrectas
    }
    console.error('Error al verificar credenciales:', error);
    throw error;
  }

  return data;
}

/**
 * Crear nuevo administrador
 */
export async function createAdmin(admin: Omit<Admin, 'id' | 'created_at' | 'area'>): Promise<Admin> {
  const { data, error } = await supabase
    .from('admin_user')
    .insert([admin])
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .single();

  if (error) {
    console.error('Error al crear administrador:', error);
    throw error;
  }

  return data;
}

/**
 * Actualizar administrador
 */
export async function updateAdmin(
  id: number,
  updates: Partial<Omit<Admin, 'id' | 'created_at' | 'area'>>
): Promise<Admin> {
  const { data, error } = await supabase
    .from('admin_user')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .single();

  if (error) {
    console.error('Error al actualizar administrador:', error);
    throw error;
  }

  return data;
}

/**
 * Cambiar contraseña de administrador
 * Función específica para cambios de contraseña
 */
export async function changeAdminPassword(id: number, newPassword: string): Promise<Admin> {
  return updateAdmin(id, { password: newPassword });
}

/**
 * Eliminar administrador
 */
export async function deleteAdmin(id: number): Promise<void> {
  const { error } = await supabase
    .from('admin_user')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar administrador:', error);
    throw error;
  }
}

/**
 * Obtener administradores por rol
 */
export async function getAdminsByRole(role: 'admin_black' | 'admin_oro' | 'admin_plata'): Promise<Admin[]> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .eq('role', role)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener administradores por rol:', error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener administradores de un área específica
 * Útil para admin_oro que solo pueden ver su área
 */
export async function getAdminsByArea(areaId: number): Promise<Admin[]> {
  const { data, error } = await supabase
    .from('admin_user')
    .select(`
      *,
      area:areas(id, name, description)
    `)
    .eq('area_id', areaId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error al obtener administradores del área:', error);
    throw error;
  }

  return data || [];
}

/**
 * Verificar si un email ya existe
 * Útil para validaciones antes de crear un nuevo admin
 */
export async function emailExists(email: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  return admin !== null;
}
