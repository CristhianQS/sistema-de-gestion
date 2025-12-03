import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalDetalleReporte from './modals/ModalDetalleReporte';
import { FileText, Clock, Zap, CheckCircle, Search, Filter } from 'lucide-react';

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
  estimated_time?: string;
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
      const { data: reportesData, error: reportesError } = await supabase
        .from('area_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (reportesError) throw reportesError;

      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('id, name');

      if (areasError) throw areasError;

      const areasMap: Record<number, string> = {};
      areasData?.forEach((area: Area) => {
        areasMap[area.id] = area.name;
      });

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

  const handleUpdateStatus = async (reporteId: number, newStatus: string, estimatedTime?: string) => {
    try {
      const updateData: any = { status: newStatus };

      if (newStatus === 'in_progress' && estimatedTime) {
        updateData.estimated_time = estimatedTime;
      }

      if (newStatus !== 'in_progress') {
        updateData.estimated_time = null;
      }

      const { error } = await supabase
        .from('area_submissions')
        .update(updateData)
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
          borderColor: 'border-yellow-300',
          progress: 33,
          icon: Clock
        };
      case 'in_progress':
        return {
          label: 'En Proceso',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          progress: 66,
          icon: Zap
        };
      case 'resolved':
        return {
          label: 'Arreglado',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          progress: 100,
          icon: CheckCircle
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          progress: 0,
          icon: FileText
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    });
  };

  const filteredReportes = reportes.filter(reporte => {
    const matchesStatus = filterStatus === 'all' || reporte.status === filterStatus;
    const matchesSearch =
      reporte.alumno_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.alumno_dni.includes(searchTerm) ||
      reporte.alumno_codigo.toString().includes(searchTerm) ||
      reporte.area_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: reportes.length,
    pending: reportes.filter(r => r.status === 'pending').length,
    in_progress: reportes.filter(r => r.status === 'in_progress').length,
    resolved: reportes.filter(r => r.status === 'resolved').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Reportes de Estudiantes
          </h2>
          <p className="text-gray-600 mt-2">Gestiona y da seguimiento a todos los reportes</p>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg border border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 shadow-lg border border-yellow-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Recibidos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 shadow-lg border border-indigo-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">En Proceso</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.in_progress}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 shadow-lg border border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Resueltos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.resolved}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI, código o área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Filtros por estado */}
            <div className="flex gap-2 flex-wrap items-center">
              <Filter className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Recibidos
              </button>
              <button
                onClick={() => setFilterStatus('in_progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'in_progress'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Proceso
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'resolved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resueltos
              </button>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        {filteredReportes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron reportes</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'No hay reportes registrados aún'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReportes.map((reporte) => {
              const statusInfo = getStatusInfo(reporte.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={reporte.id}
                  className={`bg-white rounded-xl p-5 border-l-4 ${statusInfo.borderColor} border border-gray-200 hover:shadow-lg transition-all cursor-pointer`}
                  onClick={() => handleOpenModal(reporte)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`w-5 h-5 ${statusInfo.textColor}`} />
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                          {statusInfo.label}
                        </span>
                        {reporte.form_data?.ai_generated && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
                            🤖 IA
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {reporte.alumno_nombre}
                      </h3>

                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>📧 {reporte.alumno_dni}</span>
                        <span>🎓 Código: {reporte.alumno_codigo}</span>
                        <span className="font-medium text-blue-600">📁 {reporte.area_nombre}</span>
                      </div>

                      {reporte.form_data?.descripcion && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {reporte.form_data.descripcion}
                        </p>
                      )}

                      {reporte.estimated_time && (
                        <div className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                          <Clock className="w-4 h-4" />
                          Tiempo estimado: {reporte.estimated_time}
                        </div>
                      )}
                    </div>

                    {/* Acciones y fecha */}
                    <div className="flex flex-col items-end gap-3">
                      <p className="text-xs text-gray-500">
                        {formatDate(reporte.submitted_at)}
                      </p>

                      <div className="flex gap-2">
                        <select
                          value={reporte.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newStatus = e.target.value;
                            if (newStatus === 'in_progress') {
                              const time = prompt('Ingresa el tiempo estimado (ej: 2 horas, 1 día):');
                              handleUpdateStatus(reporte.id, newStatus, time || undefined);
                            } else {
                              handleUpdateStatus(reporte.id, newStatus);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="pending">Recibido</option>
                          <option value="in_progress">En Proceso</option>
                          <option value="resolved">Arreglado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusInfo.color} transition-all duration-500`}
                        style={{ width: `${statusInfo.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
          <p className="text-gray-700 text-center">
            Mostrando <span className="font-bold text-blue-600">{filteredReportes.length}</span> de{' '}
            <span className="font-bold text-blue-600">{stats.total}</span> reportes totales
          </p>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedReporte && (
        <ModalDetalleReporte
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReporte(null);
          }}
          reporte={selectedReporte}
          onStatusUpdate={handleUpdateStatus}
          onReload={loadReportes}
        />
      )}
    </div>
  );
};

export default VisualizarReportes;
