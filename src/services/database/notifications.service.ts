import { supabase } from '../../lib/supabase';

export interface Notification {
  id: number;
  user_email: string;
  user_name: string | null;
  title: string;
  message: string;
  type: 'new_report' | 'status_change' | 'comment' | 'info';
  related_submission_id: number | null;
  related_area_id: number | null;
  read: boolean;
  created_at: string;
  read_at: string | null;
  // Datos adicionales de la vista
  area_name?: string;
  alumno_nombre?: string;
  alumno_codigo?: number;
  submission_status?: string;
}

/**
 * Obtener todas las notificaciones de un usuario
 */
export async function getNotifications(userEmail: string): Promise<Notification[]> {
  const res = await fetch(`http://localhost:4000/notificaciones/filtrar?email=${encodeURIComponent(userEmail)}`);

  if (!res.ok) {
    throw new Error('Error al obtener notificaciones');
  }

  const data: [any] = await res.json();

  // Mapear los datos con joins
  return (data || []).map(n => ({
    ...n,
    area_name: n.area?.name,
    alumno_nombre: n.submission?.alumno_nombre,
    alumno_codigo: n.submission?.alumno_codigo,
    submission_status: n.submission?.status,
  }));
}

/**
 * Obtener solo notificaciones no leídas
 */
export async function getUnreadNotifications(userEmail: string): Promise<Notification[]> {
  const res = await fetch(`http://localhost:4000/notificaciones/noleidas?email=${encodeURIComponent(userEmail)}`);

  if (!res.ok) {
    throw new Error('Error al obtener notificaciones no leídas');
  }

  const data: [any] = await res.json();

  // Mapear los datos con joins
  return (data || []).map(n => ({
    ...n,
    area_name: n.area?.name,
    alumno_nombre: n.submission?.alumno_nombre,
    alumno_codigo: n.submission?.alumno_codigo,
    submission_status: n.submission?.status,
  }));
}

/**
 * Contar notificaciones no leídas
 */
export async function getUnreadCount(userEmail: string): Promise<number> {
  const res = await fetch(`http://localhost:4000/notificaciones/conteo?email=${encodeURIComponent(userEmail)}`);

  if (!res.ok) {
    throw new Error('Error al contar notificaciones');
  }

  const count = await res.json();

  return count || 0;
}

/**
 * Marcar una notificación como leída
 */
export async function markAsRead(notificationId: number): Promise<void> {
  const { error } = await supabase.rpc('mark_notification_as_read', {
    notification_id: notificationId
  });

  if (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
}

/**
 * Marcar todas las notificaciones de un usuario como leídas
 */
export async function markAllAsRead(userEmail: string): Promise<void> {
  const { error } = await supabase.rpc('mark_all_notifications_as_read', {
    p_user_email: userEmail
  });

  if (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
}

/**
 * Suscribirse a cambios en notificaciones en tiempo real
 */
export function subscribeToNotifications(
  userEmail: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_email=eq.${userEmail}`
      },
      async (payload) => {
        // Obtener la notificación completa con detalles
        const { data } = await supabase
          .from('notifications_with_details')
          .select('*')
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as Notification);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Eliminar una notificación
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  const res = await fetch(`http://localhost:4000/notificaciones/borrar/${notificationId}`);

  if (!res.ok) {
    console.error('Error al eliminar notificación');
    throw new Error('Error al eliminar notificación');
  }
}

/**
 * Crear notificación manualmente (para testing)
 */
export async function createNotification(notification: {
  user_email: string;
  user_name?: string;
  title: string;
  message: string;
  type?: string;
  related_submission_id?: number;
  related_area_id?: number;
}): Promise<void> {
  const newNoti = {
    user_email: notification.user_email,
    user_name: notification.user_name,
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    related_submission_id: notification.related_submission_id,
    related_area_id: notification.related_area_id
  };

  const res = await fetch('http://localhost:4000/notificaciones/nuevo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNoti),
  });

  if (!res.ok) {
    console.error('Error al crear notificación');
    throw new Error('Error al crear notificación');
  }
}
