/**
 * Funciones de utilidad compartidas
 *
 * Este archivo contiene funciones helper reutilizables
 * en toda la aplicación
 */

import type { AdminRole, SubmissionStatus } from '../types';
import { ROUTES, STATUS_COLORS, STATUS_LABELS } from '../constants';

// ============================================================================
// UTILIDADES DE NAVEGACIÓN
// ============================================================================

/**
 * Obtiene la ruta correspondiente según el rol del administrador
 */
export function getRouteByRole(role: AdminRole): string {
  switch (role) {
    case 'admin_black':
      return ROUTES.ADMIN_BLACK;
    case 'admin_oro':
      return ROUTES.ADMIN_ORO;
    case 'admin_plata':
      return ROUTES.ADMIN_PLATA;
    default:
      return ROUTES.HOME;
  }
}

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatea una fecha en formato corto (solo fecha)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Obtiene la etiqueta legible de un estado de envío
 */
export function getStatusLabel(status: SubmissionStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Obtiene el color correspondiente a un estado
 */
export function getStatusColor(status: SubmissionStatus): string {
  return STATUS_COLORS[status] || '#666666';
}

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si un archivo es una imagen válida
 */
export function isValidImageFile(file: File, maxSizeMB: number = 5): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSizeBytes) {
    return false;
  }

  return true;
}

// ============================================================================
// UTILIDADES DE MANEJO DE ERRORES
// ============================================================================

/**
 * Extrae un mensaje de error legible de un objeto de error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'Ocurrió un error desconocido';
}

// ============================================================================
// UTILIDADES DE CADENAS
// ============================================================================

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// ============================================================================
// UTILIDADES DE OBJETOS
// ============================================================================

/**
 * Verifica si un objeto está vacío
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Elimina propiedades undefined de un objeto
 */
export function removeUndefined<T extends object>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// UTILIDADES DE ARRAYS
// ============================================================================

/**
 * Ordena un array de objetos por una propiedad
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Agrupa un array de objetos por una propiedad
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
