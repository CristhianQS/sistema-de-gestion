/**
 * Constantes centralizadas de la aplicación
 *
 * Este archivo contiene todos los valores constantes utilizados
 * en múltiples lugares de la aplicación
 */

// ============================================================================
// COLORES Y TEMAS
// ============================================================================

export const COLORS = {
  // Colores principales
  PRIMARY: '#023052',
  PRIMARY_LIGHT: '#034a7a',

  // Colores por rol de administrador
  ADMIN_BLACK: '#000000ff',
  ADMIN_ORO: '#FFC107',
  ADMIN_PLATA: '#9E9E9E',

  // Colores de estado
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',

  // Colores de fondo
  BACKGROUND_LIGHT: '#F5F5F5',
  BACKGROUND_DARK: '#1A1A1A',
} as const;

// ============================================================================
// TEXTOS Y ETIQUETAS
// ============================================================================

export const APP_NAME = 'Sistema UPEU';

export const ROLE_LABELS: Record<string, string> = {
  admin_black: 'Administrador Principal',
  admin_oro: 'Administrador de Área',
  admin_plata: 'Visualizador',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA500',
  approved: '#4CAF50',
  rejected: '#F44336',
};

// ============================================================================
// RUTAS
// ============================================================================

export const ROUTES = {
  HOME: '/',
  ADMIN_BLACK: '/admin/black',
  ADMIN_ORO: '/admin/oro',
  ADMIN_PLATA: '/admin/plata',
} as const;

// ============================================================================
// CONFIGURACIÓN DE IMÁGENES
// ============================================================================

export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  FOLDERS: {
    AREAS: 'areas',
    PABELLONES: 'pabellones',
    FORMULARIOS: 'formularios',
    UPLOADS: 'uploads',
  },
  PLACEHOLDER: 'https://via.placeholder.com/400x300?text=Sin+Imagen',
  ERROR_PLACEHOLDER: 'https://via.placeholder.com/400x300?text=Error+al+cargar',
} as const;

// ============================================================================
// CONFIGURACIÓN DE FORMULARIOS
// ============================================================================

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texto corto',
  textarea: 'Texto largo',
  file: 'Archivo',
  image: 'Imagen',
  date: 'Fecha',
  select: 'Selección',
};

// ============================================================================
// MENSAJES
// ============================================================================

export const MESSAGES = {
  ERROR: {
    GENERIC: 'Ocurrió un error. Por favor, intenta de nuevo.',
    NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  },
  SUCCESS: {
    SAVE: 'Guardado exitosamente',
    DELETE: 'Eliminado exitosamente',
    UPDATE: 'Actualizado exitosamente',
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
  },
} as const;

// ============================================================================
// CONFIGURACIÓN DE VALIDACIÓN
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
