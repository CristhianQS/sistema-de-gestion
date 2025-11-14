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
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Overlay semi-transparente oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />

      {/* Modal deslizante desde la derecha */}
      <div
        className="relative w-full max-w-2xl h-full bg-white bg-opacity-95 backdrop-blur-md shadow-2xl overflow-hidden transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between border-b-4 border-blue-500">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Consultar Reportes
            </h2>
            <p className="text-blue-50 text-sm mt-1">
              Ingresa tu código para ver el historial
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="h-full overflow-y-auto pb-20">
          <div className="p-6">
            {/* Formulario de búsqueda */}
            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Estudiante
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Ej: 2020123456"
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !studentCode.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
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

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Información del estudiante */}
            {studentInfo && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Información del Estudiante
                </h3>
                <div className="space-y-1 text-blue-800">
                  <p><span className="font-medium">Nombre:</span> {studentInfo.nombre}</p>
                  <p><span className="font-medium">Código:</span> {studentInfo.codigo}</p>
                </div>
              </div>
            )}

            {/* Lista de reportes */}
            {reports.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Historial de Reportes ({reports.length})
                </h3>
                
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    {/* Cabecera del reporte */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {report.area_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(report.submitted_at)}
                          </p>
                        </div>
                        <span
                          className={`${getStatusColor(report.status)} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      {report.area_description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {report.area_description}
                        </p>
                      )}

                      {/* Botón para expandir detalles */}
                      <button
                        onClick={() => toggleExpandReport(report.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <span>
                          {expandedReport === report.id ? 'Ocultar detalles' : 'Ver detalles'}
                        </span>
                        <svg
                          className={`w-4 h-4 transition-transform ${expandedReport === report.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Detalles expandibles */}
                    {expandedReport === report.id && (
                      <div className="bg-gray-50 border-t-2 border-gray-200 p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">
                          Datos del Formulario:
                        </h5>
                        <div className="space-y-2">
                          {Object.entries(report.form_data)
                            .filter(([key]) => {
                              // Filtrar campos que no se deben mostrar
                              const hiddenFields = [
                                'salon_id',
                                'pabellon_id', 
                                'salon_capacidad',
                                'pabellon_descripcion'
                              ];
                              return !hiddenFields.includes(key.toLowerCase());
                            })
                            .map(([key, value]) => {
                              const isUrl = typeof value === 'string' && value.startsWith('http');
                              
                              return (
                                <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1">
                                  <span className="text-sm font-medium text-gray-600 min-w-[150px]">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                  </span>
                                  {isUrl ? (
                                    <a 
                                      href={value} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                                    >
                                      Ver archivo adjunto
                                    </a>
                                  ) : (
                                    <span className="text-sm text-gray-800 break-words">
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
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">
                  Ingresa tu código para consultar tus reportes
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