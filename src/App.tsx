import React, { useState, useEffect } from 'react';
import ModalLogin from './components/ModalLogin';
import ModalVerificarAlumno from './components/modals/ModalVerificarAlumno';
import ModalFormularioArea from './components/modals/ModalFormularioArea';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import VistaBlack from './pages/VistaBlack';
import VistaOro from './pages/VistaOro';
import VistaPlata from './pages/VistaPlata';

interface Area {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface DataAlumno {
  id: number;
  dni: string | null;
  codigo: number | null;
  estudiante: string | null;
  carrera_profesional: string | null;
  facultad: string | null;
  campus: string | null;
  modalidad: string | null;
  ciclo: number | null;
  grupo: string | null;
  celular: string | null;
  religion: string | null;
  fecha_nacimiento: string | null;
  correo: string | null;
  pais: string | null;
}

const App: React.FC = () => {
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalVerificarOpen, setIsModalVerificarOpen] = useState(false);
  const [isModalFormularioOpen, setIsModalFormularioOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [verifiedAlumno, setVerifiedAlumno] = useState<DataAlumno | null>(null);
  const { user } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = (area: Area) => {
    setSelectedArea(area);
    setIsModalVerificarOpen(true);
  };

  const handleAlumnoVerified = (alumno: DataAlumno) => {
    setVerifiedAlumno(alumno);
    setIsModalVerificarOpen(false);
    setIsModalFormularioOpen(true);
  };

  const handleCloseFormulario = () => {
    setIsModalFormularioOpen(false);
    setSelectedArea(null);
    setVerifiedAlumno(null);
  };

  // Redirigir según el rol del usuario
  if (user) {
    switch (user.role) {
      case 'admin_black':
        return <VistaBlack />;
      case 'admin_oro':
        return <VistaOro />;
      case 'admin_plata':
        return <VistaPlata />;
      default:
        return <VistaPlata />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end">
          <button
            onClick={() => setIsModalLoginOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            ¡Proyecto React + TypeScript + Tailwind!
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Sistema de Gestión con Roles de Usuario
          </p>
          <p className="text-gray-500">
            Explora nuestras áreas disponibles y completa los formularios
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando áreas...</p>
          </div>
        )}

        {/* Sin áreas */}
        {!loading && areas.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay áreas disponibles</h3>
            <p className="text-gray-500">Las áreas aparecerán aquí cuando se creen</p>
          </div>
        )}

        {/* Grid de Áreas */}
        {!loading && areas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                onClick={() => handleAreaClick(area)}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                {/* Imagen */}
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={area.image_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}
                    alt={area.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Error+al+cargar';
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {area.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {area.description || 'Sin descripción disponible'}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Completar formulario</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-sm">
            Sistema de Gestión de Áreas - {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Modales */}
      <ModalLogin 
        isOpen={isModalLoginOpen} 
        onClose={() => setIsModalLoginOpen(false)} 
      />
      
      {selectedArea && (
        <ModalVerificarAlumno
          isOpen={isModalVerificarOpen}
          onClose={() => {
            setIsModalVerificarOpen(false);
            setSelectedArea(null);
          }}
          onVerified={handleAlumnoVerified}
          areaName={selectedArea.name}
        />
      )}

      {selectedArea && verifiedAlumno && (
        <ModalFormularioArea
          isOpen={isModalFormularioOpen}
          onClose={handleCloseFormulario}
          areaId={selectedArea.id}
          areaName={selectedArea.name}
          alumno={verifiedAlumno}
        />
      )}
    </div>
  );
};

export default App;