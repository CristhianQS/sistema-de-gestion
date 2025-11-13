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
      {/* Header simple sin selector de sede */}
      <header className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: '#023052' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">Sistema UPEU</h1>
          </div>
          <button
            onClick={() => setIsModalLoginOpen(true)}
            className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium border border-white border-opacity-30"
          >
            Acceso
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Sistema de Gestión Universitaria
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Selecciona un área y completa los formularios
          </p>
          <p className="text-gray-500">
            Explora las diferentes áreas disponibles
          </p>
        </div>

        {/* Grid de áreas */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Cargando áreas...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                onClick={() => handleAreaClick(area)}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
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
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{area.name}</h3>
                  <p className="text-gray-600 text-sm">{area.description || 'Sin descripción'}</p>
                  <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Completar Formulario
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
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