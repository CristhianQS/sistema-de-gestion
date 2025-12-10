import { useState, useEffect, useCallback } from 'react';
import * as notificationsService from '../services/database/notifications.service';
import type { Notification } from '../services/database/notifications.service';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook personalizado para gestionar notificaciones
 * @param userEmail - Email del usuario actual
 */
export function useNotifications(userEmail: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!userEmail) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [allNotifications, count] = await Promise.all([
        notificationsService.getNotifications(userEmail),
        notificationsService.getUnreadCount(userEmail)
      ]);

      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error al cargar notificaciones:', err);
      setError(err.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Marcar como leída
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsService.markAsRead(id);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Mostrar notificación push si está soportado
      if ('Notification' in window && Notification.permission === 'granted') {
        // No mostrar notificación push al marcar como leída
      }
    } catch (err: any) {
      console.error('Error al marcar como leída:', err);
      setError(err.message);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!userEmail) return;

    try {
      await notificationsService.markAllAsRead(userEmail);

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error al marcar todas como leídas:', err);
      setError(err.message);
    }
  }, [userEmail]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsService.deleteNotification(id);

      // Actualizar estado local
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Error al eliminar notificación:', err);
      setError(err.message);
    }
  }, [notifications]);

  // Refresh manual
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Cargar notificaciones al montar
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!userEmail) return;

    const unsubscribe = notificationsService.subscribeToNotifications(
      userEmail,
      (newNotification) => {
        // Agregar nueva notificación al inicio
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Mostrar notificación push del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: `notification-${newNotification.id}`,
            requireInteraction: false,
            silent: false
          });
        }

        // Reproducir sonido (opcional)
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {
            // Ignorar si no se puede reproducir
          });
        } catch (err) {
          // Ignorar error de audio
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userEmail]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}
