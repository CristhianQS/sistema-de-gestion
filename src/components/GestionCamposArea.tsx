import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AreaField {
  id?: number;
  area_id: number;
  field_name: string;
  field_type: 'text' | 'textarea' | 'file' | 'image' | 'date' | 'select';
  field_label: string;
  is_required: boolean;
  options: string | null;
  placeholder: string | null;
  order_index: number;
}

interface Props {
  areaId: number;
  areaName: string;
  onClose: () => void;
}

const GestionCamposArea: React.FC<Props> = ({ areaId, areaName, onClose }) => {
  const [fields, setFields] = useState<AreaField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<AreaField | null>(null);
  const [formData, setFormData] = useState<Partial<AreaField>>({
    field_name: '',
    field_type: 'text',
    field_label: '',
    is_required: true,
    options: null,
    placeholder: '',
    order_index: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFields();
  }, [areaId]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (field?: AreaField) => {
    if (field) {
      setEditingField(field);
      setFormData(field);
    } else {
      setEditingField(null);
      setFormData({
        field_name: '',
        field_type: 'text',
        field_label: '',
        is_required: true,
        options: null,
        placeholder: '',
        order_index: fields.length
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_type: 'text',
      field_label: '',
      is_required: true,
      options: null,
      placeholder: '',
      order_index: 0
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.field_label?.trim()) {
      setError('La etiqueta del campo es requerida');
      return;
    }

    if (!formData.field_name?.trim()) {
      setError('El nombre del campo es requerido');
      return;
    }

    try {
      const fieldData = {
        area_id: areaId,
        field_name: formData.field_name!.trim(),
        field_type: formData.field_type!,
        field_label: formData.field_label!.trim(),
        is_required: formData.is_required!,
        options: formData.options,
        placeholder: formData.placeholder?.trim() || null,
        order_index: formData.order_index!
      };

      if (editingField) {
        const { error } = await supabase
          .from('area_fields')
          .update(fieldData)
          .eq('id', editingField.id);

        if (error) throw error;
        setSuccess('Campo actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('area_fields')
          .insert([fieldData]);

        if (error) throw error;
        setSuccess('Campo creado correctamente');
      }

      await loadFields();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al guardar el campo');
    }
  };

  const handleDelete = async (field: AreaField) => {
    if (!window.confirm(`¿Eliminar el campo "${field.field_label}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('area_fields')
        .delete()
        .eq('id', field.id);

      if (error) throw error;
      
      setSuccess('Campo eliminado correctamente');
      await loadFields();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el campo');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'textarea':
        return '📄';
      case 'file':
        return '📎';
      case 'image':
        return '🖼️';
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      default:
        return '❓';
    }
  };

  const getFieldTypeName = (type: string) => {
    const types: Record<string, string> = {
      text: 'Texto corto',
      textarea: 'Texto largo',
      file: 'Archivo',
      image: 'Imagen',
      date: 'Fecha',
      select: 'Selección'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white mb-2 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver a áreas</span>
          </button>
          <h2 className="text-2xl font-bold text-white">Campos de: {areaName}</h2>
          <p className="text-gray-400 mt-1">Define qué información solicitará esta área</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-medium flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Campo</span>
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de campos */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando campos...</div>
      ) : fields.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay campos configurados</h3>
          <p className="text-gray-500">Crea campos para que los alumnos puedan completar información</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-yellow-500 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-3xl">{getFieldTypeIcon(field.field_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">{field.field_label}</h3>
                      {field.is_required && (
                        <span className="text-xs bg-red-500 bg-opacity-20 text-red-300 px-2 py-1 rounded">
                          Obligatorio
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-400">
                        Tipo: <span className="text-yellow-500">{getFieldTypeName(field.field_type)}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Orden: {index + 1}
                      </p>
                    </div>
                    {field.placeholder && (
                      <p className="text-xs text-gray-500 mt-1">
                        Placeholder: "{field.placeholder}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(field)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(field)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingField ? 'Editar Campo' : 'Nuevo Campo'}
                </h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Etiqueta */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Etiqueta del campo *
                  </label>
                  <input
                    type="text"
                    value={formData.field_label}
                    onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    placeholder="Ej: Subir foto, Describir problema..."
                    required
                  />
                </div>

                {/* Nombre del campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre interno del campo *
                  </label>
                  <input
                    type="text"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    placeholder="ej: foto_usuario, descripcion_problema"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Sin espacios, usa guiones bajos</p>
                </div>

                {/* Tipo de campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de campo *
                  </label>
                  <select
                    value={formData.field_type}
                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                  >
                    <option value="text">📝 Texto corto</option>
                    <option value="textarea">📄 Texto largo (descripción)</option>
                    <option value="image">🖼️ Subir imagen</option>
                    <option value="file">📎 Subir archivo</option>
                    <option value="date">📅 Fecha</option>
                    <option value="select">📋 Selección (opciones)</option>
                  </select>
                </div>

                {/* Placeholder */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Texto de ayuda (placeholder)
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder || ''}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    placeholder="Texto de ayuda para el usuario"
                  />
                </div>

                {/* Opciones (solo para select) */}
                {formData.field_type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Opciones (una por línea)
                    </label>
                    <textarea
                      value={formData.options || ''}
                      onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white resize-none"
                      placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
                    />
                  </div>
                )}

                {/* Requerido */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="w-5 h-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="is_required" className="text-sm font-medium text-gray-300">
                    Campo obligatorio
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 text-black px-4 py-3 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                  >
                    {editingField ? 'Actualizar' : 'Crear Campo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCamposArea;