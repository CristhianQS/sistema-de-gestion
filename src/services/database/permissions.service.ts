import { supabase } from '../../lib/supabase';
import {
  ASSIGNABLE_MODULES,
  legacyModules,
  type Access,
  type AssignableModule,
  type ModulePermissions,
} from '../../features/auth/modules';

/**
 * Permisos por módulo (tabla admin_modules) y áreas asignadas (user_areas).
 */

const isAssignable = (k: string): k is AssignableModule => (ASSIGNABLE_MODULES as readonly string[]).includes(k);

/** ¿El error indica que la tabla aún no existe (migración sin ejecutar)? */
function isMissingTable(error: { code?: string; message?: string }) {
  return error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message ?? '');
}

/**
 * Módulos de un usuario. Si la tabla admin_modules todavía no existe,
 * deriva los permisos del rol antiguo.
 */
export async function getUserModules(userId: number, rawRole: string): Promise<ModulePermissions> {
  const { data, error } = await supabase.from('admin_modules').select('module_key, access').eq('user_id', userId);
  if (error) {
    if (isMissingTable(error)) return legacyModules(rawRole);
    throw error;
  }
  const result: ModulePermissions = {};
  for (const row of data ?? []) {
    if (isAssignable(row.module_key)) result[row.module_key] = row.access as Access;
  }
  return result;
}

/** Módulos de varios usuarios a la vez (para la lista de usuarios) */
export async function getModulesForUsers(
  users: { id: number; role: string }[]
): Promise<Map<number, ModulePermissions>> {
  const map = new Map<number, ModulePermissions>(users.map((u) => [u.id, {}]));
  if (users.length === 0) return map;

  const { data, error } = await supabase
    .from('admin_modules')
    .select('user_id, module_key, access')
    .in('user_id', users.map((u) => u.id));
  if (error) {
    if (isMissingTable(error)) {
      for (const u of users) map.set(u.id, legacyModules(u.role));
      return map;
    }
    throw error;
  }
  for (const row of data ?? []) {
    if (isAssignable(row.module_key)) map.get(row.user_id)![row.module_key] = row.access as Access;
  }
  return map;
}

/** Reemplaza los módulos de un usuario */
export async function setUserModules(userId: number, modules: ModulePermissions): Promise<void> {
  const { error: delError } = await supabase.from('admin_modules').delete().eq('user_id', userId);
  if (delError) throw delError;

  const rows = Object.entries(modules).map(([module_key, access]) => ({ user_id: userId, module_key, access }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('admin_modules').insert(rows);
  if (error) throw error;
}

/** IDs de las áreas asignadas (user_areas, más area_id heredado de Admin Plata) */
export async function getUserAreaIds(userId: number, legacyAreaId?: number | null): Promise<number[]> {
  const { data, error } = await supabase.from('user_areas').select('area_id').eq('user_id', userId);
  if (error) throw error;
  const ids = new Set((data ?? []).map((r) => r.area_id as number));
  if (legacyAreaId != null) ids.add(legacyAreaId);
  return [...ids];
}

/** Reemplaza las áreas de un usuario */
export async function setUserAreas(userId: number, areaIds: number[]): Promise<void> {
  const { error: delError } = await supabase.from('user_areas').delete().eq('user_id', userId);
  if (delError) throw delError;
  if (areaIds.length === 0) return;
  const { error } = await supabase.from('user_areas').insert(areaIds.map((area_id) => ({ user_id: userId, area_id })));
  if (error) throw error;
}

export { isMissingTable };

/** ¿Ya se ejecutó la migración de roles y módulos? */
export async function isPermissionsMigrated(): Promise<boolean> {
  // GET normal (no HEAD): una respuesta HEAD no trae el código PGRST205 en el cuerpo
  const { error } = await supabase.from('admin_modules').select('user_id').limit(1);
  if (!error) return true;
  if (isMissingTable(error)) return false;
  throw error;
}
