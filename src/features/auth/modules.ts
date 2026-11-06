/**
 * Módulos del panel de administración y modelo de permisos.
 *
 * - super_admin: acceso total a todos los módulos (incluido Usuarios).
 * - admin: solo los módulos que el super admin le asigne, con acceso
 *   'view' (ver) o 'edit' (ver y editar). Reportes se limita a sus áreas.
 */

export type Role = 'super_admin' | 'admin';
export type Access = 'view' | 'edit';

/** Módulos que el super admin puede asignar (coinciden con el CHECK de admin_modules) */
export const ASSIGNABLE_MODULES = ['reportes', 'areas', 'pabellones', 'alumnos', 'docentes', 'chatbot', 'whatsapp'] as const;
export type AssignableModule = (typeof ASSIGNABLE_MODULES)[number];

/** Usuarios y permisos: exclusivo del super admin (evita que un admin se dé más permisos) */
export type ModuleKey = AssignableModule | 'usuarios';

export interface ModuleDef {
  key: ModuleKey;
  label: string;
  description: string;
  /** El acceso de solo lectura tiene sentido en este módulo */
  supportsView: boolean;
}

export const MODULES: ModuleDef[] = [
  { key: 'reportes', label: 'Reportes', description: 'Reportes de alumnos y docentes por área', supportsView: true },
  { key: 'areas', label: 'Áreas', description: 'Áreas y campos de sus formularios', supportsView: true },
  { key: 'pabellones', label: 'Pabellones', description: 'Pabellones y salones del campus', supportsView: true },
  { key: 'alumnos', label: 'Alumnos', description: 'Datos de estudiantes e importación Excel', supportsView: true },
  { key: 'docentes', label: 'Docentes', description: 'Datos de docentes e importación Excel', supportsView: true },
  { key: 'chatbot', label: 'Chatbot', description: 'Mensajes del asistente y prompt para BuilderBot', supportsView: true },
  { key: 'whatsapp', label: 'WhatsApp', description: 'Mensajes que llegan al bot de WhatsApp', supportsView: true },
  { key: 'usuarios', label: 'Usuarios y permisos', description: 'Cuentas, módulos y áreas de cada admin', supportsView: false },
];

export const MODULE_BY_KEY = new Map(MODULES.map((m) => [m.key, m]));

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super admin',
  admin: 'Admin',
};

/**
 * Convierte el rol guardado en la base al modelo nuevo. Acepta los roles
 * antiguos para que la app funcione antes y después de la migración SQL.
 */
export function normalizeRole(role: string | null | undefined): Role {
  return role === 'super_admin' || role === 'admin_black' ? 'super_admin' : 'admin';
}

/** Permisos equivalentes a los roles antiguos (si aún no se migró la base) */
export function legacyModules(role: string | null | undefined): Partial<Record<AssignableModule, Access>> {
  switch (role) {
    case 'admin_oro':
      return { reportes: 'edit' };
    case 'admin_plata':
      return { reportes: 'view', alumnos: 'view' };
    default:
      return {};
  }
}

export type ModulePermissions = Partial<Record<AssignableModule, Access>>;

/** ¿Puede el usuario usar el módulo con el nivel pedido? */
export function hasAccess(
  role: Role,
  modules: ModulePermissions,
  module: ModuleKey,
  level: Access = 'view'
): boolean {
  if (role === 'super_admin') return true;
  if (module === 'usuarios') return false;
  const granted = modules[module];
  return level === 'view' ? granted != null : granted === 'edit';
}
