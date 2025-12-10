import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ModalSeleccionarUbicacion from './ModalSeleccionarUbicacion';
import SupabaseImageUploader from '../SupabaseImageUploader';

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

interface SelectionOption {
  id: number;
  area_id: number;
  group_name: string;
  option_value: string;
  option_label: string;
  order_index: number;
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
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFields();
      loadSelectionOptions();
    }
  }, [isOpen, areaId]);

  const loadFields = async () => {
    setLoading(true);
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

  const loadSelectionOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('selection_options')
        .select('*')
        .eq('area_id', areaId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSelectionOptions(data || []);
    } catch (error) {
      console.error('Error al cargar opciones de selección:', error);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleUbicacionSelected = (pabellon: Pabellon, salon: Salon) => {
    setSelectedPabellon(pabellon);
    setSelectedSalon(salon);
    setIsUbicacionModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar ubicación
    if (!selectedPabellon || !selectedSalon) {
      setError('Debes seleccionar la ubicación del problema (Pabellón y Salón)');
      return;
    }

    // Validar campos requeridos
    for (const field of fields) {
      if (field.is_required && !formData[field.field_name]) {
        setError(`El campo "${field.field_label}" es obligatorio`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // ✅ CORRECCIÓN: Separar la ubicación de los campos del formulario
      const submissionData = {
        area_id: areaId,
        alumno_id: alumno.id,
        alumno_dni: alumno.dni || '',
        alumno_codigo: alumno.codigo || 0,
        alumno_nombre: alumno.estudiante || '',
        form_data: {
          // Campos del formulario dinámico
          ...formData,
          // Ubicación guardada al mismo nivel (NO como un objeto separado)
          pabellon_id: selectedPabellon.id,
          pabellon_nombre: selectedPabellon.nombre,
          pabellon_descripcion: selectedPabellon.descripcion,
          salon_id: selectedSalon.id,
          salon_nombre: selectedSalon.nombre,
          salon_capacidad: selectedSalon.capacidad
        },
        status: 'pending'
      };

      console.log('📤 Enviando datos:', submissionData); // Debug

      const { error: submitError } = await supabase
        .from('area_submissions')
        .insert([submissionData]);

      if (submitError) throw submitError;

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error:', error);
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
        // Determinar si las opciones están en JSON o en selection_options
        let options: string[] = [];

        if (field.options) {
          try {
            // Intentar parsear como JSON primero
            const parsed = JSON.parse(field.options);
            if (Array.isArray(parsed)) {
              // Las opciones están guardadas como JSON array
              options = parsed.filter(opt => opt && opt.trim() !== '');
            } else {
              // Es un nombre de grupo, buscar en selection_options
              const fieldGroupOptions = selectionOptions.filter(
                opt => opt.group_name === field.options
              );
              options = fieldGroupOptions.map(opt => opt.option_value);
            }
          } catch (e) {
            // No es JSON, es un nombre de grupo
            const fieldGroupOptions = selectionOptions.filter(
              opt => opt.group_name === field.options
            );
            options = fieldGroupOptions.map(opt => opt.option_value);
          }
        }

        const isOtrosSelected = formData[field.field_name] === 'otros';

        return (
          <div className="space-y-3">
            <select
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={field.is_required}
            >
              <option value="">Selecciona una opción</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {/* Mostrar campo de texto adicional cuando se selecciona "Otros" */}
            {isOtrosSelected && (
              <div className="mt-3 animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especifica (Otros)
                </label>
                <textarea
                  value={formData[`${field.field_name}_otros_text`] || ''}
                  onChange={(e) => handleInputChange(`${field.field_name}_otros_text`, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe tu respuesta aquí..."
                  required={isOtrosSelected}
                />
              </div>
            )}
          </div>
        );

      case 'image':
      case 'file':
        // Usar SupabaseImageUploader
        return (
          <SupabaseImageUploader
            currentImageUrl={formData[field.field_name] || ''}
            onImageUploaded={(url) => handleInputChange(field.field_name, url)}
            onImageRemoved={() => handleInputChange(field.field_name, '')}
            folder="formularios"
            label=""
            required={field.is_required}
            maxSizeMB={5}
          />
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
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-4">
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
                            {selectedPabellon.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">
                                {selectedPabellon.descripcion}
                              </p>
                            )}
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
                      className="w-full border-2 border-dashed border-blue-400 rounded-lg p-6 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-blue-600 font-medium">Seleccionar Pabellón y Salón</p>
                      <p className="text-sm text-gray-500">Haz clic para elegir la ubicación</p>
                    </button>
                  )}
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    disabled={submitting}
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
      {isUbicacionModalOpen && (
        <ModalSeleccionarUbicacion
          isOpen={isUbicacionModalOpen}
          onClose={() => setIsUbicacionModalOpen(false)}
          onSelect={handleUbicacionSelected}
        />
      )}
    </>
  );
};

export default ModalFormularioArea;