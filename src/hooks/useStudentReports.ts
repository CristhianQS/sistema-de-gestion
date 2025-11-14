import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface StudentReport {
  id: number;
  area_id: number;
  alumno_codigo: number;
  alumno_nombre: string;
  alumno_dni: string;
  form_data: any;
  submitted_at: string;
  status: string;
  area_name?: string;
  area_description?: string;
}

export const useStudentReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [studentInfo, setStudentInfo] = useState<{
    nombre: string;
    codigo: number;
    carrera: string;
  } | null>(null);

  const fetchReportsByCode = async (studentCode: string) => {
    if (!studentCode || studentCode.trim() === '') {
      setError('Por favor ingresa un código válido');
      return;
    }

    setLoading(true);
    setError(null);
    setReports([]);
    setStudentInfo(null);

    try {
      const code = parseInt(studentCode);
      
      if (isNaN(code)) {
        throw new Error('El código debe ser un número válido');
      }

      // Buscar reportes del estudiante con información del área
      const { data: reportsData, error: reportsError } = await supabase
        .from('area_submissions')
        .select(`
          *,
          areas:area_id (
            name,
            description
          )
        `)
        .eq('alumno_codigo', code)
        .order('submitted_at', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      if (!reportsData || reportsData.length === 0) {
        setError('No se encontraron reportes para este código de estudiante');
        return;
      }

      // Mapear los datos con la información del área
      const mappedReports = reportsData.map((report: any) => ({
        ...report,
        area_name: report.areas?.name || 'Área desconocida',
        area_description: report.areas?.description || ''
      }));

      setReports(mappedReports);
      
      // Guardar información del estudiante del primer reporte
      if (mappedReports.length > 0) {
        setStudentInfo({
          nombre: mappedReports[0].alumno_nombre,
          codigo: mappedReports[0].alumno_codigo,
          carrera: mappedReports[0].form_data?.carrera || 'N/A'
        });
      }

    } catch (err: any) {
      console.error('Error al buscar reportes:', err);
      setError(err.message || 'Error al buscar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'completed':
        return 'Completado';
      case 'rejected':
        return 'Rechazado';
      case 'in_progress':
        return 'En Proceso';
      default:
        return status;
    }
  };

  const clearReports = () => {
    setReports([]);
    setStudentInfo(null);
    setError(null);
  };

  return {
    loading,
    error,
    reports,
    studentInfo,
    fetchReportsByCode,
    getStatusColor,
    getStatusLabel,
    clearReports
  };
};