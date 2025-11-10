import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalDetalleReporte from './modals/ModalDetalleReporte';

interface Reporte {
  id: number;
  area_id: number;
  alumno_id: number;
  alumno_dni: string;
  alumno_codigo: number;
  alumno_nombre: string;
  form_data: any;
  submitted_at: string;
  status: 'pending' | 'in_progress' | 'resolved';
  area_nombre?: string;
}

interface Area {
  id: number;
  name: string;
}

const VisualizarReportes: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      // Cargar reportes
      const { data: reportesData, error: reportesError } = await supabase
        .from('area_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (reportesError) throw reportesError;

      // Cargar áreas
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('id, name');

      if (areasError) throw areasError;

      // Mapear nombres de áreas
      const areasMap: Record<number, string> = {};
      areasData?.forEach((area: Area) => {
        areasMap[area.id] = area.name;
      });

      // Combinar datos
      const reportesConArea = reportesData?.map(reporte => ({
        ...reporte,
        area_nombre: areasMap[reporte.area_id] || 'Área desconocida'
      })) || [];

      setReportes(reportesConArea);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reporteId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('area_submissions')
        .update({ status: newStatus })
        .eq('id', reporteId);

      if (error) throw error;
      await loadReportes();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleOpenModal = (reporte: Reporte) => {
    setSelectedReporte(reporte);
    setIsModalOpen(true);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Recibido',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          progress: 33
        };
      case 'in_progress':
        return {
          label: 'En Proceso',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          progress: 66
        };
      case 'resolved':
        return {
          label: 'Arreglado',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          progress: 100
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-500',
          progress: 0
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Reportes de Estudiantes</h2>
        <p className="text-gray-400 mt-1">
          Total de reportes: {reportes.length}
        </p>
      </div>

      {/* Lista de Reportes */}
      {reportes.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay reportes</h3>
          <p className="text-gray-500">Los reportes de estudiantes aparecerán aquí</p>
        </div>
      ) : (
<div className="space-y-4">
  {reportes.map((reporte) => {
    const statusInfo = getStatusInfo(reporte.status);
    return (
      <div
        key={reporte.id}
        onClick={() => handleOpenModal(reporte)}
        className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer overflow-hidden"
      >
        {/* Barra de progreso superior */}
        <div className="h-2 bg-gray-700">
          <div
            className={`h-full ${statusInfo.color} transition-all duration-500`}
            style={{ width: `${statusInfo.progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Lado izquierdo: Estado y Fecha */}
            <div className="flex items-center space-x-4 min-w-[220px]">
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} whitespace-nowrap`}>
                {statusInfo.label}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatDate(reporte.submitted_at)}
              </span>
            </div>

            {/* Centro: Información del estudiante en horizontal */}
            <div className="flex items-center space-x-8 flex-1 px-6">
              {/* Estudiante */}
              <div className="min-w-[200px]">
                <p className="text-xs text-gray-500">Estudiante</p>
                <p className="text-white font-semibold truncate">{reporte.alumno_nombre}</p>
              </div>

              {/* Código / DNI */}
              <div className="min-w-[150px]">
                <p className="text-xs text-gray-500">Código / DNI</p>
                <p className="text-white font-semibold">
                  {reporte.alumno_codigo} / {reporte.alumno_dni}
                </p>
              </div>

              {/* Área */}
              <div className="min-w-[120px]">
                <p className="text-xs text-gray-500">Área</p>
                <p className="text-white font-semibold truncate">{reporte.area_nombre}</p>
              </div>

              {/* Ubicación */}
              <div className="min-w-[180px]">
                <p className="text-xs text-gray-500">Ubicación</p>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white text-sm truncate">
                    {reporte.form_data?.pabellon_nombre && reporte.form_data?.salon_nombre
                      ? `${reporte.form_data.pabellon_nombre} - ${reporte.form_data.salon_nombre}`
                      : 'No especificado'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Lado derecho: Flecha */}
            <div className="ml-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
      )}

      {/* Modal de Detalle */}
      {selectedReporte && (
        <ModalDetalleReporte
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReporte(null);
          }}
          reporte={selectedReporte}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default VisualizarReportes;