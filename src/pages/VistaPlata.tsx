import React from 'react';
import { useAuth } from '../context/AuthContext';

const VistaPlata: React.FC = () => {
  const { user, logout } = useAuth();

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
          <p className="text-gray-600">Solo tienes acceso de lectura al área asignada</p>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Ver Área */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Mi Área</h3>
            <p className="text-gray-600 mb-4">Consultar información del área asignada</p>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Ver Información
            </button>
          </div>

          {/* Card: Reportes */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Reportes</h3>
            <p className="text-gray-600 mb-4">Consultar reportes y estadísticas (solo lectura)</p>
            <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Ver Reportes
            </button>
          </div>

          {/* Card: Datos de Alumnos */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ver Datos de Alumnos</h3>
            <p className="text-gray-600 mb-4">Consultar información de estudiantes (solo lectura)</p>
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
              Ver Datos
            </button>
          </div>

          {/* Mensaje informativo */}
          <div className="col-span-full bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
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