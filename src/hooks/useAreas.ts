import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from '../types/pagination';
import * as areasService from '../services/database/areas.service';
import type { Area } from '../lib/supabase';

/**
 * Keys para React Query cache
 */
export const areasKeys = {
  all: ['areas'] as const,
  lists: () => [...areasKeys.all, 'list'] as const,
  list: (params?: Partial<PaginationParams>) => [...areasKeys.lists(), params] as const,
  search: (keyword: string, params?: Partial<PaginationParams>) =>
    [...areasKeys.all, 'search', keyword, params] as const,
  detail: (id: number) => [...areasKeys.all, 'detail', id] as const,
};

/**
 * Hook para obtener todas las áreas con paginación y caché
 */
export function useAreas(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: areasKeys.list(params),
    queryFn: () => areasService.getAllAreas(params),
    staleTime: 1000 * 60 * 5, // 5 minutos - las áreas no cambian tan frecuentemente
  });
}

/**
 * Hook para buscar áreas por palabra clave
 */
export function useSearchAreas(keyword: string, params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: areasKeys.search(keyword, params),
    queryFn: () => areasService.searchAreasByKeyword(keyword, params),
    enabled: keyword.length >= 2, // Solo buscar si hay al menos 2 caracteres
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Hook para obtener un área específica por ID
 */
export function useArea(id: number) {
  return useQuery({
    queryKey: areasKeys.detail(id),
    queryFn: () => areasService.getAreaById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para crear una nueva área
 */
export function useCreateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (area: Omit<Area, 'id' | 'created_at'>) =>
      areasService.createArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areasKeys.all });
    },
  });
}

/**
 * Hook para actualizar un área
 */
export function useUpdateArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: number;
      updates: Partial<Omit<Area, 'id' | 'created_at'>>
    }) => areasService.updateArea(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: areasKeys.all });
      queryClient.setQueryData(areasKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook para eliminar un área
 */
export function useDeleteArea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => areasService.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areasKeys.all });
    },
  });
}
