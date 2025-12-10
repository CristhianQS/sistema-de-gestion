import React from 'react';

interface Opcion {
  id: string | number;
  texto: string;
  descripcion?: string;
  icono?: string;
}

interface OpcionesMenuProps {
  titulo: string;
  opciones: Opcion[];
  onSeleccionar: (id: string | number) => void;
  tipo?: 'botones' | 'lista';
}

/**
 * Componente para mostrar opciones de manera visual en el chatbot
 */
export const OpcionesMenu: React.FC<OpcionesMenuProps> = ({
  titulo,
  opciones,
  onSeleccionar,
  tipo = 'botones'
}) => {
  if (tipo === 'botones') {
    return (
      <div className="my-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">{titulo}</p>
        <div className="flex flex-wrap gap-2">
          {opciones.map((opcion) => (
            <button
              key={opcion.id}
              onClick={() => onSeleccionar(opcion.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                       transition-colors duration-200 text-sm font-medium shadow-sm
                       hover:shadow-md active:scale-95 transform"
            >
              {opcion.icono && <span className="mr-2">{opcion.icono}</span>}
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-700 mb-3">{titulo}</p>
      <div className="space-y-2">
        {opciones.map((opcion, index) => (
          <button
            key={opcion.id}
            onClick={() => onSeleccionar(opcion.id)}
            className="w-full text-left p-3 bg-white hover:bg-blue-50 border border-gray-200
                     hover:border-blue-300 rounded-lg transition-all duration-200
                     hover:shadow-sm group"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 group-hover:bg-blue-200
                             text-blue-700 rounded-full flex items-center justify-center
                             text-sm font-bold transition-colors">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{opcion.texto}</p>
                {opcion.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{opcion.descripcion}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente para mostrar el progreso del flujo
 */
interface ProgresoChatbotProps {
  pasoActual: number;
  pasos: string[];
}

export const ProgresoChatbot: React.FC<ProgresoChatbotProps> = ({ pasoActual, pasos }) => {
  return (
    <div className="my-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Progreso del Reporte</span>
        <span className="text-xs font-bold text-blue-600">{pasoActual + 1}/{pasos.length}</span>
      </div>
      <div className="flex gap-1">
        {pasos.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              index <= pasoActual
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        {pasos[pasoActual]}
      </p>
    </div>
  );
};

/**
 * Componente para mostrar mensaje de ayuda
 */
interface MensajeAyudaProps {
  mensaje: string;
  tipo?: 'info' | 'warning' | 'success' | 'error';
}

export const MensajeAyuda: React.FC<MensajeAyudaProps> = ({ mensaje, tipo = 'info' }) => {
  const estilos = {
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800'
  };

  const iconos = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };

  return (
    <div className={`my-2 p-3 rounded-lg border ${estilos[tipo]}`}>
      <p className="text-sm flex items-start gap-2">
        <span>{iconos[tipo]}</span>
        <span>{mensaje}</span>
      </p>
    </div>
  );
};
