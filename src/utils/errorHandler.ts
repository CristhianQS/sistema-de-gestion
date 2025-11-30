/**
 * Sistema centralizado de manejo de errores
 *
 * Proporciona funciones para manejar y reportar errores
 * de manera consistente en toda la aplicación
 */

import { MESSAGES } from '../constants';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

/**
 * Tipos de errores de la aplicación
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * Clase de error personalizada para la aplicación
 */
export class ApplicationError extends Error {
  code: ErrorType;
  details?: unknown;
  timestamp: Date;

  constructor(message: string, code: ErrorType = ErrorType.UNKNOWN, details?: unknown) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Registra un error en la consola (y opcionalmente en un servicio externo)
 */
export function logError(error: Error | ApplicationError, context?: string): void {
  const errorInfo = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof ApplicationError) {
    console.error('[App Error]', {
      ...errorInfo,
      code: error.code,
      details: error.details,
    });
  } else {
    console.error('[Error]', errorInfo);
  }

  // TODO: Aquí se puede agregar integración con servicios como Sentry, LogRocket, etc.
  // sendToErrorTracking(errorInfo);
}

/**
 * Extrae un mensaje de error user-friendly de cualquier tipo de error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return MESSAGES.ERROR.GENERIC;
}

/**
 * Determina el tipo de error basado en el error recibido
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof ApplicationError) {
    return error.code;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    if (message.includes('unauthorized') || message.includes('unauthenticated')) {
      return ErrorType.AUTHENTICATION;
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }

    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Maneja errores de Supabase y los convierte en ApplicationError
 */
export function handleSupabaseError(error: any): ApplicationError {
  const message = error?.message || MESSAGES.ERROR.GENERIC;
  const code = error?.code;

  // Mapear códigos de error de Supabase a tipos de error de la app
  let errorType: ErrorType = ErrorType.UNKNOWN;

  if (code === 'PGRST116' || code === '404') {
    errorType = ErrorType.NOT_FOUND;
  } else if (code === '401' || code === 'PGRST301') {
    errorType = ErrorType.AUTHENTICATION;
  } else if (code === '403') {
    errorType = ErrorType.AUTHORIZATION;
  } else if (code?.startsWith('23')) {
    // Errores de constraint de PostgreSQL
    errorType = ErrorType.VALIDATION;
  }

  return new ApplicationError(message, errorType, error);
}

/**
 * Wrapper para funciones asíncronas que maneja errores automáticamente
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T | null, ApplicationError | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const appError = error instanceof ApplicationError
      ? error
      : new ApplicationError(getErrorMessage(error), getErrorType(error), error);

    logError(appError, context);
    return [null, appError];
  }
}

/**
 * Muestra un mensaje de error al usuario (puede integrarse con una librería de toast/notificaciones)
 */
export function showErrorToUser(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);

  // Por ahora usamos alert, pero esto debería reemplazarse con un sistema de notificaciones
  // como react-toastify, react-hot-toast, etc.
  console.error('Error mostrado al usuario:', message);

  // TODO: Reemplazar con un sistema de notificaciones elegante
  // toast.error(message);
}

/**
 * Valida si un error es recuperable o crítico
 */
export function isRecoverableError(error: unknown): boolean {
  const errorType = getErrorType(error);

  // Errores de red y validación son generalmente recuperables
  return errorType === ErrorType.NETWORK || errorType === ErrorType.VALIDATION;
}
