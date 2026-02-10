//import { supabase } from '../../lib/supabase';

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
  const res = await fetch('http://localhost:4000/users');

  if (!res.ok) {
    console.error('Error al obtener administradores:');
    throw new Error('Error loading admin users');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener administrador por ID
 */
export async function getAdminById(id: number): Promise<Admin | null> {
  const params = new URLSearchParams({
    id: String(id)
  });
  const res = await fetch(`http://localhost:4000/users/find?${params}`);

  /*if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener administrador:', error);
    throw error;
  }*/
 
  if (!res.ok) {
    console.error('Error al obtener administrador.');
    throw new Error('Error al obtener administrador');
  }

  const data = await res.json();

  return data;
}

/**
 * Obtener administrador por email
 * Útil para el proceso de login
 */
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const params = new URLSearchParams({
    email
  });
  const res = await fetch(`http://localhost:4000/users/find?${params}`);

  /*if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error al obtener administrador por email:', error);
    throw error;
  }*/

  if (!res.ok) {
    console.error('Error al obtener administrador por email');
    throw new Error('Error al obtener administrador por email');
  }

  const data = await res.json();

  return data;
}

/**
 * Verificar credenciales de administrador
 * Retorna el admin si las credenciales son correctas, null si no
 * IMPORTANTE: En producción se debería usar hash de contraseñas
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<Admin | null> {
  const res = await fetch('http://localhost:4000/users/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), 
    });

  /*if (error) {
    if (error.code === 'PGRST116') {
      return null; // Credenciales incorrectas
    }
    console.error('Error al verificar credenciales:', error);
    throw error;
  }*/

  if (!res.ok) {
    console.error('Error al verificar credenciales');
    throw new Error('Error al verificar credenciales');
  }

  const data = await res.json();

  return data;
}

/**
 * Crear nuevo administrador
 */
export async function createAdmin(admin: Omit<Admin, 'id' | 'created_at' | 'area'>): Promise<Admin> {
  const res = await fetch('http://localhost:4000/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(admin),
  });

  /*if (error) {
    console.error('Error al crear administrador:', error);
    throw error;
  }*/

  if (!res.ok) {
    console.error('Error al crear administrador');
    throw new Error('Error al crear administrador');
  }

  const data = await res.json();

  return data;
}

/**
 * Actualizar administrador
 */
export async function updateAdmin(
  id: number,
  updates: Partial<Omit<Admin, 'id' | 'created_at' | 'area'>>
): Promise<Admin> {
  const res = await fetch(`http://localhost:4000/users/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    throw new Error('Error al actualizar administrador');
  }

  const data = await res.json();

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
  const res = await fetch(`http://localhost:4000/users/delete/${id}`);

  if (!res.ok) {
    console.error('Error al eliminar administrador');
    throw new Error('Error al eliminar administrador');
  }
}

/**
 * Obtener administradores por rol
 */
export async function getAdminsByRole(role: 'admin_black' | 'admin_oro' | 'admin_plata'): Promise<Admin[]> {
  const params = new URLSearchParams({
    role
  });
  const res = await fetch(`http://localhost:4000/users/find?${params}`);

  if (!res.ok) {
    console.error('Error al obtener administradores por rol');
    throw new Error('Error al obtener administradores por rol');
  }

  const data = await res.json();

  return data || [];
}

/**
 * Obtener administradores de un área específica
 * Útil para admin_oro que solo pueden ver su área
 */
export async function getAdminsByArea(areaId: number): Promise<Admin[]> {
  const params = new URLSearchParams({
    area_id: String(areaId)
  });
  const res = await fetch(`http://localhost:4000/users/find?${params}`);

  if (!res.ok) {
    console.error('Error al obtener administradores del área');
    throw new Error('Error al obtener administradores del área');
  }

  const data = await res.json();

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
