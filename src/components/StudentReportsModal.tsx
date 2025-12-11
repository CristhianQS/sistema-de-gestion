import React, { useState, useEffect } from 'react';
import { useStudentReports } from '../hooks/useStudentReports';

interface StudentReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentReportsModal = ({ isOpen, onClose }: StudentReportsModalProps) => {
  const [studentCode, setStudentCode] = useState('');
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const {
    loading,
    error,
    reports,
    studentInfo,
    fetchReportsByCode,
    getStatusColor,
    getStatusLabel,
    clearReports
  } = useStudentReports();

  useEffect(() => {
    if (!isOpen) {
      setStudentCode('');
      clearReports();
      setExpandedReport(null);
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportsByCode(studentCode);
  };

  const toggleExpandReport = (reportId: number) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay semi-transparente oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Modal centrado */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-in-out animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente y bordes redondeados */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Mis Reportes
            </h2>
            <p className="text-blue-100 text-sm">
              Consulta el historial de tus reportes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2.5 transition-all hover:rotate-90 duration-300"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="p-8">
            {/* Formulario de búsqueda con diseño moderno */}
            <form onSubmit={handleSearch} className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Código de Estudiante
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Ej: 2020123456"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !studentCode.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mensaje de error mejorado */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Información del estudiante mejorada */}
            {studentInfo && (
              <div className="mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Información del Estudiante
                  </h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">Nombre:</span>
                    <span>{studentInfo.nombre}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-blue-700">Código:</span>
                    <span>{studentInfo.codigo}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Lista de reportes en modo lista */}
            {reports.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Historial de Reportes
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Área</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ubicación</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reports.map((report) => (
                        <React.Fragment key={report.id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{report.area_name}</div>
                              {report.area_description && (
                                <div className="text-xs text-gray-500 mt-1">{report.area_description}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700">
                                {report.form_data.pabellon_nombre && (
                                  <div>{report.form_data.pabellon_nombre}</div>
                                )}
                                {report.form_data.salon_nombre && (
                                  <div className="text-xs text-gray-500">{report.form_data.salon_nombre}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700">
                                {new Date(report.submitted_at).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  timeZone: 'America/Lima'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(report.submitted_at).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'America/Lima'
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <span className={`${getStatusColor(report.status)} text-white text-xs font-semibold px-2 py-1 rounded`}>
                                  {getStatusLabel(report.status)}
                                </span>
                                {report.status === 'in_progress' && report.estimated_time && (
                                  <div className="flex items-center gap-1 text-xs text-green-600">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">
                                      {(() => {
                                        const timeOptions = [
                                          { value: '30min', label: '30 minutos' },
                                          { value: '1h', label: '1 hora' },
                                          { value: '2h', label: '2 horas' },
                                          { value: '4h', label: '4 horas' },
                                          { value: '1d', label: '1 día' },
                                          { value: '2d', label: '2 días' },
                                          { value: '3d', label: '3 días' },
                                          { value: '1w', label: '1 semana' },
                                          { value: '2w', label: '2 semanas' }
                                        ];
                                        return timeOptions.find(opt => opt.value === report.estimated_time)?.label || report.estimated_time;
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleExpandReport(report.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                              >
                                {expandedReport === report.id ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    <span>Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span>Ver más</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedReport === report.id && (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 bg-gray-50">
                                <div className="space-y-3">
                                  <h6 className="text-sm font-semibold text-gray-700 mb-2">Detalles del reporte:</h6>
                                  <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(report.form_data)
                                      .filter(([key]) => {
                                        const hiddenFields = [
                                          'salon_id',
                                          'pabellon_id',
                                          'salon_nombre',
                                          'pabellon_nombre',
                                          'salon_capacidad',
                                          'pabellon_descripcion',
                                          'ia_metadata'
                                        ];
                                        return !hiddenFields.includes(key.toLowerCase());
                                      })
                                      .map(([key, value]) => {
                                        const isUrl = typeof value === 'string' && value.startsWith('http');
                                        return (
                                          <div key={key} className="bg-white p-3 rounded border border-gray-200">
                                            <div className="text-xs font-semibold text-gray-600 mb-1">
                                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </div>
                                            {isUrl ? (
                                              <a
                                                href={value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                Ver archivo
                                              </a>
                                            ) : (
                                              <div className="text-sm text-gray-800">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Estado vacío cuando no hay búsqueda */}
            {!loading && !error && reports.length === 0 && !studentInfo && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  ¿Listo para consultar?
                </h4>
                <p className="text-gray-600 text-base">
                  Ingresa tu código de estudiante para ver tu historial de reportes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportsModal;