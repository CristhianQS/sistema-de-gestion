import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalDetalleReporte from './modals/ModalDetalleReporte';
import { useAuth } from '../context/AuthContext';

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

const VisualizarReportesOro: React.FC = () => {
  const { user } = useAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areaNombre, setAreaNombre] = useState<string>('');

  useEffect(() => {
    loadReportes();
  }, [user]);

  const loadReportes = async () => {
    if (!user?.area_id) {
      setLoading(false);
      return;
    }

    try {
      // Obtener nombre del área
      const { data: areaData } = await supabase
        .from('areas')
        .select('name')
        .eq('id', user.area_id)
        .single();

      if (areaData) {
        setAreaNombre(areaData.name);
      }

      // Cargar reportes del área asignada
      const { data: reportesData, error: reportesError } = await supabase
        .from('area_submissions')
        .select('*')
        .eq('area_id', user.area_id)
        .order('submitted_at', { ascending: false });

      if (reportesError) throw reportesError;

      const reportesConArea = reportesData?.map(reporte => ({
        ...reporte,
        area_nombre: areaData?.name || 'Área desconocida'
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
        <div className="text-gray-600">Cargando reportes...</div>
      </div>
    );
  }

  if (!user?.area_id) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-orange-800 mb-1">No tienes área asignada</h3>
            <p className="text-sm text-orange-700">
              Contacta con un administrador para que te asigne un área.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Reportes de Mi Área</h2>
        <p className="text-yellow-100 text-lg">
          Área: <strong>{areaNombre}</strong>
        </p>
        <p className="text-yellow-100 mt-1">
          Total de reportes: {reportes.length}
        </p>
      </div>

      {/* Lista de Reportes */}
      {reportes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay reportes en tu área</h3>
          <p className="text-gray-500">Los reportes aparecerán aquí cuando los estudiantes los envíen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reportes.map((reporte) => {
            const statusInfo = getStatusInfo(reporte.status);
            return (
              <div
                key={reporte.id}
                onClick={() => handleOpenModal(reporte)}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-500 transition-all cursor-pointer overflow-hidden shadow-md hover:shadow-lg"
              >
                {/* Barra de progreso superior */}
                <div className="h-2 bg-gray-200">
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

                    {/* Centro: Información del estudiante */}
                    <div className="flex items-center space-x-8 flex-1 px-6">
                      {/* Estudiante */}
                      <div className="min-w-[200px]">
                        <p className="text-xs text-gray-500">Estudiante</p>
                        <p className="text-gray-900 font-semibold truncate">{reporte.alumno_nombre}</p>
                      </div>

                      {/* Código / DNI */}
                      <div className="min-w-[150px]">
                        <p className="text-xs text-gray-500">Código / DNI</p>
                        <p className="text-gray-900 font-semibold">
                          {reporte.alumno_codigo} / {reporte.alumno_dni}
                        </p>
                      </div>

                      {/* Ubicación */}
                      <div className="min-w-[180px]">
                        <p className="text-xs text-gray-500">Ubicación</p>
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-900 text-sm truncate">
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
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default VisualizarReportesOro;