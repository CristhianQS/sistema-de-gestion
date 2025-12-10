/**
 * Utilidad para manejar notificaciones push del navegador
 */

/**
 * Verificar si las notificaciones están soportadas
 */
export function isSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Obtener el estado actual de los permisos
 */
export function getPermissionStatus(): NotificationPermission | null {
  if (!isSupported()) return null;
  return Notification.permission;
}

/**
 * Solicitar permiso para mostrar notificaciones
 */
export async function requestPermission(): Promise<boolean> {
  if (!isSupported()) {
    console.warn('Las notificaciones del navegador no están soportadas');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('El usuario ha denegado los permisos de notificaciones');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error al solicitar permisos de notificaciones:', error);
    return false;
  }
}

/**
 * Mostrar una notificación del navegador
 */
export function showNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
    data?: any;
  }
): Notification | null {
  if (!isSupported()) {
    console.warn('Las notificaciones del navegador no están soportadas');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('No hay permisos para mostrar notificaciones');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: options?.icon || '/logo.png',
      badge: options?.badge || '/logo.png',
      body: options?.body,
      tag: options?.tag,
      requireInteraction: options?.requireInteraction ?? false,
      silent: options?.silent ?? false,
      data: options?.data
    });

    // Auto-cerrar después de 5 segundos (opcional)
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Error al mostrar notificación:', error);
    return null;
  }
}

/**
 * Reproducir sonido de notificación
 */
export function playNotificationSound(volume: number = 0.5): void {
  try {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((error) => {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
    });
  } catch (error) {
    console.warn('Error al reproducir sonido:', error);
  }
}

/**
 * Hook para configurar el sistema de notificaciones al cargar la app
 */
export async function initializeBrowserNotifications(): Promise<boolean> {
  if (!isSupported()) {
    console.log('ℹ️ Las notificaciones del navegador no están disponibles');
    return false;
  }

  const currentPermission = Notification.permission;

  if (currentPermission === 'granted') {
    console.log('✅ Notificaciones del navegador habilitadas');
    return true;
  }

  if (currentPermission === 'denied') {
    console.log('❌ Notificaciones del navegador denegadas por el usuario');
    return false;
  }

  // Si es "default", esperar a que el usuario interactúe antes de pedir permisos
  console.log('⏳ Esperando interacción del usuario para solicitar permisos');
  return false;
}
