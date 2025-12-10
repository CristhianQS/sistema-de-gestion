/**
 * Tipos y utilidades para paginación
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface SupabasePaginationParams {
  from: number;
  to: number;
}

/**
 * Convierte parámetros de paginación estándar a formato Supabase
 */
export function toPaginationRange(params: PaginationParams): SupabasePaginationParams {
  const { page, pageSize } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to };
}

/**
 * Calcula el número total de páginas
 */
export function calculateTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Crea un objeto de resultado de paginación
 */
export function createPaginationResult<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginationResult<T> {
  const totalPages = calculateTotalPages(totalItems, params.pageSize);

  return {
    data,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    },
  };
}

/**
 * Constantes por defecto para paginación
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
