import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy loading de las vistas para mejorar el rendimiento
const PublicView = lazy(() => import('../pages/PublicView'));
const VistaBlack = lazy(() => import('../pages/VistaBlack'));
const VistaOro = lazy(() => import('../pages/VistaOro'));
const VistaPlata = lazy(() => import('../pages/VistaPlata'));

/**
 * Componente de carga mientras se cargan las vistas
 */
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

/**
 * Configuración centralizada de rutas de la aplicación
 *
 * Implementa lazy loading para optimizar el tamaño del bundle inicial
 * y mejorar los tiempos de carga de la aplicación.
 *
 * Rutas públicas:
 * - / : Vista pública con áreas disponibles
 *
 * Rutas protegidas:
 * - /admin/black : Panel de administrador principal (solo admin_black)
 * - /admin/oro : Panel de administrador de área (solo admin_oro)
 * - /admin/plata : Panel de visualización (solo admin_plata)
 */
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Ruta pública - Vista principal */}
        <Route path="/" element={<PublicView />} />

        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin/black"
          element={
            <ProtectedRoute allowedRoles={['admin_black']}>
              <VistaBlack />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/oro"
          element={
            <ProtectedRoute allowedRoles={['admin_oro']}>
              <VistaOro />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/plata"
          element={
            <ProtectedRoute allowedRoles={['admin_plata']}>
              <VistaPlata />
            </ProtectedRoute>
          }
        />

        {/* Ruta 404 - Redirigir a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
