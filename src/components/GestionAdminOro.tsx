import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminOro {
  id: number;
  email: string;
  name: string | null;
  dni: string | null; // ⬅️ AGREGADO
  area_id: number | null;
  area_nombre?: string;
  created_at: string;
}

interface Area {
  id: number;
  name: string;
}

const GestionAdminOro: React.FC = () => {
  const [admins, setAdmins] = useState<AdminOro[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminOro | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '', // ⬅️ AGREGADO
    password: '',
    area_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadAdmins(), loadAreas()]);
    setLoading(false);
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user')
        .select('*')
        .eq('role', 'admin_oro')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const adminsConArea = await Promise.all(
        (data || []).map(async (admin) => {
          if (admin.area_id) {
            const { data: areaData } = await supabase
              .from('areas')
              .select('name')
              .eq('id', admin.area_id)
              .single();
            
            return { ...admin, area_nombre: areaData?.name || 'Sin área' };
          }
          return { ...admin, area_nombre: 'Sin área asignada' };
        })
      );

      setAdmins(adminsConArea);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
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

  const handleOpenModal = (admin?: AdminOro) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name || '',
        email: admin.email,
        dni: admin.dni || '', // ⬅️ AGREGADO
        password: '',
        area_id: admin.area_id?.toString() || ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        dni: '', // ⬅️ AGREGADO
        password: '',
        area_id: ''
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
    setFormData({ name: '', email: '', dni: '', password: '', area_id: '' });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!formData.dni.trim()) {
      setError('El DNI es requerido');
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    if (!formData.area_id) {
      setError('Debes asignar un área');
      return;
    }

    try {
      const adminData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        dni: formData.dni.trim(), // ⬅️ AGREGADO
        area_id: parseInt(formData.area_id),
        role: 'admin_oro'
      };

      if (editingAdmin) {
        if (formData.password.trim()) {
          adminData.password = formData.password.trim();
        }

        const { error } = await supabase
          .from('admin_user')
          .update(adminData)
          .eq('id', editingAdmin.id);

        if (error) throw error;
        setSuccess('Administrador actualizado correctamente');
      } else {
        adminData.password = formData.password.trim();

        const { error } = await supabase
          .from('admin_user')
          .insert([adminData]);

        if (error) throw error;
        setSuccess('Administrador creado correctamente');
      }

      await loadAdmins();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar el administrador');
    }
  };

  const handleDelete = async (admin: AdminOro) => {
    if (!window.confirm(`¿Eliminar al administrador "${admin.name || admin.email}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_user')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;
      
      setSuccess('Administrador eliminado correctamente');
      await loadAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el administrador');
      setTimeout(() => setError(''), 3000);
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
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Cargando administradores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Administradores Oro</h2>
          <p className="text-gray-400 mt-1">
            Administradores con acceso a áreas específicas ({admins.length})
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Admin Oro</span>
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de Administradores */}
      {admins.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay administradores Oro</h3>
          <p className="text-gray-500">Crea el primer administrador para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-yellow-600 transition-all"
            >
              {/* Header del card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{admin.name || 'Sin nombre'}</h3>
                    <p className="text-xs text-gray-400">{admin.email}</p>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="space-y-2 mb-4">
                {/* DNI - AGREGADO */}
                <div className="bg-gray-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">DNI</p>
                  <p className="text-sm text-white font-medium">{admin.dni || 'No especificado'}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">Área Asignada</p>
                  <p className="text-sm text-white font-medium">{admin.area_nombre}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">Fecha de Creación</p>
                  <p className="text-sm text-white">{formatDate(admin.created_at)}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(admin)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(admin)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingAdmin ? 'Editar Admin Oro' : 'Nuevo Admin Oro'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-white"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                {/* CAMPO DNI - AGREGADO */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    DNI *
                  </label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-white"
                    placeholder="12345678"
                    required
                    maxLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-white"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña {editingAdmin ? '(dejar en blanco para no cambiar)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-white"
                    placeholder="••••••••"
                    required={!editingAdmin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Área Asignada *
                  </label>
                  <select
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-white"
                    required
                  >
                    <option value="">Selecciona un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Este administrador solo tendrá acceso al área seleccionada
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    {editingAdmin ? 'Actualizar' : 'Crear Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAdminOro;