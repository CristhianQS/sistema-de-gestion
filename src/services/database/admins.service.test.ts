import { beforeEach, describe, expect, it, vi } from 'vitest';

// Tablas falsas que devuelve el cliente de Supabase simulado
const tables: Record<string, Record<string, unknown>[]> = {};
const calls: { table: string; select: string; filters: [string, string, unknown][] }[] = [];

function queryBuilder(table: string) {
  const call = { table, select: '', filters: [] as [string, string, unknown][] };
  calls.push(call);
  const builder = {
    select(cols: string) {
      call.select = cols;
      return builder;
    },
    order() {
      return builder;
    },
    eq(col: string, val: unknown) {
      call.filters.push(['eq', col, val]);
      return builder;
    },
    in(col: string, vals: unknown[]) {
      call.filters.push(['in', col, vals]);
      return builder;
    },
    then(resolve: (r: { data: unknown[]; error: null }) => void) {
      let rows = tables[table] ?? [];
      for (const [op, col, val] of call.filters) {
        rows = rows.filter((r) => (op === 'eq' ? r[col] === val : (val as unknown[]).includes(r[col])));
      }
      resolve({ data: rows, error: null });
    },
  };
  return builder;
}

vi.mock('../../lib/supabase', () => ({
  supabase: { from: (table: string) => queryBuilder(table) },
}));

const { getAdminsWithAreas } = await import('./admins.service');

beforeEach(() => {
  calls.length = 0;
  tables.admin_user = [
    { id: 1, email: 'oro1@x.com', name: 'Oro 1', dni: null, role: 'admin_oro', area_id: null, created_at: '' },
    { id: 2, email: 'oro2@x.com', name: 'Oro 2', dni: null, role: 'admin_oro', area_id: 30, created_at: '' },
    { id: 3, email: 'plata@x.com', name: 'Plata', dni: null, role: 'admin_plata', area_id: 20, created_at: '' },
  ];
  tables.user_areas = [
    { user_id: 1, area_id: 10 },
    { user_id: 1, area_id: 20 },
    { user_id: 2, area_id: 10 },
  ];
  tables.areas = [
    { id: 10, name: 'DTI' },
    { id: 20, name: 'Limpieza' },
    { id: 30, name: 'Seguridad' },
  ];
});

describe('getAdminsWithAreas', () => {
  it('usa siempre 3 consultas, sin importar cuántos admins haya', async () => {
    await getAdminsWithAreas();
    expect(calls.map((c) => c.table)).toEqual(['admin_user', 'user_areas', 'areas']);
  });

  it('nunca pide la columna password', async () => {
    await getAdminsWithAreas();
    expect(calls[0].select).not.toMatch(/password|\*/);
  });

  it('asigna las áreas de user_areas a cada admin', async () => {
    const admins = await getAdminsWithAreas({ role: 'admin_oro' });
    const byId = Object.fromEntries(admins.map((a) => [a.id, a.areas.map((x) => x.name)]));
    expect(byId).toEqual({ 1: ['DTI', 'Limpieza'], 2: ['DTI'] });
  });

  it('con preferDirectArea usa area_id para oro/plata que lo tienen', async () => {
    const admins = await getAdminsWithAreas({ preferDirectArea: true });
    const byId = Object.fromEntries(admins.map((a) => [a.id, a.areas.map((x) => x.name)]));
    expect(byId).toEqual({ 1: ['DTI', 'Limpieza'], 2: ['Seguridad'], 3: ['Limpieza'] });
  });

  it('sin admins no hace más consultas', async () => {
    tables.admin_user = [];
    expect(await getAdminsWithAreas()).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});
