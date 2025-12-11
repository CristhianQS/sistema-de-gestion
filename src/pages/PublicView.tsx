import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalLogin from '../components/ModalLogin';
import ModalVerificarAlumno from '../components/modals/ModalVerificarAlumno';
import ModalFormularioArea from '../components/modals/ModalFormularioArea';
import StudentReportsModal from '../components/StudentReportsModal';
import ChatbotAsistente from '../features/chatbot/components/ChatbotAsistente';
import { useAuth } from '../context/AuthContext';
import type { Area, DataAlumno } from '../lib/supabase';
import type { Docente } from '../services/database/docentes.service';
import { getAllAreasUnpaginated } from '../services/database';
import { IMAGE_CONFIG } from '../constants';

// Interfaz para usuario verificado (puede ser alumno o docente)
interface VerifiedUser {
  data: DataAlumno | Docente;
  tipo: 'alumno' | 'docente';
}

const PublicView: React.FC = () => {
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalVerificarOpen, setIsModalVerificarOpen] = useState(false);
  const [isModalFormularioOpen, setIsModalFormularioOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAreas();
  }, []);

  // Redirigir si hay un usuario autenticado
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin_black':
          navigate('/admin/black', { replace: true });
          break;
        case 'admin_oro':
          navigate('/admin/oro', { replace: true });
          break;
        case 'admin_plata':
          navigate('/admin/plata', { replace: true });
          break;
      }
    }
  }, [user, navigate]);

  const loadAreas = async () => {
    try {
      const data = await getAllAreasUnpaginated();
      setAreas(data);
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

  const handleUserVerified = (user: VerifiedUser) => {
    setVerifiedUser(user);
    setIsModalVerificarOpen(false);
    setIsModalFormularioOpen(true);
  };

  const handleCloseFormulario = () => {
    setIsModalFormularioOpen(false);
    setSelectedArea(null);
    setVerifiedUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con botones Mis Reportes y Acceso */}
      <header className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: '#023052' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">Sistema UPEU</h1>
          </div>

          {/* Contenedor de botones */}
          <div className="flex items-center gap-3">
            {/* Botón Mis Reportes */}
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
              title="Consultar mis reportes"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Mis Reportes</span>
            </button>

            {/* Botón Acceso */}
            <button
              onClick={() => setIsModalLoginOpen(true)}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all font-medium border border-white border-opacity-30"
            >
              Acceso
            </button>
          </div>
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
                    src={area.image_url || IMAGE_CONFIG.PLACEHOLDER}
                    alt={area.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = IMAGE_CONFIG.ERROR_PLACEHOLDER;
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
          onVerified={handleUserVerified}
          areaName={selectedArea.name}
        />
      )}

      {selectedArea && verifiedUser && (
        <ModalFormularioArea
          isOpen={isModalFormularioOpen}
          onClose={handleCloseFormulario}
          areaId={selectedArea.id}
          areaName={selectedArea.name}
          verifiedUser={verifiedUser}
        />
      )}

      <StudentReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />

      {/* Chatbot Asistente */}
      <ChatbotAsistente />
    </div>
  );
};

export default PublicView;
