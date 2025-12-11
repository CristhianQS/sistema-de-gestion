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
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      area:areas(name),
      submission:area_submissions(alumno_nombre, alumno_codigo, status)
    `)
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }

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
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      area:areas(name),
      submission:area_submissions(alumno_nombre, alumno_codigo, status)
    `)
    .eq('user_email', userEmail)
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    throw error;
  }

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
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', userEmail)
    .eq('read', false);

  if (error) {
    console.error('Error al contar notificaciones:', error);
    return 0;
  }

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
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
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
  const { error } = await supabase.from('notifications').insert([
    {
      user_email: notification.user_email,
      user_name: notification.user_name,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      related_submission_id: notification.related_submission_id,
      related_area_id: notification.related_area_id
    }
  ]);

  if (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}
