import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin_black' | 'admin_oro' | 'admin_plata'>;
}

/**
 * Componente de ruta protegida que verifica autenticación y roles
 * Redirige a la vista pública si no hay usuario autenticado
 * Redirige a la ruta correcta si el rol no coincide
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // Si no hay usuario, redirigir a la vista pública
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si hay roles permitidos especificados, verificar que el usuario tenga uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirigir a la ruta correcta según el rol del usuario
      switch (user.role) {
        case 'admin_black':
          return <Navigate to="/admin/black" replace />;
        case 'admin_oro':
          return <Navigate to="/admin/oro" replace />;
        case 'admin_plata':
          return <Navigate to="/admin/plata" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
  }

  // Usuario autenticado y con rol correcto
  return <>{children}</>;
};

export default ProtectedRoute;
