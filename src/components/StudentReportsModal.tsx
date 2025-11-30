import { useState, useEffect } from 'react';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

            {/* Lista de reportes mejorada */}
            {reports.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Historial de Reportes
                  </h3>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}
                  </span>
                </div>

                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Cabecera del reporte */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">
                                {report.area_name}
                              </h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDate(report.submitted_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`${getStatusColor(report.status)} text-white text-sm font-bold px-4 py-2 rounded-full shadow-md`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      {report.area_description && (
                        <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                          {report.area_description}
                        </p>
                      )}

                      {/* Botón para expandir detalles mejorado */}
                      <button
                        onClick={() => toggleExpandReport(report.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-all hover:gap-3 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl"
                      >
                        <span>
                          {expandedReport === report.id ? 'Ocultar detalles' : 'Ver detalles completos'}
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-300 ${expandedReport === report.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Detalles expandibles mejorados */}
                    {expandedReport === report.id && (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-t-2 border-gray-200 p-6">
                        {/* Mostrar ubicación de forma especial */}
                        {(report.form_data.pabellon_nombre || report.form_data.salon_nombre) && (
                          <div className="mb-6 bg-white p-5 rounded-xl border-2 border-blue-300 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h6 className="text-lg font-bold text-gray-800">Ubicación del Reporte</h6>
                            </div>
                            <div className="space-y-2 ml-13">
                              {report.form_data.pabellon_nombre && (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-bold text-gray-600">Pabellón:</span>
                                  <span className="text-base font-semibold text-gray-900">{report.form_data.pabellon_nombre}</span>
                                </div>
                              )}
                              {report.form_data.salon_nombre && (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-bold text-gray-600">Salón:</span>
                                  <span className="text-base font-semibold text-gray-900">{report.form_data.salon_nombre}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <h5 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Datos del Formulario
                        </h5>
                        <div className="space-y-3">
                          {Object.entries(report.form_data)
                            .filter(([key]) => {
                              // Filtrar campos que no se deben mostrar
                              const hiddenFields = [
                                'salon_id',
                                'pabellon_id',
                                'salon_nombre',
                                'pabellon_nombre',
                                'salon_capacidad',
                                'pabellon_descripcion'
                              ];
                              return !hiddenFields.includes(key.toLowerCase());
                            })
                            .map(([key, value]) => {
                              const isUrl = typeof value === 'string' && value.startsWith('http');

                              return (
                                <div key={key} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                                  <span className="text-sm font-bold text-gray-700 block mb-2">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  {isUrl ? (
                                    <a
                                      href={value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      Ver archivo adjunto
                                    </a>
                                  ) : (
                                    <span className="text-sm text-gray-800 break-words block">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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