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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filtrar reportes
  const filteredReportes = reportes.filter(reporte => {
    const matchesStatus = filterStatus === 'all' || reporte.status === filterStatus;
    const matchesSearch =
      reporte.alumno_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.alumno_dni.includes(searchTerm) ||
      reporte.alumno_codigo.toString().includes(searchTerm) ||
      reporte.area_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Estadísticas por estado
  const stats = {
    total: reportes.length,
    pending: reportes.filter(r => r.status === 'pending').length,
    in_progress: reportes.filter(r => r.status === 'in_progress').length,
    resolved: reportes.filter(r => r.status === 'resolved').length
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
      {/* Header con estadísticas */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Reportes de Estudiantes</h2>
        <p className="text-gray-400">Gestiona y da seguimiento a todos los reportes</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Recibidos</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">En Proceso</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.in_progress}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Resueltos</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.resolved}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, DNI, código o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtros por estado */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Recibidos
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'resolved'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Resueltos
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Reportes */}
      {filteredReportes.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <svg className="w-20 h-20 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No se encontraron reportes' : 'No hay reportes'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'Intenta ajustar los filtros o la búsqueda'
              : 'Los reportes de estudiantes aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReportes.map((reporte) => {
            const statusInfo = getStatusInfo(reporte.status);
            return (
              <div
                key={reporte.id}
                onClick={() => handleOpenModal(reporte)}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Barra de progreso superior */}
                <div className="h-1.5 bg-gray-700">
                  <div
                    className={`h-full ${statusInfo.color} transition-all duration-500`}
                    style={{ width: `${statusInfo.progress}%` }}
                  />
                </div>

                <div className="p-5">
                  {/* Header: Badge de estado */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color} text-white`}>
                      {statusInfo.label}
                    </span>
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  {/* Información del estudiante */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-10 h-10 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{reporte.alumno_nombre}</p>
                        <p className="text-gray-400 text-xs">
                          {reporte.alumno_codigo} · {reporte.alumno_dni}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Área */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-blue-400 text-sm font-medium">{reporte.area_nombre}</span>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-300 text-sm truncate">
                        {reporte.form_data?.pabellon_nombre && reporte.form_data?.salon_nombre
                          ? `${reporte.form_data.pabellon_nombre} - ${reporte.form_data.salon_nombre}`
                          : 'Ubicación no especificada'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Footer: Fecha */}
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDate(reporte.submitted_at)}</span>
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