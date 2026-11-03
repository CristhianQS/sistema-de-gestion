import { describe, expect, it } from 'vitest';
import { hasAccess, legacyModules, normalizeRole } from './modules';

describe('normalizeRole', () => {
  it('convierte los roles antiguos y nuevos', () => {
    expect(normalizeRole('super_admin')).toBe('super_admin');
    expect(normalizeRole('admin_black')).toBe('super_admin');
    expect(normalizeRole('admin')).toBe('admin');
    expect(normalizeRole('admin_oro')).toBe('admin');
    expect(normalizeRole('admin_plata')).toBe('admin');
    expect(normalizeRole(undefined)).toBe('admin');
  });
});

describe('hasAccess', () => {
  it('el super admin accede a todo, incluido usuarios', () => {
    expect(hasAccess('super_admin', {}, 'usuarios', 'edit')).toBe(true);
    expect(hasAccess('super_admin', {}, 'pabellones', 'edit')).toBe(true);
  });

  it('un admin nunca accede a usuarios, aunque tuviera el permiso', () => {
    expect(hasAccess('admin', { reportes: 'edit' }, 'usuarios')).toBe(false);
  });

  it('respeta ver / editar', () => {
    const mods = { reportes: 'view' as const, areas: 'edit' as const };
    expect(hasAccess('admin', mods, 'reportes', 'view')).toBe(true);
    expect(hasAccess('admin', mods, 'reportes', 'edit')).toBe(false);
    expect(hasAccess('admin', mods, 'areas', 'edit')).toBe(true);
    expect(hasAccess('admin', mods, 'docentes', 'view')).toBe(false);
  });
});

describe('legacyModules (antes de migrar)', () => {
  it('admin_oro editaba reportes; admin_plata solo veía reportes y alumnos', () => {
    expect(legacyModules('admin_oro')).toEqual({ reportes: 'edit' });
    expect(legacyModules('admin_plata')).toEqual({ reportes: 'view', alumnos: 'view' });
    expect(legacyModules('admin_black')).toEqual({});
  });
});
