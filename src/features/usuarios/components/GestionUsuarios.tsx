import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Alert, Badge, Button, Modal, PageHeader, Spinner, inputClass } from '../../../components/ui';
import { useAuth } from '../../auth/context/AuthContext';
import {
  ASSIGNABLE_MODULES,
  MODULE_BY_KEY,
  ROLE_LABELS,
  normalizeRole,
  type Access,
  type AssignableModule,
  type ModulePermissions,
  type Role,
} from '../../auth/modules';
import {
  createAdminUser,
  deleteAdminUser,
  getAdminsWithAreas,
  isEmailTaken,
  updateAdminUser,
  type AdminWithAreas,
} from '../../../services/database/admins.service';
import {
  getModulesForUsers,
  isPermissionsMigrated,
  setUserAreas,
  setUserModules,
} from '../../../services/database/permissions.service';
import { getAllAreasUnpaginated } from '../../../services/database/areas.service';

interface UsuarioRow extends AdminWithAreas {
  normalizedRole: Role;
  modules: ModulePermissions;
}

interface FormState {
  name: string;
  email: string;
  dni: string;
  password: string;
  role: Role;
  modules: ModulePermissions;
  areaIds: number[];
}

const EMPTY_FORM: FormState = { name: '', email: '', dni: '', password: '', role: 'admin', modules: {}, areaIds: [] };

const ACCESS_OPTIONS: { value: Access | 'none'; label: string }[] = [
  { value: 'none', label: 'Sin acceso' },
  { value: 'view', label: 'Ver' },
  { value: 'edit', label: 'Editar' },
];

const QUERY_KEY = ['usuarios-permisos'];

async function loadUsuarios() {
  const [admins, migrated, areas] = await Promise.all([
    getAdminsWithAreas({ orderBy: { column: 'name', ascending: true }, preferDirectArea: true }),
    isPermissionsMigrated(),
    getAllAreasUnpaginated(),
  ]);
  const modulesByUser = await getModulesForUsers(admins);
  const usuarios: UsuarioRow[] = admins.map((a) => ({
    ...a,
    normalizedRole: normalizeRole(a.role),
    modules: modulesByUser.get(a.id) ?? {},
  }));
  return { usuarios, migrated, areas };
}

