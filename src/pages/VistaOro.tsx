import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VisualizarReportesOro from '../components/VisualizarReportesOro';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationPermissionBanner from '../components/notifications/NotificationPermissionBanner';

const VistaOro: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'mi_area'>('dashboard');

  // Vista de Mi Área (Reportes)
  if (currentView === 'mi_area') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        <NotificationPermissionBanner />
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
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">◆</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel Admin Oro</h1>
                <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user?.email && <NotificationBell userEmail={user.email} />}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <VisualizarReportesOro />
        </main>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <NotificationPermissionBanner />
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">◆</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Panel Admin Oro</h1>
              <p className="text-sm text-gray-600">{user?.name || user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user?.email && <NotificationBell userEmail={user.email} />}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido, Administrador de Área</h2>
          <p className="text-gray-600">Gestiona tu área asignada y usuarios con acceso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Mi Área */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-yellow-500 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mi Área</h3>
            <p className="text-gray-600 mb-4">Ver reportes y gestionar información del área asignada</p>
            <button
              onClick={() => setCurrentView('mi_area')}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              Gestionar
            </button>
          </div>

          {/* Card: Admin Plata */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Usuarios Plata</h3>
            <p className="text-gray-600 mb-4">Dar acceso de lectura a usuarios de tu área</p>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium">
              Administrar
            </button>
          </div>

          {/* Card: Reportes del Área */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Reportes</h3>
            <p className="text-gray-600 mb-4">Estadísticas y análisis de tu área</p>
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
            <h3 className="text-xl font-bold text-gray-800 mb-2">Datos de Alumnos</h3>
            <p className="text-gray-600 mb-4">Ver información de estudiantes del área</p>
            <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium">
              Ver Datos
            </button>
          </div>

          {/* Card: Configuración */}
          <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mi Perfil</h3>
            <p className="text-gray-600 mb-4">Configuración de cuenta y preferencias</p>
            <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium">
              Configurar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VistaOro;