import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Edit2, Trash2, X, Save, Shield, Mail, User, MapPin, Key } from 'lucide-react';

interface AdminOro {
  id: number;
  email: string;
  name: string | null;
  dni: string | null;
  area_id: number | null;
  areas?: Area[];
  created_at: string;
}

interface Area {
  id: number;
  name: string;
}

type ModalMode = 'create' | 'edit' | 'resetPassword' | null;

const GestionAdminOro: React.FC = () => {
  const [admins, setAdmins] = useState<AdminOro[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminOro | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    password: '',
    area_ids: [] as number[]
  });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadAdmins(), loadAreas()]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user')
        .select('*')
        .eq('role', 'admin_oro')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const adminsConAreas = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: userAreasData } = await supabase
            .from('user_areas')
            .select('area_id')
            .eq('user_id', admin.id);

          if (userAreasData && userAreasData.length > 0) {
            const areaIds = userAreasData.map(ua => ua.area_id);
            const { data: areasData } = await supabase
              .from('areas')
              .select('id, name')
              .in('id', areaIds);

            return { ...admin, areas: areasData || [] };
          }
          return { ...admin, areas: [] };
        })
      );

      setAdmins(adminsConAreas);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      setError('Error al cargar administradores');
    }
  };

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      dni: '',
      password: '',
      area_ids: []
    });
    setError('');
    setSuccess('');
  };

  const handleOpenEditModal = (admin: AdminOro) => {
    setModalMode('edit');
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email,
      dni: admin.dni || '',
      password: '',
      area_ids: admin.areas?.map(a => a.id) || []
    });
    setError('');
    setSuccess('');
  };

  const handleOpenResetPasswordModal = (admin: AdminOro) => {
    setModalMode('resetPassword');
    setEditingAdmin(admin);
    setNewPassword(admin.dni || '');
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', dni: '', password: '', area_ids: [] });
    setNewPassword('');
    setError('');
    setSuccess('');
  };

  const handleAreaToggle = (areaId: number) => {
    setFormData(prev => {
      const isSelected = prev.area_ids.includes(areaId);
      return {
        ...prev,
        area_ids: isSelected
          ? prev.area_ids.filter(id => id !== areaId)
          : [...prev.area_ids, areaId]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('El email es obligatorio y debe ser válido');
      return;
    }

    if (!formData.dni.trim()) {
      setError('El DNI es obligatorio');
      return;
    }

    if (modalMode === 'create' && !formData.password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.area_ids.length === 0) {
      setError('Debes asignar al menos un área');
      return;
    }

    setSaving(true);

    try {
      const adminData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        dni: formData.dni.trim(),
        role: 'admin_oro'
      };

      let userId: number;

      if (modalMode === 'edit' && editingAdmin) {
        if (formData.password.trim()) {
          adminData.password = formData.password.trim();
        }

        const { error } = await supabase
          .from('admin_user')
          .update(adminData)
          .eq('id', editingAdmin.id);

        if (error) throw error;
        userId = editingAdmin.id;

        await supabase
          .from('user_areas')
          .delete()
          .eq('user_id', userId);

        setSuccess('✅ Administrador actualizado correctamente');
      } else {
        adminData.password = formData.password.trim();

        const { data, error } = await supabase
          .from('admin_user')
          .insert([adminData])
          .select()
          .single();

        if (error) throw error;
        userId = data.id;
        setSuccess('✅ Administrador creado correctamente');
      }

      const userAreasData = formData.area_ids.map(areaId => ({
        user_id: userId,
        area_id: areaId
      }));

      const { error: areasError } = await supabase
        .from('user_areas')
        .insert(userAreasData);

      if (areasError) throw areasError;

      await loadAdmins();

      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (newPassword.trim().length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!editingAdmin) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('admin_user')
        .update({ password: newPassword.trim() })
        .eq('id', editingAdmin.id);

      if (error) throw error;

      setSuccess('✅ Contraseña actualizada correctamente');

      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Error al actualizar contraseña: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: AdminOro) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${admin.name}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_user')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      setSuccess('✅ Administrador eliminado correctamente');
      await loadAdmins();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Error al eliminar: ' + (error.message || 'Error desconocido'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
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
                <Shield className="w-8 h-8 text-yellow-600" />
                Gestión de Admin Oro
              </h1>
              <p className="text-gray-600 mt-2">
                Administradores con acceso a áreas específicas
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-600/30"
            >
              <UserPlus className="w-5 h-5" />
              Crear Admin Oro
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

        {/* Lista de Admin Oro */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Admin Oro Registrados ({admins.length})
            </h2>
          </div>

          {admins.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay Admin Oro registrados</p>
              <p className="text-gray-400 text-sm">Crea el primer Admin Oro para empezar</p>
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
                      DNI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Áreas Asignadas
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
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-yellow-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {admin.name?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{admin.name || 'Sin nombre'}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                        {admin.dni || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.areas && admin.areas.length > 0 ? (
                            admin.areas.map((area) => (
                              <span
                                key={area.id}
                                className="inline-flex items-center bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium border border-yellow-200"
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                {area.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic text-sm">Sin áreas</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                        {formatDate(admin.created_at)}
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
                            onClick={() => handleOpenResetPasswordModal(admin)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Resetear Contraseña"
                          >
                            <Key className="w-5 h-5" />
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
        {(modalMode === 'create' || modalMode === 'edit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  {modalMode === 'create' ? (
                    <>
                      <UserPlus className="w-6 h-6" />
                      Crear Admin Oro
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-6 h-6" />
                      Editar Admin Oro
                    </>
                  )}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-yellow-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                    disabled={saving}
                  />
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="12345678"
                    disabled={saving}
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {modalMode === 'edit' && '(dejar vacío para mantener la actual)'}
                    {modalMode === 'create' && ' *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder={modalMode === 'edit' ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'}
                    disabled={saving}
                  />
                </div>

                {/* Áreas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Áreas Asignadas * (puede seleccionar múltiples)
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {areas.map((area) => (
                      <label
                        key={area.id}
                        className="flex items-center gap-2 p-2 hover:bg-yellow-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.area_ids.includes(area.id)}
                          onChange={() => handleAreaToggle(area.id)}
                          disabled={saving}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-gray-700">{area.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccionadas: {formData.area_ids.length}
                  </p>
                </div>

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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {modalMode === 'create' ? 'Crear' : 'Guardar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Resetear Contraseña */}
        {modalMode === 'resetPassword' && editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Key className="w-6 h-6" />
                  Resetear Contraseña
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                <div>
                  <p className="text-gray-700 mb-4">
                    Reseteando contraseña para: <strong>{editingAdmin.name}</strong>
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Por defecto se usa el DNI como contraseña
                  </p>
                </div>

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
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Actualizar
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

export default GestionAdminOro;