const GestionUsuarios: React.FC = () => {
  const { user, reloadPermissions } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error: loadError } = useQuery({ queryKey: QUERY_KEY, queryFn: loadUsuarios });

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<UsuarioRow | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const usuarios = data?.usuarios ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => `${u.name ?? ''} ${u.email}`.toLowerCase().includes(q));
  }, [data, search]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing('new');
  };

  const openEdit = (u: UsuarioRow) => {
    setForm({
      name: u.name ?? '',
      email: u.email,
      dni: u.dni ?? '',
      password: '',
      role: u.normalizedRole,
      modules: { ...u.modules },
      areaIds: u.areas.map((a) => a.id),
    });
    setFormError('');
    setEditing(u);
  };

  const closeModal = () => setEditing(null);

  const save = useMutation({
    mutationFn: async () => {
      const isNew = editing === 'new';
      const id = isNew ? undefined : (editing as UsuarioRow).id;
      const email = form.email.trim().toLowerCase();

      if (!form.name.trim() || !email) throw new Error('El nombre y el email son obligatorios.');
      if (isNew && form.password.trim().length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
      if (!isNew && form.password && form.password.trim().length < 6)
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres.');
      if (await isEmailTaken(email, id)) throw new Error('Ya existe una cuenta con ese email.');

      const input = {
        name: form.name.trim(),
        email,
        dni: form.dni.trim() || null,
        role: form.role,
        password: form.password.trim() || undefined,
      };
      const userId = isNew ? await createAdminUser(input) : (await updateAdminUser(id!, input), id!);

      // El super admin no necesita módulos ni áreas: tiene acceso total
      const isAdmin = form.role === 'admin';
      await Promise.all([
        setUserModules(userId, isAdmin ? form.modules : {}),
        setUserAreas(userId, isAdmin ? form.areaIds : []),
      ]);
      return { isNew, userId };
    },
    onSuccess: async ({ isNew, userId }) => {
      setNotice(isNew ? 'Cuenta creada.' : 'Cambios guardados.');
      closeModal();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (userId === user?.id) await reloadPermissions();
    },
    onError: (e: Error) => setFormError(e.message || 'No se pudo guardar. Inténtalo de nuevo.'),
  });

  const remove = useMutation({
    mutationFn: (u: UsuarioRow) => deleteAdminUser(u.id),
    onSuccess: async () => {
      setNotice('Cuenta eliminada.');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (e: Error) => setNotice(`No se pudo eliminar la cuenta: ${e.message}`),
  });

  const handleDelete = (u: UsuarioRow) => {
    if (window.confirm(`¿Eliminar la cuenta de ${u.name || u.email}? Esta acción no se puede deshacer.`)) {
      remove.mutate(u);
    }
  };

  const setModuleAccess = (key: AssignableModule, value: Access | 'none') => {
    setForm((f) => {
      const modules = { ...f.modules };
      if (value === 'none') delete modules[key];
      else modules[key] = value;
      return { ...f, modules };
    });
  };

  const toggleArea = (areaId: number) =>
    setForm((f) => ({
      ...f,
      areaIds: f.areaIds.includes(areaId) ? f.areaIds.filter((x) => x !== areaId) : [...f.areaIds, areaId],
    }));

  if (isLoading) return <Spinner />;
  if (loadError) return <Alert tone="error">No se pudieron cargar las cuentas: {(loadError as Error).message}</Alert>;

  const migrated = data?.migrated ?? false;
  const isSelf = editing !== 'new' && editing?.id === user?.id;

  return (
    <div>
      <PageHeader
        title="Usuarios y permisos"
        description="Crea cuentas y define a qué módulos y áreas accede cada admin."
        actions={
          <Button onClick={openNew} disabled={!migrated}>
            <Plus className="h-4 w-4" /> Nueva cuenta
          </Button>
        }
      />

      {!migrated ? (
        <div className="mb-4">
          <Alert tone="info">
            La base de datos aún usa los roles antiguos. Los permisos que ves se calculan a partir de ellos. Para
            crear cuentas y asignar módulos, ejecuta en Supabase el archivo{' '}
            <code className="font-mono">supabase/migrations/20261103_roles_y_modulos.sql</code>.
          </Alert>
        </div>
      ) : null}
      {notice ? (
        <div className="mb-4">
          <Alert tone={notice.startsWith('No se pudo') ? 'error' : 'success'}>{notice}</Alert>
        </div>
      ) : null}

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email"
          className={`${inputClass} pl-9`}
          aria-label="Buscar cuentas"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Cuenta</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Módulos</th>
              <th className="px-4 py-3">Áreas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{u.name || 'Sin nombre'}</div>
                  <div className="text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.normalizedRole === 'super_admin' ? 'brand' : 'gray'}>
                    {ROLE_LABELS[u.normalizedRole]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {u.normalizedRole === 'super_admin' ? (
                    <span className="text-gray-500">Todos</span>
                  ) : Object.keys(u.modules).length === 0 ? (
                    <span className="text-gray-400">Ninguno</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(Object.entries(u.modules) as [AssignableModule, Access][]).map(([key, access]) => (
                        <Badge key={key} tone="gray">
                          {MODULE_BY_KEY.get(key)?.label} · {access === 'edit' ? 'Editar' : 'Ver'}
                        </Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {u.normalizedRole === 'super_admin' ? (
                    <span className="text-gray-500">Todas</span>
                  ) : u.areas.length ? (
                    u.areas.map((a) => a.name).join(', ')
                  ) : (
                    <span className="text-gray-400">Ninguna</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" onClick={() => openEdit(u)} disabled={!migrated} aria-label={`Editar ${u.email}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.id !== user?.id ? (
                      <Button variant="ghost" onClick={() => handleDelete(u)} aria-label={`Eliminar ${u.email}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  {search ? 'Ninguna cuenta coincide con la búsqueda.' : 'Aún no hay cuentas.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        onClose={closeModal}
        title={editing === 'new' ? 'Nueva cuenta' : 'Editar cuenta'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {formError ? <Alert tone="error">{formError}</Alert> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Nombre</span>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">Email</span>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">DNI (opcional)</span>
              <input className={inputClass} value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700">
                {editing === 'new' ? 'Contraseña' : 'Nueva contraseña (vacía = no cambiar)'}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Rol</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['admin', 'super_admin'] as Role[]).map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm ${
                    form.role === r ? 'border-brand-600 bg-brand-50' : 'border-gray-200'
                  } ${isSelf ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mt-0.5 accent-brand-700"
                    checked={form.role === r}
                    disabled={isSelf}
                    onChange={() => setForm({ ...form, role: r })}
                  />
                  <span>
                    <span className="block font-medium text-gray-900">{ROLE_LABELS[r]}</span>
                    <span className="text-gray-600">
                      {r === 'super_admin' ? 'Acceso total, incluida la gestión de usuarios.' : 'Solo los módulos y áreas que le asignes.'}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {isSelf ? <p className="mt-2 text-xs text-gray-500">No puedes cambiar tu propio rol.</p> : null}
          </fieldset>

          {form.role === 'admin' ? (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-gray-700">Módulos</legend>
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {ASSIGNABLE_MODULES.map((key) => {
                    const mod = MODULE_BY_KEY.get(key)!;
                    const current = form.modules[key] ?? 'none';
                    return (
                      <div key={key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mod.label}</div>
                          <div className="text-xs text-gray-500">{mod.description}</div>
                        </div>
                        <div className="inline-flex rounded-lg border border-gray-200 p-0.5" role="radiogroup" aria-label={mod.label}>
                          {ACCESS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="radio"
                              aria-checked={current === opt.value}
                              onClick={() => setModuleAccess(key, opt.value)}
                              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                current === opt.value ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 text-sm font-medium text-gray-700">Áreas</legend>
                <p className="mb-2 text-xs text-gray-500">En Reportes solo verá los reportes de estas áreas.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(data?.areas ?? []).map((area) => (
                    <label key={area.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-brand-700"
                        checked={form.areaIds.includes(area.id)}
                        onChange={() => toggleArea(area.id)}
                      />
                      {area.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default GestionUsuarios;
