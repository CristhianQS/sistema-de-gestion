import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface DataAlumno {
  id: number;
  dni: string | null;
  codigo: number | null;
  estudiante: string | null;
  carrera_profesional: string | null;
  facultad: string | null;
  modalidad: string | null;
  ciclo: number | null;
  grupo: string | null;
  celular: string | null;
  religion: string | null;
  fecha_nacimiento: string | null;
  correo: string | null;
  pais: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (alumno: DataAlumno) => void;
  areaName: string;
}

const ModalVerificarAlumno: React.FC<Props> = ({ isOpen, onClose, onVerified, areaName }) => {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedValue = searchValue.trim();
      console.log('Buscando estudiante con:', trimmedValue);

      // Primero intentar buscar por DNI (texto)
      let { data, error: searchError } = await supabase
        .from('data_alumnos')
        .select('*')
        .eq('dni', trimmedValue)
        .limit(1)
        .single();

      console.log('Búsqueda por DNI:', { data, error: searchError });

      // Si no se encuentra por DNI, buscar por código (número)
      if (!data) {
        const codigoNum = parseInt(trimmedValue);
        
        if (!isNaN(codigoNum)) {
          const { data: dataCode, error: errorCode } = await supabase
            .from('data_alumnos')
            .select('*')
            .eq('codigo', codigoNum)
            .limit(1)
            .single();
          
          data = dataCode;
          searchError = errorCode;
          console.log('Búsqueda por código:', { data, error: searchError });
        }
      }

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error de Supabase:', searchError);
        setError('Error al buscar el estudiante en la base de datos');
        setLoading(false);
        return;
      }

      if (!data) {
        setError('No se encontró ningún estudiante con ese DNI o código');
        setLoading(false);
        return;
      }

      console.log('✅ Estudiante encontrado:', data);
      onVerified(data);
      setSearchValue('');
      setError('');
    } catch (error: any) {
      console.error('Error exception:', error);
      setError('Error inesperado al verificar el estudiante');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchValue('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Verificación de Estudiante</h3>
              <p className="text-sm text-gray-600 mt-1">{areaName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Ingresa tu DNI o Código de estudiante</p>
                <p className="text-xs text-blue-700 mt-1">
                  Necesitamos verificar tu identidad antes de continuar
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI o Código de Estudiante
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 73788334 o 201422107"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Prueba con: <strong>73788334</strong> (DNI) o <strong>201422107</strong> (Código)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalVerificarAlumno;