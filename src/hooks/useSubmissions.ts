import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from '../types/pagination';
import * as submissionsService from '../services/database/submissions.service';
import type { AreaSubmission } from '../lib/supabase';

/**
 * Keys para React Query cache
 */
export const submissionsKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionsKeys.all, 'list'] as const,
  list: (params?: Partial<PaginationParams>) => [...submissionsKeys.lists(), params] as const,
  byArea: (areaId: number, params?: Partial<PaginationParams>) =>
    [...submissionsKeys.all, 'byArea', areaId, params] as const,
  byStudent: (codigo: string, params?: Partial<PaginationParams>) =>
    [...submissionsKeys.all, 'byStudent', codigo, params] as const,
  byStatus: (status: string) => [...submissionsKeys.all, 'byStatus', status] as const,
  detail: (id: number) => [...submissionsKeys.all, 'detail', id] as const,
  counts: () => [...submissionsKeys.all, 'counts'] as const,
};

/**
 * Hook para obtener todos los reportes con paginación y caché
 */
export function useSubmissions(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: submissionsKeys.list(params),
    queryFn: () => submissionsService.getAllSubmissions(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener reportes por área con paginación
 */
export function useSubmissionsByArea(areaId: number, params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: submissionsKeys.byArea(areaId, params),
    queryFn: () => submissionsService.getSubmissionsByArea(areaId, params),
    enabled: !!areaId, // Solo ejecutar si hay areaId
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook para obtener reportes de un estudiante específico
 */
export function useSubmissionsByStudent(codigo: string, params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: submissionsKeys.byStudent(codigo, params),
    queryFn: () => submissionsService.getSubmissionsByStudentCode(codigo, params),
    enabled: !!codigo,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook para obtener un reporte específico por ID
 */
export function useSubmission(id: number) {
  return useQuery({
    queryKey: submissionsKeys.detail(id),
    queryFn: () => submissionsService.getSubmissionById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para obtener conteos por estado
 */
export function useSubmissionsCounts() {
  return useQuery({
    queryKey: submissionsKeys.counts(),
    queryFn: () => submissionsService.countSubmissionsByStatus(),
    staleTime: 1000 * 60, // 1 minuto (se actualiza más frecuentemente)
  });
}

/**
 * Hook para crear un nuevo reporte
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: Omit<AreaSubmission, 'id' | 'created_at' | 'updated_at'>) =>
      submissionsService.createSubmission(submission),
    onSuccess: () => {
      // Invalidar todas las queries de submissions para refrescar los datos
      queryClient.invalidateQueries({ queryKey: submissionsKeys.all });
    },
  });
}

/**
 * Hook para actualizar un reporte
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: number;
      updates: Partial<Omit<AreaSubmission, 'id' | 'created_at'>>
    }) => submissionsService.updateSubmission(id, updates),
    onSuccess: (data) => {
      // Invalidar la lista y el detalle específico
      queryClient.invalidateQueries({ queryKey: submissionsKeys.all });
      queryClient.setQueryData(submissionsKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook para actualizar solo el estado de un reporte
 */
export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: {
      id: number;
      status: 'pending' | 'approved' | 'rejected'
    }) => submissionsService.updateSubmissionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionsKeys.all });
    },
  });
}

/**
 * Hook para eliminar un reporte
 */
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => submissionsService.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionsKeys.all });
    },
  });
}
