import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import { Spinner } from '../components/ui';

// Lazy loading de las vistas para reducir el bundle inicial
const PublicView = lazy(() => import('../pages/PublicView'));
const AdminLayout = lazy(() => import('../features/admin/AdminLayout'));
const AdminHome = lazy(() => import('../features/admin/AdminHome'));
const ModulePage = lazy(() => import('../features/admin/ModulePage'));

/**
 * Rutas:
 * - /                 Vista pública (alumnos y docentes reportan desde aquí)
 * - /admin            Inicio del panel (módulos permitidos)
 * - /admin/:module    Un módulo; ModulePage valida el permiso
 */
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<PublicView />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path=":moduleKey" element={<ModulePage />} />
        </Route>

        {/* Rutas antiguas por rol → panel único */}
        <Route path="/admin/black" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/oro" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/plata" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/chatbot-config" element={<Navigate to="/admin/chatbot" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
