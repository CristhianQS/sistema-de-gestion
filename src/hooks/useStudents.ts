import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from '../types/pagination';
import * as studentsService from '../services/database/students.service';
import type { DataAlumno } from '../lib/supabase';

/**
 * Keys para React Query cache
 */
export const studentsKeys = {
  all: ['students'] as const,
  lists: () => [...studentsKeys.all, 'list'] as const,
  list: (params?: Partial<PaginationParams>) => [...studentsKeys.lists(), params] as const,
  search: (searchTerm: string, params?: Partial<PaginationParams>) =>
    [...studentsKeys.all, 'search', searchTerm, params] as const,
  detail: (id: number) => [...studentsKeys.all, 'detail', id] as const,
  byCode: (codigo: string) => [...studentsKeys.all, 'byCode', codigo] as const,
};

/**
 * Hook para obtener todos los estudiantes con paginación y caché
 */
export function useStudents(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: studentsKeys.list(params),
    queryFn: () => studentsService.getAllStudents(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar estudiantes
 */
export function useSearchStudents(searchTerm: string, params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: studentsKeys.search(searchTerm, params),
    queryFn: () => studentsService.searchStudents(searchTerm, params),
    enabled: searchTerm.length >= 2, // Solo buscar si hay al menos 2 caracteres
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Hook para obtener un estudiante por ID
 */
export function useStudent(id: number) {
  return useQuery({
    queryKey: studentsKeys.detail(id),
    queryFn: () => studentsService.getStudentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para obtener un estudiante por código
 */
export function useStudentByCode(codigo: string) {
  return useQuery({
    queryKey: studentsKeys.byCode(codigo),
    queryFn: () => studentsService.getStudentByCode(codigo),
    enabled: !!codigo,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para verificar si un código existe
 */
export function useStudentCodeExists(codigo: string) {
  return useQuery({
    queryKey: [...studentsKeys.all, 'exists', codigo],
    queryFn: () => studentsService.studentCodeExists(codigo),
    enabled: !!codigo && codigo.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para crear un nuevo estudiante
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (student: Omit<DataAlumno, 'id' | 'created_at'>) =>
      studentsService.createStudent(student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
    },
  });
}

/**
 * Hook para actualizar un estudiante
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: number;
      updates: Partial<Omit<DataAlumno, 'id' | 'created_at'>>
    }) => studentsService.updateStudent(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
      queryClient.setQueryData(studentsKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook para eliminar un estudiante
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentsService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsKeys.all });
    },
  });
}
