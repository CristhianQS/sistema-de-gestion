import { useState } from 'react';
import { getAllAreasUnpaginated } from '../services/database/areas.service';
import { getSubmissionsByStudentCode } from '../services/database/submissions.service';

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
  estimated_time?: string;
}

interface AreaInfo {
  id: number;
  name: string;
  description?: string;
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
      const code = parseInt(studentCode, 10);

      if (Number.isNaN(code)) {
        throw new Error('El código debe ser un número válido');
      }

      const [reportsResponse, areas] = await Promise.all([
        getSubmissionsByStudentCode(String(code), { page: 1, pageSize: 1000 }),
        getAllAreasUnpaginated(),
      ]);

      const reportsData = reportsResponse.data || [];

      if (reportsData.length === 0) {
        setError('No se encontraron reportes para este código de estudiante');
        return;
      }

      const areaMap = new Map<number, AreaInfo>(
        (areas || []).map((area: any) => [area.id, area])
      );

      const mappedReports = reportsData.map((report: any) => {
        const area = areaMap.get(report.area_id);

        return {
          ...report,
          area_name: area?.name || 'Área desconocida',
          area_description: area?.description || '',
        };
      });

      setReports(mappedReports);

      const firstReport = mappedReports[0];
      setStudentInfo({
        nombre: firstReport.alumno_nombre,
        codigo: firstReport.alumno_codigo,
        carrera: firstReport.form_data?.carrera || 'N/A',
      });
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
