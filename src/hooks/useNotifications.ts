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
 * Reproduce un sonido de notificación usando Web Audio API
 */
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Crear oscilador para el sonido
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar sonido: dos tonos cortos (ding-ding)
    oscillator.frequency.value = 800; // Frecuencia en Hz
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Segundo tono
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);

    oscillator2.frequency.value = 1000;
    gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

    oscillator2.start(audioContext.currentTime + 0.15);
    oscillator2.stop(audioContext.currentTime + 0.25);
  } catch (err) {
    // Si falla, intentar con un beep simple del navegador
    console.log('🔔 Nueva notificación!');
  }
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
          const notification = new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: `notification-${newNotification.id}`,
            requireInteraction: false,
            silent: false
          });

          // Reproducir sonido de notificación
          playNotificationSound();

          // Auto-cerrar después de 5 segundos
          setTimeout(() => notification.close(), 5000);
        } else {
          // Si no hay permisos, solo reproducir el sonido
          playNotificationSound();
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
