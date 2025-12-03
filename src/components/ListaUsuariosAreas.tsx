import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Area {
  id: number;
  name: string;
}

interface Usuario {
  id: number;
  email: string;
  name: string | null;
  dni: string | null;
  role: string;
  areas: Area[];
  created_at: string;
}

type ViewMode = 'all' | 'admin_oro' | 'admin_plata';

const ListaUsuariosAreas: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, [viewMode]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_user')
        .select('*')
        .order('name', { ascending: true });

      // Filtrar por rol si no es 'all'
      if (viewMode !== 'all') {
        query = query.eq('role', viewMode);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cargar las áreas asignadas a cada usuario
      const usuariosConAreas = await Promise.all(
        (data || []).map(async (usuario) => {
          let areas: Area[] = [];

          // Admin Plata y Admin Oro usan area_id directamente
          if ((usuario.role === 'admin_plata' || usuario.role === 'admin_oro') && usuario.area_id) {
            const { data: areaData } = await supabase
              .from('areas')
              .select('id, name')
              .eq('id', usuario.area_id)
              .single();

            if (areaData) {
              areas = [areaData];
            }
          }
          // Otros roles pueden tener múltiples áreas en user_areas
          else {
            const { data: userAreasData } = await supabase
              .from('user_areas')
              .select('area_id')
              .eq('user_id', usuario.id);

            if (userAreasData && userAreasData.length > 0) {
              const areaIds = userAreasData.map(ua => ua.area_id);
              const { data: areasData } = await supabase
                .from('areas')
                .select('id, name')
                .in('id', areaIds);

              areas = areasData || [];
            }
          }

          return { ...usuario, areas };
        })
      );

      setUsuarios(usuariosConAreas);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin_black':
        return 'bg-black text-yellow-500 border border-yellow-500';
      case 'admin_oro':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md';
      case 'admin_plata':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin_black':
        return 'Admin Black';
      case 'admin_oro':
        return 'Admin Oro';
      case 'admin_plata':
        return 'Admin Plata';
      default:
        return role;
    }
  };

  // Filtrar usuarios por término de búsqueda
  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.name?.toLowerCase().includes(searchLower) ||
      usuario.email.toLowerCase().includes(searchLower) ||
      usuario.dni?.toLowerCase().includes(searchLower) ||
      usuario.areas.some(area => area.name.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">Lista de Usuarios y Áreas</h2>
        <p className="text-gray-600 mt-2">
          Visualiza todos los usuarios y sus áreas asignadas
        </p>
      </div>

      {/* Pestañas de filtro */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setViewMode('all')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
              : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
          }`}
        >
          Todos ({usuarios.length})
        </button>
        <button
          onClick={() => setViewMode('admin_oro')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
            viewMode === 'admin_oro'
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-105'
              : 'bg-white text-gray-700 hover:bg-yellow-50 border border-gray-200'
          }`}
        >
          Admin Oro
        </button>
        <button
          onClick={() => setViewMode('admin_plata')}
          className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
            viewMode === 'admin_plata'
              ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/30 scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Admin Plata
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email, DNI o área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Lista de usuarios */}
      {filteredUsuarios.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Áreas Asignadas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {usuario.name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 font-medium">
                        {usuario.dni || <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(usuario.role)}`}>
                        {getRoleLabel(usuario.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {usuario.areas.length > 0 ? (
                          usuario.areas.map((area) => {
                            // Color del badge según el rol
                            const areaBadgeColor = usuario.role === 'admin_oro'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : usuario.role === 'admin_plata'
                              ? 'bg-gray-100 text-gray-700 border border-gray-300'
                              : 'bg-blue-100 text-blue-700 border border-blue-200';

                            return (
                              <span
                                key={area.id}
                                className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${areaBadgeColor}`}
                              >
                                {area.name}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-sm italic">Sin áreas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(usuario.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700">
              Mostrando <span className="text-blue-600 font-bold">{filteredUsuarios.length}</span> de{' '}
              <span className="text-blue-600 font-bold">{usuarios.length}</span> usuarios
            </p>
          </div>
          <button
            onClick={loadUsuarios}
            className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all border border-blue-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListaUsuariosAreas;
