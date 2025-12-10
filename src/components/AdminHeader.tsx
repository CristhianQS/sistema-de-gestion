import React from 'react';
import NotificationBell from './notifications/NotificationBell';
import { useAuth } from '../context/AuthContext';

interface AdminHeaderProps {
  onBack?: () => void;
  showBackButton?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBack, showBackButton = false }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="shadow-lg" style={{ backgroundColor: '#000000ff' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">Panel Admin Black</h1>
              <p className="text-sm text-gray-300">{user?.name || user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Campana de notificaciones */}
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
    </>
  );
};

export default AdminHeader;
