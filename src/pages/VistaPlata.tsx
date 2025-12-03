import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAreaById } from '../services/database/areas.service';
import { getSubmissionsByArea } from '../services/database/submissions.service';
import { getAllStudents } from '../services/database/students.service';
import type { Area, AreaSubmission, DataAlumno } from '../lib/supabase';

type ViewMode = 'dashboard' | 'area' | 'reportes' | 'estudiantes';

const VistaPlata: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [area, setArea] = useState<Area | null>(null);
  const [reportes, setReportes] = useState<AreaSubmission[]>([]);
  const [estudiantes, setEstudiantes] = useState<DataAlumno[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos según la vista
  useEffect(() => {
    if (user?.area_id) {
      loadAreaData();
    }
  }, [user]);

  const loadAreaData = async () => {
    if (!user?.area_id) return;

    try {
      const areaData = await getAreaById(user.area_id);
      setArea(areaData);
    } catch (error) {
      console.error('Error al cargar área:', error);
    }
  };

  const loadReportes = async () => {
    if (!user?.area_id) return;

    setLoading(true);
    try {
      const data = await getSubmissionsByArea(user.area_id);
      setReportes(data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstudiantes = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vista de Área
  if (currentView === 'area') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel de Visualización</h1>
                <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {area ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{area.name}</h2>
                    <p className="text-gray-600">{area.description || 'Sin descripción'}</p>
                  </div>
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    🔒 Solo Lectura
                  </span>
                </div>

                {area.image_url && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img
                      src={area.image_url}
                      alt={area.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Información del Área</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Esta es el área asignada a tu cuenta. Puedes ver la información pero no modificarla.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <p className="text-gray-600">No tienes un área asignada</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Vista de Reportes
  if (currentView === 'reportes') {
    useEffect(() => {
      loadReportes();
    }, []);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel de Visualización</h1>
                <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Reportes del Área</h2>
              <p className="text-gray-600 mt-1">Vista de solo lectura</p>
            </div>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              🔒 Solo Lectura
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-600">Cargando reportes...</div>
            </div>
          ) : reportes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No hay reportes en este momento</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reportes.map((reporte) => (
                <div key={reporte.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">Ticket #{reporte.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          reporte.status === 'completed' ? 'bg-green-100 text-green-700' :
                          reporte.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reporte.status === 'completed' ? 'Completado' :
                           reporte.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                        </span>
                        {reporte.form_data?.ia_metadata?.ia_enabled && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold">
                            🤖 IA
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Estudiante: {reporte.alumno_nombre}</p>
                      <p className="text-sm text-gray-600">Código: {reporte.alumno_codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(reporte.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {reporte.form_data?.descripcion && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                      <p className="text-sm text-gray-600">{reporte.form_data.descripcion}</p>
                    </div>
                  )}

                  {reporte.form_data?.ubicacion && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {reporte.form_data.ubicacion}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Mostrando {reportes.length} reportes</p>
                <p className="text-sm text-blue-700 mt-1">
                  Solo puedes visualizar los reportes del área asignada. No tienes permisos para modificar o eliminar.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Vista de Estudiantes
  if (currentView === 'estudiantes') {
    useEffect(() => {
      loadEstudiantes();
    }, []);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel de Visualización</h1>
                <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Datos de Estudiantes</h2>
              <p className="text-gray-600 mt-1">Vista de solo lectura</p>
            </div>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              🔒 Solo Lectura
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-gray-600">Cargando estudiantes...</div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          DNI
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {estudiantes.map((estudiante) => (
                        <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-gray-800">
                              {estudiante.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-800">
                              {estudiante.estudiante || 'Sin nombre'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-600">
                              {estudiante.dni || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">
                              {estudiante.created_at ? new Date(estudiante.created_at).toLocaleDateString('es-ES') : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Total de estudiantes: {estudiantes.length}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Esta información es solo para consulta. No puedes modificar los datos de los estudiantes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">◇</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Panel de Visualización</h1>
              <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido, Visualizador</h2>
          <p className="text-gray-600">Solo tienes acceso de lectura</p>
          {area && (
            <p className="text-sm text-gray-500 mt-1">Área asignada: <span className="font-semibold text-gray-700">{area.name}</span></p>
          )}
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Ver Área */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200">
            <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Mi Área</h3>
            <p className="text-gray-600 mb-4 text-sm">Consultar información del área asignada</p>
            <button
              onClick={() => setCurrentView('area')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Ver Información
            </button>
          </div>

          {/* Card: Reportes */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Reportes</h3>
            <p className="text-gray-600 mb-4 text-sm">Consultar reportes y estadísticas (solo lectura)</p>
            <button
              onClick={() => setCurrentView('reportes')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Ver Reportes
            </button>
          </div>

          {/* Card: Datos de Alumnos */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Datos de Alumnos</h3>
            <p className="text-gray-600 mb-4 text-sm">Consultar información de estudiantes (solo lectura)</p>
            <button
              onClick={() => setCurrentView('estudiantes')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Ver Datos
            </button>
          </div>

          {/* Mensaje informativo */}
          <div className="col-span-full bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Acceso de Solo Lectura</h3>
                <p className="text-sm text-yellow-700">
                  Tu cuenta tiene permisos de visualización únicamente. No puedes modificar, crear o eliminar información.
                  Si necesitas permisos adicionales, contacta con tu administrador de área.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VistaPlata;
