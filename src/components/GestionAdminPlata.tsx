import React, { useState, useEffect } from 'react';
import {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  emailExists,
  type Admin
} from '../services/database/auth.service';
import { getAllAreasUnpaginated } from '../services/database/areas.service';
import type { Area } from '../lib/supabase';
import { UserPlus, Edit2, Trash2, X, Save, Shield, Mail, Lock, User, MapPin } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

interface AdminForm {
  email: string;
  password: string;
  name: string;
  area_id: number | null;
}

const GestionAdminPlata: React.FC = () => {
  const [adminsPlata, setAdminsPlata] = useState<Admin[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState<AdminForm>({
    email: '',
    password: '',
    name: '',
    area_id: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAdmins, allAreas] = await Promise.all([
        getAllAdmins(),
        getAllAreasUnpaginated()
      ]);

      // Filtrar solo Admin Plata
      const plataAdmins = allAdmins.filter(admin => admin.role === 'admin_plata');
      setAdminsPlata(plataAdmins);
      setAreas(allAreas);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingAdmin(null);
    setForm({
      email: '',
      password: '',
      name: '',
      area_id: null
    });
    setError('');
    setSuccess('');
  };

  const handleOpenEditModal = (admin: Admin) => {
    setModalMode('edit');
    setEditingAdmin(admin);
    setForm({
      email: admin.email,
      password: '', // No mostramos la contraseña existente por seguridad
      name: admin.name,
      area_id: admin.area_id || null
    });
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingAdmin(null);
    setForm({
      email: '',
      password: '',
      name: '',
      area_id: null
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!form.email.trim()) {
      setError('El email es obligatorio');
      return;
    }

    if (!form.email.includes('@')) {
      setError('El email no es válido');
      return;
    }

    if (!form.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (modalMode === 'create' && !form.password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (form.password && form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!form.area_id) {
      setError('Debes asignar un área');
      return;
    }

    setSaving(true);

    try {
      if (modalMode === 'create') {
        // Verificar que el email no exista
        const exists = await emailExists(form.email);
        if (exists) {
          setError('Ya existe un administrador con este email');
          setSaving(false);
          return;
        }

        // Crear nuevo Admin Plata
        await createAdmin({
          email: form.email,
          password: form.password,
          name: form.name,
          role: 'admin_plata',
          area_id: form.area_id
        });

        setSuccess('✅ Admin Plata creado exitosamente');
      } else if (modalMode === 'edit' && editingAdmin) {
        // Actualizar Admin Plata existente
        const updates: any = {
          email: form.email,
          name: form.name,
          area_id: form.area_id
        };

        // Solo actualizar password si se proporcionó uno nuevo
        if (form.password.trim()) {
          updates.password = form.password;
        }

        await updateAdmin(editingAdmin.id, updates);

        setSuccess('✅ Admin Plata actualizado exitosamente');
      }

      // Recargar datos
      await loadData();

      // Cerrar modal después de 1 segundo
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${admin.name}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteAdmin(admin.id);
      setSuccess('✅ Admin Plata eliminado exitosamente');
      await loadData();

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Shield className="w-8 h-8 text-gray-600" />
                Gestión de Admin Plata
              </h1>
              <p className="text-gray-600 mt-2">
                Administra los usuarios con rol de visualización
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg shadow-gray-600/30"
            >
              <UserPlus className="w-5 h-5" />
              Crear Admin Plata
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Lista de Admin Plata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Admin Plata Registrados ({adminsPlata.length})
            </h2>
          </div>

          {adminsPlata.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay Admin Plata registrados</p>
              <p className="text-gray-400 text-sm">Crea el primer Admin Plata para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Área Asignada
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {adminsPlata.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {admin.area ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-700 font-medium">{admin.area.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin área asignada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Crear/Editar */}
        {modalMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {modalMode === 'create' ? (
                    <>
                      <UserPlus className="w-6 h-6" />
                      Crear Admin Plata
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-6 h-6" />
                      Editar Admin Plata
                    </>
                  )}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                    disabled={saving}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                    disabled={saving}
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Contraseña {modalMode === 'edit' && '(dejar vacío para mantener la actual)'}
                    {modalMode === 'create' && ' *'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder={modalMode === 'edit' ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                    disabled={saving}
                  />
                </div>

                {/* Área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Área Asignada *
                  </label>
                  <select
                    value={form.area_id || ''}
                    onChange={(e) => setForm({ ...form, area_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    disabled={saving}
                  >
                    <option value="">Seleccionar área...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    El Admin Plata solo podrá ver reportes de esta área
                  </p>
                </div>

                {/* Mensajes de error en el modal */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={saving}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {modalMode === 'create' ? 'Crear' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionAdminPlata;
