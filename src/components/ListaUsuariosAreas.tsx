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

            return { ...usuario, areas: areasData || [] };
          }
          return { ...usuario, areas: [] };
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
        return 'bg-yellow-600 text-white';
      case 'admin_plata':
        return 'bg-gray-400 text-white';
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
        <div className="text-gray-400">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Lista de Usuarios y Áreas</h2>
        <p className="text-gray-400 mt-1">
          Visualiza todos los usuarios y sus áreas asignadas
        </p>
      </div>

      {/* Pestañas de filtro */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Todos ({usuarios.length})
        </button>
        <button
          onClick={() => setViewMode('admin_oro')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'admin_oro'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Admin Oro
        </button>
        <button
          onClick={() => setViewMode('admin_plata')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'admin_plata'
              ? 'bg-gray-400 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Admin Plata
        </button>
      </div>

      {/* Búsqueda */}
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre, email, DNI o área..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>

      {/* Lista de usuarios */}
      {filteredUsuarios.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Áreas Asignadas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">
                          {usuario.name || 'Sin nombre'}
                        </div>
                        <div className="text-sm text-gray-400">{usuario.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {usuario.dni || <span className="text-gray-500">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(usuario.role)}`}>
                        {getRoleLabel(usuario.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {usuario.areas.length > 0 ? (
                          usuario.areas.map((area) => (
                            <span
                              key={area.id}
                              className="inline-block bg-blue-600 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded"
                            >
                              {area.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">Sin áreas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">
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
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Mostrando <span className="text-white font-medium">{filteredUsuarios.length}</span> de{' '}
            <span className="text-white font-medium">{usuarios.length}</span> usuarios
          </p>
          <button
            onClick={loadUsuarios}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium flex items-center space-x-1"
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
