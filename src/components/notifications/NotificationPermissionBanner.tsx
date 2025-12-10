import React, { useState, useEffect } from 'react';
import * as browserNotifications from '../../utils/browserNotifications';

const NotificationPermissionBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    // Verificar si necesitamos mostrar el banner
    const checkPermission = () => {
      if (!browserNotifications.isSupported()) {
        return;
      }

      const permission = browserNotifications.getPermissionStatus();

      // Mostrar solo si el permiso es "default" (no se ha preguntado aún)
      if (permission === 'default') {
        // Esperar 2 segundos antes de mostrar para no ser invasivo
        setTimeout(() => {
          setShow(true);
        }, 2000);
      }
    };

    checkPermission();
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);

    const granted = await browserNotifications.requestPermission();

    if (granted) {
      console.log('✅ Permisos de notificaciones concedidos');

      // Mostrar notificación de prueba
      browserNotifications.showNotification('¡Notificaciones Activadas!', {
        body: 'Ahora recibirás notificaciones de nuevos reportes.',
        icon: '/logo.png'
      });
    } else {
      console.log('❌ Permisos de notificaciones denegados');
    }

    setRequesting(false);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slideInRight">
      <div className="flex items-start space-x-3">
        {/* Icono de campana */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Activar Notificaciones
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Recibe alertas en tiempo real cuando haya nuevos reportes o actualizaciones.
          </p>

          {/* Botones */}
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleRequestPermission}
              disabled={requesting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requesting ? 'Solicitando...' : 'Activar'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Ahora no
            </button>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
