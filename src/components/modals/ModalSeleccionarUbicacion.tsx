import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Pabellon {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
}

interface Salon {
  id: number;
  pabellon_id: number;
  nombre: string;
  capacidad: number | null;
  descripcion: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pabellon: Pabellon, salon: Salon) => void;
}

const ModalSeleccionarUbicacion: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const [pabellones, setPabellones] = useState<Pabellon[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [selectedPabellon, setSelectedPabellon] = useState<Pabellon | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // 1: Seleccionar pabellón, 2: Seleccionar salón

  useEffect(() => {
    if (isOpen) {
      loadPabellones();
    }
  }, [isOpen]);

  const loadPabellones = async () => {
    try {
      const { data, error } = await supabase
        .from('pabellones')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setPabellones(data || []);
    } catch (error) {
      console.error('Error al cargar pabellones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalones = async (pabellonId: number) => {
    try {
      const { data, error } = await supabase
        .from('salones')
        .select('*')
        .eq('pabellon_id', pabellonId)
        .order('nombre', { ascending: true });

      if (error) throw error;
      setSalones(data || []);
    } catch (error) {
      console.error('Error al cargar salones:', error);
    }
  };

  const handleSelectPabellon = async (pabellon: Pabellon) => {
    setSelectedPabellon(pabellon);
    await loadSalones(pabellon.id);
    setStep(2);
  };

  const handleSelectSalon = (salon: Salon) => {
    setSelectedSalon(salon);
  };

  const handleConfirm = () => {
    if (selectedPabellon && selectedSalon) {
      onSelect(selectedPabellon, selectedSalon);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedPabellon(null);
    setSelectedSalon(null);
    setStep(1);
    setSalones([]);
    onClose();
  };

  const handleBack = () => {
    setSelectedSalon(null);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                {step === 1 ? 'Selecciona el Pabellón' : 'Selecciona el Salón'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {step === 1 
                  ? 'Elige el pabellón donde se encuentra el problema'
                  : `Pabellón: ${selectedPabellon?.nombre} - Elige el salón específico`
                }
              </p>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Cargando...</div>
            </div>
          ) : (
            <>
              {/* Paso 1: Seleccionar Pabellón */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pabellones.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-600">No hay pabellones disponibles</p>
                    </div>
                  ) : (
                    pabellones.map((pabellon) => (
                      <div
                        key={pabellon.id}
                        onClick={() => handleSelectPabellon(pabellon)}
                        className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                      >
                        {/* Imagen */}
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={pabellon.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                            alt={pabellon.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">
                            {pabellon.nombre}
                          </h4>
                          {pabellon.descripcion && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {pabellon.descripcion}
                            </p>
                          )}
                          <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                            <span>Seleccionar</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Paso 2: Seleccionar Salón */}
              {step === 2 && (
                <div>
                  {/* Info del pabellón seleccionado */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <div className="flex items-start">
                      {selectedPabellon?.imagen_url && (
                        <img
                          src={selectedPabellon.imagen_url}
                          alt={selectedPabellon.nombre}
                          className="w-20 h-20 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <p className="font-bold text-blue-800 text-lg">
                          {selectedPabellon?.nombre}
                        </p>
                        {selectedPabellon?.descripcion && (
                          <p className="text-sm text-blue-700 mt-1">
                            {selectedPabellon.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grid de salones */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {salones.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-600">No hay salones disponibles en este pabellón</p>
                      </div>
                    ) : (
                      salones.map((salon) => (
                        <div
                          key={salon.id}
                          onClick={() => handleSelectSalon(salon)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedSalon?.id === salon.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                              selectedSalon?.id === salon.id ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              <svg 
                                className={`w-6 h-6 ${selectedSalon?.id === salon.id ? 'text-white' : 'text-gray-600'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            </div>
                            <p className="font-bold text-gray-800">{salon.nombre}</p>
                            {salon.capacidad && (
                              <p className="text-xs text-gray-600 mt-1">
                                Cap: {salon.capacidad}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Volver a pabellones</span>
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
              {step === 2 && (
                <button
                  onClick={handleConfirm}
                  disabled={!selectedSalon}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Selección
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarUbicacion;