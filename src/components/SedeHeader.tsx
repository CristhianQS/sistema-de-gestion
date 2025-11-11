import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string | null;
  imagen_fondo_url: string | null;
  activo: boolean;
}

interface Props {
  onLoginClick: () => void;
  showLoginButton?: boolean;
}

const SedeHeader: React.FC<Props> = ({ onLoginClick, showLoginButton = true }) => {
  const [sedesList, setSedesList] = useState<Sede[]>([]);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadSedes();
  }, []);

  const loadSedes = async () => {
    try {
      const { data, error } = await supabase
        .from('sedes')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      const sedesData = data || [];
      setSedesList(sedesData);

      // Cargar sede guardada en localStorage o seleccionar la primera
      const savedSedeId = localStorage.getItem('selected_sede_id');
      if (savedSedeId) {
        const saved = sedesData.find(s => s.id.toString() === savedSedeId);
        if (saved) {
          setSelectedSede(saved);
        } else if (sedesData.length > 0) {
          setSelectedSede(sedesData[0]);
        }
      } else if (sedesData.length > 0) {
        setSelectedSede(sedesData[0]);
      }
    } catch (error) {
      console.error('Error al cargar sedes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSede = (sede: Sede) => {
    setSelectedSede(sede);
    localStorage.setItem('selected_sede_id', sede.id.toString());
    setIsDropdownOpen(false);
  };

  const backgroundImage = selectedSede?.imagen_fondo_url 
    ? `url(${selectedSede.imagen_fondo_url})`
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return (
    <header className="sticky top-0 z-10">
      {/* Barra superior azul UPEU */}
      <div 
        className="shadow-md"
        style={{ backgroundColor: '#023052' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Selector de Sede */}
          <div className="relative">
            {loading ? (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
                Cargando...
              </div>
            ) : (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium flex items-center space-x-2 border border-white border-opacity-30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{selectedSede ? selectedSede.nombre : 'Seleccionar Sede'}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Dropdown */}
            {isDropdownOpen && sedesList.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 z-50">
                {sedesList.map((sede) => (
                  <button
                    key={sede.id}
                    onClick={() => handleSelectSede(sede)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start space-x-3 ${
                      selectedSede?.id === sede.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <svg 
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        selectedSede?.id === sede.id ? 'text-blue-600' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        selectedSede?.id === sede.id ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {sede.nombre}
                      </div>
                      <div className="text-sm text-gray-500">{sede.ciudad}</div>
                      {sede.direccion && (
                        <div className="text-xs text-gray-400 mt-0.5">{sede.direccion}</div>
                      )}
                    </div>
                    {selectedSede?.id === sede.id && (
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón Login/Acceso */}
          {showLoginButton && (
            <button
              onClick={onLoginClick}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium border border-white border-opacity-30"
            >
              Acceso
            </button>
          )}
        </div>
      </div>

      {/* Imagen de fondo detrás del contenido */}
      {selectedSede?.imagen_fondo_url && (
        <div 
          className="w-full h-64 relative overflow-hidden"
          style={{
            backgroundImage: `url(${selectedSede.imagen_fondo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay sutil para mejorar legibilidad del contenido sobre la imagen */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100"></div>
        </div>
      )}
    </header>
  );
};

export default SedeHeader;