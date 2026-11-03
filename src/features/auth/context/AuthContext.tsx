import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ADMIN_PUBLIC_COLUMNS } from '../../../services/database/admins.service';
import { getUserAreaIds, getUserModules } from '../../../services/database/permissions.service';
import { hasAccess, normalizeRole, type Access, type ModuleKey, type ModulePermissions, type Role } from '../modules';

/** Usuario en sesión. Nunca incluye la contraseña. */
export interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  name: string | null;
  dni: string | null;
  area_id: number | null;
  /** Rol tal como está en la base (puede ser un rol antiguo antes de migrar) */
  role: string;
}

interface Permissions {
  modules: ModulePermissions;
  /** Áreas asignadas; el super admin ve todas (null = sin restricción) */
  areaIds: number[] | null;
}

interface AuthContextType {
  user: AdminUser | null;
  role: Role | null;
  permissions: Permissions | null;
  /** true mientras se cargan módulos y áreas tras iniciar sesión */
  loading: boolean;
  can: (module: ModuleKey, level?: Access) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  reloadPermissions: () => Promise<void>;
}

const STORAGE_KEY = 'admin_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Lee la sesión guardada. Las sesiones antiguas guardaban la contraseña:
 * se elimina y se reescribe la sesión sin ella.
 */
function readStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { password, ...user } = JSON.parse(raw) as AdminUser & { password?: string };
    if (password !== undefined) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

async function loadPermissions(user: AdminUser): Promise<Permissions> {
  if (normalizeRole(user.role) === 'super_admin') return { modules: {}, areaIds: null };
  const [modules, areaIds] = await Promise.all([
    getUserModules(user.id, user.role),
    getUserAreaIds(user.id, user.area_id),
  ]);
  return { modules, areaIds };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lectura síncrona al montar: evita un render extra con user = null
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  const reloadPermissions = useCallback(async () => {
    if (!user) return;
    try {
      setPermissions(await loadPermissions(user));
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      setPermissions({ modules: {}, areaIds: [] }); // sin permisos ante error
    }
  }, [user]);

  // Los permisos se piden siempre a la base (no se guardan en localStorage),
  // así los cambios del super admin aplican al recargar.
  useEffect(() => {
    setPermissions(null);
    if (user) void reloadPermissions();
  }, [user, reloadPermissions]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // La contraseña se compara en el servidor, pero no se devuelve
      const { data, error } = await supabase
        .from('admin_user')
        .select(ADMIN_PUBLIC_COLUMNS)
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error || !data) {
        return { success: false, message: 'Email o contraseña incorrectos' };
      }

      const sessionUser = data as AdminUser;
      setUser(sessionUser);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      } catch {
        // Sin almacenamiento disponible: la sesión dura hasta recargar
      }
      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: 'Error al conectar con el servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
  }, []);

  const role = user ? normalizeRole(user.role) : null;

  const can = useCallback(
    (module: ModuleKey, level: Access = 'view') =>
      !!role && !!permissions && hasAccess(role, permissions.modules, module, level),
    [role, permissions]
  );

  const value = useMemo(
    () => ({
      user,
      role,
      permissions,
      loading: !!user && !permissions,
      can,
      login,
      logout,
      reloadPermissions,
    }),
    [user, role, permissions, can, login, logout, reloadPermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
