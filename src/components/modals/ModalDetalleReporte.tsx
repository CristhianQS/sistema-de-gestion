import React, { useState } from 'react';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reporte: Reporte;
  onUpdateStatus: (reporteId: number, newStatus: string) => Promise<void>;
}

const ModalDetalleReporte: React.FC<Props> = ({ isOpen, onClose, reporte, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

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

  const statusInfo = getStatusInfo(reporte.status);

  const handleChangeStatus = async (newStatus: string) => {
    setUpdating(true);
    await onUpdateStatus(reporte.id, newStatus);
    setUpdating(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header con barra de progreso */}
        <div>
          <div className="h-3 bg-gray-200">
            <div
              className={`h-full ${statusInfo.color} transition-all duration-500`}
              style={{ width: `${statusInfo.progress}%` }}
            />
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-800">Detalle del Reporte</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Reportado el {formatDate(reporte.submitted_at)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Información del Estudiante */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Estudiante
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Nombre</p>
                <p className="font-semibold text-gray-800">{reporte.alumno_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Código</p>
                <p className="font-semibold text-gray-800">{reporte.alumno_codigo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">DNI</p>
                <p className="font-semibold text-gray-800">{reporte.alumno_dni}</p>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación del Problema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Área</p>
                <p className="font-semibold text-gray-800">{reporte.area_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Pabellón</p>
                <p className="font-semibold text-gray-800">{reporte.form_data?.pabellon_nombre || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Salón</p>
                <p className="font-semibold text-gray-800">{reporte.form_data?.salon_nombre || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Datos del Formulario */}
          <div className="space-y-4 mb-6">
            <h4 className="font-bold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detalles del Reporte
            </h4>

            {Object.entries(reporte.form_data).map(([key, value]) => {
              // Omitir campos de pabellón y salón
              if (key.includes('pabellon') || key.includes('salon')) return null;

              // Si es una URL de imagen
              if (typeof value === 'string' && (value.startsWith('http') && (value.includes('image') || value.includes('img') || value.includes('.jpg') || value.includes('.png')))) {
                return (
                  <div key={key} className="border rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">{key}</p>
                    <img
                      src={value}
                      alt={key}
                      className="max-w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                );
              }

              return (
                <div key={key} className="border rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">{key}</p>
                  <p className="text-gray-900">{String(value)}</p>
                </div>
              );
            })}
          </div>

          {/* Cambiar Estado */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-800 mb-3">Cambiar Estado</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleChangeStatus('pending')}
                disabled={updating || reporte.status === 'pending'}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  reporte.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                } disabled:opacity-50`}
              >
                Recibido
              </button>
              <button
                onClick={() => handleChangeStatus('in_progress')}
                disabled={updating || reporte.status === 'in_progress'}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  reporte.status === 'in_progress'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                En Proceso
              </button>
              <button
                onClick={() => handleChangeStatus('resolved')}
                disabled={updating || reporte.status === 'resolved'}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                  reporte.status === 'resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                Arreglado
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleReporte;