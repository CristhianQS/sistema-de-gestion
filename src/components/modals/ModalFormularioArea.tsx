import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ModalSeleccionarUbicacion from './ModalSeleccionarUbicacion';

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

interface AreaField {
  id: number;
  field_name: string;
  field_type: 'text' | 'textarea' | 'file' | 'image' | 'date' | 'select';
  field_label: string;
  is_required: boolean;
  options: string | null;
  placeholder: string | null;
}

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
  areaId: number;
  areaName: string;
  alumno: DataAlumno;
}

const ModalFormularioArea: React.FC<Props> = ({ isOpen, onClose, areaId, areaName, alumno }) => {
  const [fields, setFields] = useState<AreaField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isUbicacionModalOpen, setIsUbicacionModalOpen] = useState(false);
  const [selectedPabellon, setSelectedPabellon] = useState<Pabellon | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFields();
    }
  }, [isOpen, areaId]);

  const loadFields = async () => {
    try {
      const { data, error } = await supabase
        .from('area_fields')
        .select('*')
        .eq('area_id', areaId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error al cargar campos:', error);
      setError('Error al cargar el formulario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleUbicacionSelect = (pabellon: Pabellon, salon: Salon) => {
    setSelectedPabellon(pabellon);
    setSelectedSalon(salon);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validar campos requeridos
    for (const field of fields) {
      if (field.is_required && !formData[field.field_name]) {
        setError(`El campo "${field.field_label}" es obligatorio`);
        setSubmitting(false);
        return;
      }
    }

    // Validar que se haya seleccionado pabellón y salón
    if (!selectedPabellon || !selectedSalon) {
      setError('Debes seleccionar un pabellón y un salón');
      setSubmitting(false);
      return;
    }

    try {
      const submission = {
        area_id: areaId,
        alumno_id: alumno.id,
        alumno_dni: alumno.dni || '',
        alumno_codigo: alumno.codigo || 0,
        alumno_nombre: alumno.estudiante || '',
        form_data: {
          ...formData,
          pabellon_id: selectedPabellon.id,
          pabellon_nombre: selectedPabellon.nombre,
          salon_id: selectedSalon.id,
          salon_nombre: selectedSalon.nombre
        },
        status: 'pending'
      };

      const { error } = await supabase
        .from('area_submissions')
        .insert([submission]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al enviar el formulario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setError('');
    setSuccess(false);
    setSelectedPabellon(null);
    setSelectedSalon(null);
    onClose();
  };

  if (!isOpen) return null;

  const renderField = (field: AreaField) => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.field_name] || ''}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={field.placeholder || ''}
            required={field.is_required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.field_name] || ''}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={field.placeholder || ''}
            required={field.is_required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={formData[field.field_name] || ''}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.is_required}
          />
        );

      case 'select':
        const options = field.options ? field.options.split('\n').filter(o => o.trim()) : [];
        return (
          <select
            value={formData[field.field_name] || ''}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.is_required}
          >
            <option value="">Selecciona una opción</option>
            {options.map((option, index) => (
              <option key={index} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );

      case 'image':
      case 'file':
        return (
          <div>
            <input
              type="url"
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={field.placeholder || 'URL del archivo (https://...)'}
              required={field.is_required}
            />
            <p className="text-xs text-gray-500 mt-1">
              Sube tu archivo a un servicio (Imgur, Google Drive, etc.) y pega la URL
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Formulario Enviado!</h3>
          <p className="text-gray-600">Tu información ha sido registrada correctamente</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{areaName}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Estudiante:</strong> {alumno.estudiante}</p>
                  <p><strong>Código:</strong> {alumno.codigo}</p>
                  <p><strong>DNI:</strong> {alumno.dni}</p>
                </div>
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

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Formulario */}
            {fields.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay campos configurados para esta área</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.field_label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                {/* Selección de Ubicación */}
                <div className="border-t pt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ubicación del Problema *
                  </label>
                  
                  {selectedPabellon && selectedSalon ? (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {selectedPabellon.imagen_url && (
                            <img
                              src={selectedPabellon.imagen_url}
                              alt={selectedPabellon.nombre}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-800">
                              {selectedPabellon.nombre} - {selectedSalon.nombre}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedPabellon.descripcion}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsUbicacionModalOpen(true)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsUbicacionModalOpen(true)}
                      className="w-full bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-blue-600 font-medium">Seleccionar Pabellón y Salón</p>
                      <p className="text-xs text-gray-600 mt-1">Haz clic para elegir la ubicación</p>
                    </button>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Enviando...' : 'Enviar Formulario'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Selección de Ubicación */}
      <ModalSeleccionarUbicacion
        isOpen={isUbicacionModalOpen}
        onClose={() => setIsUbicacionModalOpen(false)}
        onSelect={handleUbicacionSelect}
      />
    </>
  );
};

export default ModalFormularioArea;