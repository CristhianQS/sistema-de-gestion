import React, { useState } from 'react';
import { useSubmissions, useUpdateSubmissionStatus } from '../hooks/useSubmissions';
import { Pagination } from './common/Pagination';
import ModalDetalleReporte from './modals/ModalDetalleReporte';
import { FileText, Clock, Zap, CheckCircle, Search, Filter, Loader2 } from 'lucide-react';
import type { AreaSubmission } from '../lib/supabase';

/**
 * Componente optimizado para visualizar reportes con:
 * - Paginación
 * - Caché automático (React Query)
 * - Filtros por estado
 * - Búsqueda
 */
const VisualizarReportesOptimizado: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReporte, setSelectedReporte] = useState<AreaSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook optimizado con caché automático
  const { data, isLoading, isError, error } = useSubmissions({ page, pageSize });
  const updateStatus = useUpdateSubmissionStatus();

  // Filtrar reportes localmente (o podrías mover esto al servidor)
  const filteredReportes = React.useMemo(() => {
    if (!data?.data) return [];

    let filtered = data.data;

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.codigo_alumno?.toLowerCase().includes(term) ||
          r.area?.name?.toLowerCase().includes(term) ||
          r.alumno?.estudiante?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [data?.data, filterStatus, searchTerm]);

  const handleUpdateStatus = async (reporteId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ id: reporteId, status: newStatus });
      // React Query invalidará automáticamente el caché y refrescará los datos
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado del reporte');
    }
  };

  const handleVerDetalle = (reporte: AreaSubmission) => {
    setSelectedReporte(reporte);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { icon: CheckCircle, text: 'Aprobado', color: 'bg-green-100 text-green-800' },
      rejected: { icon: Zap, text: 'Rechazado', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando reportes...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error al cargar reportes</h3>
        <p className="text-red-600 text-sm mt-1">{error?.message || 'Error desconocido'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por código, área o estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de reportes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Área
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReportes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron reportes</p>
                </td>
              </tr>
            ) : (
              filteredReportes.map((reporte) => (
                <tr key={reporte.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reporte.codigo_alumno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reporte.alumno?.estudiante || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reporte.area?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(reporte.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleVerDetalle(reporte)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Ver detalle
                    </button>
                    {reporte.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(reporte.id, 'approved')}
                          disabled={updateStatus.isPending}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 mr-2"
                        >
                          {updateStatus.isPending ? 'Actualizando...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(reporte.id, 'rejected')}
                          disabled={updateStatus.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {updateStatus.isPending ? 'Actualizando...' : 'Rechazar'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {data && (
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            pageSize={pageSize}
            totalItems={data.pagination.totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Modal de detalle */}
      {selectedReporte && isModalOpen && (
        <ModalDetalleReporte
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReporte(null);
          }}
          reporte={selectedReporte as any}
          onUpdateStatus={async (id: number, status: string) => {
            await handleUpdateStatus(id, status as 'pending' | 'approved' | 'rejected');
          }}
        />
      )}
    </div>
  );
};

export default VisualizarReportesOptimizado;
