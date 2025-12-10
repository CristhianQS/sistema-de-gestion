import React from 'react';
import type { Notification } from '../../services/database/notifications.service';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete
}) => {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-lg font-medium">No hay notificaciones</p>
        <p className="text-sm mt-1">Cuando recibas notificaciones aparecerán aquí</p>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_report':
        return '📝';
      case 'status_change':
        return '🔄';
      case 'comment':
        return '💬';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Hace un momento';
    }
  };

  return (
    <div className="overflow-y-auto max-h-[500px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            !notification.read ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            {/* Icono */}
            <div className="text-2xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium text-gray-900 ${
                      !notification.read ? 'font-semibold' : ''
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                  {/* Información adicional */}
                  {notification.area_name && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Área:</span> {notification.area_name}
                    </p>
                  )}

                  {notification.alumno_nombre && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Estudiante:</span>{' '}
                      {notification.alumno_nombre}
                      {notification.alumno_codigo && ` (${notification.alumno_codigo})`}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">{formatDate(notification.created_at)}</p>
                </div>

                {/* Botones de acción */}
                <div className="ml-3 flex-shrink-0 flex space-x-1">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded"
                      title="Marcar como leída"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(notification.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded"
                    title="Eliminar"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Indicador de no leída */}
              {!notification.read && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-blue-600 font-medium">Nueva</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
