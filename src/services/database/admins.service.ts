import { supabase } from '../../lib/supabase';
import type { AdminRole } from '../../types';

/**
 * Servicio de gestión de administradores (pantallas de Admin Oro / Lista de usuarios).
 *
 * Nunca selecciona la columna `password`: las listas no la necesitan y
 * no debe viajar al navegador.
 */

/** Columnas públicas de admin_user (todas menos password) */
export const ADMIN_PUBLIC_COLUMNS = 'id, email, name, dni, role, area_id, created_at' as const;

export interface AreaRef {
  id: number;
  name: string;
}

export interface AdminWithAreas {
  id: number;
  email: string;
  name: string | null;
  dni: string | null;
  role: AdminRole;
  area_id: number | null;
  created_at: string;
  areas: AreaRef[];
}

interface GetAdminsOptions {
  /** Filtrar por rol; sin valor devuelve todos */
  role?: AdminRole;
  orderBy?: { column: 'name' | 'created_at'; ascending: boolean };
  /**
   * Si es true, los admin_oro / admin_plata con `area_id` usan esa área en
   * lugar de las de `user_areas` (comportamiento de la Lista de usuarios).
   */
  preferDirectArea?: boolean;
}

/**
 * Obtiene administradores con sus áreas en 3 consultas fijas
 * (antes: 1 + hasta 2 por administrador).
 */
export async function getAdminsWithAreas({
  role,
  orderBy = { column: 'created_at', ascending: false },
  preferDirectArea = false,
}: GetAdminsOptions = {}): Promise<AdminWithAreas[]> {
  let query = supabase
    .from('admin_user')
    .select(ADMIN_PUBLIC_COLUMNS)
    .order(orderBy.column, { ascending: orderBy.ascending });
  if (role) query = query.eq('role', role);

  const { data: admins, error } = await query;
  if (error) throw error;
  if (!admins || admins.length === 0) return [];

  const usesDirectArea = (a: { role: string; area_id: number | null }) =>
    preferDirectArea && (a.role === 'admin_plata' || a.role === 'admin_oro') && a.area_id != null;

  // Relación usuario → áreas, en una sola consulta
  const userIds = admins.filter((a) => !usesDirectArea(a)).map((a) => a.id);
  const { data: links, error: linksError } = userIds.length
    ? await supabase.from('user_areas').select('user_id, area_id').in('user_id', userIds)
    : { data: [] as { user_id: number; area_id: number }[], error: null };
  if (linksError) throw linksError;

  const areaIdsByUser = new Map<number, number[]>();
  for (const link of links ?? []) {
    const list = areaIdsByUser.get(link.user_id);
    if (list) list.push(link.area_id);
    else areaIdsByUser.set(link.user_id, [link.area_id]);
  }

  // Todas las áreas involucradas, en una sola consulta
  const allAreaIds = new Set<number>();
  for (const a of admins) {
    if (usesDirectArea(a)) allAreaIds.add(a.area_id!);
  }
  for (const ids of areaIdsByUser.values()) ids.forEach((id) => allAreaIds.add(id));

  const { data: areas, error: areasError } = allAreaIds.size
    ? await supabase.from('areas').select('id, name').in('id', [...allAreaIds])
    : { data: [] as AreaRef[], error: null };
  if (areasError) throw areasError;

  const areaById = new Map((areas ?? []).map((a) => [a.id, a]));
  const pick = (ids: number[]) => ids.map((id) => areaById.get(id)).filter((a): a is AreaRef => !!a);

  return admins.map((admin) => ({
    ...(admin as Omit<AdminWithAreas, 'areas'>),
    areas: usesDirectArea(admin) ? pick([admin.area_id!]) : pick(areaIdsByUser.get(admin.id) ?? []),
  }));
}

// ---------------------------------------------------------------------------
// Alta, edición y baja de cuentas (módulo Usuarios y permisos)
// ---------------------------------------------------------------------------

export interface AdminInput {
  name: string;
  email: string;
  dni: string | null;
  role: 'super_admin' | 'admin';
  /** Obligatoria al crear; vacía al editar = no cambiar */
  password?: string;
}

/** ¿Existe otra cuenta con este email? */
export async function isEmailTaken(email: string, exceptId?: number): Promise<boolean> {
  let query = supabase.from('admin_user').select('id').eq('email', email);
  if (exceptId != null) query = query.neq('id', exceptId);
  const { data, error } = await query.limit(1);
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function createAdminUser(input: AdminInput): Promise<number> {
  const { data, error } = await supabase
    .from('admin_user')
    .insert([{ name: input.name, email: input.email, dni: input.dni, role: input.role, password: input.password }])
    .select('id')
    .single();
  if (error) throw error;
  return data.id as number;
}

export async function updateAdminUser(id: number, input: AdminInput): Promise<void> {
  const updates: Record<string, unknown> = { name: input.name, email: input.email, dni: input.dni, role: input.role };
  if (input.password) updates.password = input.password;
  const { error } = await supabase.from('admin_user').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteAdminUser(id: number): Promise<void> {
  const { error } = await supabase.from('admin_user').delete().eq('id', id);
  if (error) throw error;
}
