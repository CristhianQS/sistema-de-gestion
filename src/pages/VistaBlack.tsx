import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GestionAreas from '../components/GestionAreas';
import GestionPabellones from '../components/GestionPabellones';
import VisualizarReportes from '../components/VisualizarReportes';
import GestionAdminOro from '../components/GestionAdminOro';
import GestionAdminPlata from '../components/GestionAdminPlata';
import ListaUsuariosAreas from '../components/ListaUsuariosAreas';
import GestionDatosAlumnos from '../components/GestionDatosAlumnos';
import GestionDocentes from '../components/GestionDocentes';
import AdminHeader from '../components/AdminHeader';
import NotificationBell from '../components/notifications/NotificationBell';
import NotificationPermissionBanner from '../components/notifications/NotificationPermissionBanner';

const VistaBlack: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'dashboard' | 'areas' | 'pabellones' | 'reportes' | 'admin_oro' | 'admin_plata' | 'lista_usuarios' | 'datos_alumnos' | 'datos_docentes'>('dashboard');

  // Vista de Admin Oro
  if (currentView === 'admin_oro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionAdminOro />
        </main>
      </div>
    );
  }

  // Vista de Admin Plata
  if (currentView === 'admin_plata') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionAdminPlata />
        </main>
      </div>
    );
  }

  // Vista de Reportes
  if (currentView === 'reportes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <VisualizarReportes />
        </main>
      </div>
    );
  }

  // Vista de Pabellones
  if (currentView === 'pabellones') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionPabellones />
        </main>
      </div>
    );
  }

  // Vista de Áreas
  if (currentView === 'areas') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionAreas />
        </main>
      </div>
    );
  }

  // Vista de Lista de Usuarios y Áreas
  if (currentView === 'lista_usuarios') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <ListaUsuariosAreas />
        </main>
      </div>
    );
  }

  // Vista de Datos de Alumnos
  if (currentView === 'datos_alumnos') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionDatosAlumnos />
        </main>
      </div>
    );
  }

  // Vista de Datos de Docentes
  if (currentView === 'datos_docentes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NotificationPermissionBanner />
        <AdminHeader showBackButton onBack={() => setCurrentView('dashboard')} />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <GestionDocentes />
        </main>
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gray-100">
      <NotificationPermissionBanner />
      {/* Header con color azul UPEU */}
      <header className="shadow-lg" style={{ backgroundColor: '#000000ff' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">★</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel Admin Black</h1>
              <p className="text-sm text-gray-300">Admin Black</p>
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

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido, Administrador Principal</h2>
          <p className="text-gray-600">Control total del sistema</p>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Gestionar Áreas */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-yellow-500 transition-all">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestionar Áreas</h3>
            <p className="text-gray-600 mb-4">Crear y configurar áreas del sistema</p>
            <button
              onClick={() => setCurrentView('areas')}
              className="w-full bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
            >
              Administrar
            </button>
          </div>

          {/* Card: Gestionar Admin Oro */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-yellow-500 transition-all">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Admin Oro</h3>
            <p className="text-gray-600 mb-4">Gestionar administradores de área</p>
            <button
              onClick={() => setCurrentView('admin_oro')}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Administrar
            </button>
          </div>

          {/* Card: Gestionar Admin Plata */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-gray-500 transition-all">
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Admin Plata</h3>
            <p className="text-gray-600 mb-4">Gestionar usuarios con acceso de solo lectura</p>
            <button
              onClick={() => setCurrentView('admin_plata')}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Administrar
            </button>
          </div>

          {/* Card: Reportes */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-blue-500 transition-all">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Reportes</h3>
            <p className="text-gray-600 mb-4">Ver estadísticas y análisis del sistema</p>
            <button
              onClick={() => setCurrentView('reportes')}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors font-medium"
            >
              Ver Reportes
            </button>
          </div>

          {/* Card: Pabellones y Salones */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-purple-500 transition-all">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pabellones y Salones</h3>
            <p className="text-gray-600 mb-4">Gestionar infraestructura del campus</p>
            <button
              onClick={() => setCurrentView('pabellones')}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-400 transition-colors font-medium"
            >
              Gestionar
            </button>
          </div>

          {/* Card: Datos Alumnos */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-green-500 transition-all">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Datos Alumnos</h3>
            <p className="text-gray-600 mb-4">Ver y gestionar información de estudiantes</p>
            <button
              onClick={() => setCurrentView('datos_alumnos')}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-medium"
            >
              Ver Datos
            </button>
          </div>

          {/* Card: Datos Docentes */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-teal-500 transition-all">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Datos Docentes</h3>
            <p className="text-gray-600 mb-4">Ver y gestionar información de docentes</p>
            <button
              onClick={() => setCurrentView('datos_docentes')}
              className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-400 transition-colors font-medium"
            >
              Ver Datos
            </button>
          </div>

          {/* Card: Lista de Usuarios y Áreas */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-indigo-500 transition-all">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Lista de Usuarios</h3>
            <p className="text-gray-600 mb-4">Ver todos los usuarios y sus áreas asignadas</p>
            <button
              onClick={() => setCurrentView('lista_usuarios')}
              className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-400 transition-colors font-medium"
            >
              Ver Lista
            </button>
          </div>

          {/* Card: Configuración del Chatbot */}
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 hover:border-pink-500 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              Configuración Chatbot
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                🤖 IA
              </span>
            </h3>
            <p className="text-gray-600 mb-4">Personalizar prompts y mensajes del asistente</p>
            <button
              onClick={() => navigate('/admin/chatbot-config')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium shadow-md"
            >
              Configurar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VistaBlack;