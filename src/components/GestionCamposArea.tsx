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
  order_index: number;
}

interface FieldOption {
  id?: number;
  field_id: number;
  option_value: string;
  option_label: string;
  order_index: number;
}

interface SelectionOption {
  id?: number;
  area_id: number;
  group_name: string;
  option_value: string;
  option_label: string;
  order_index: number;
}

interface Props {
  areaId: number;
  areaName: string;
  onClose: () => void;
}

const GestionCamposArea: React.FC<Props> = ({ areaId, areaName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'opciones' | 'campos'>('opciones');
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
    order_index: 0
  });
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [newOption, setNewOption] = useState({ label: '', value: '' });

  // Estados para opciones de selección
  const [selectionOptions, setSelectionOptions] = useState<SelectionOption[]>([]);
  const [optionGroups, setOptionGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newSelectionOption, setNewSelectionOption] = useState({ label: '', value: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFields();
    loadSelectionOptions();
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

  const loadSelectionOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('selection_options')
        .select('*')
        .eq('area_id', areaId)
        .order('group_name', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Verificar si existe la opción "Otros"
      const hasOtrosOption = data?.some(opt =>
        opt.group_name === 'default' && opt.option_value === 'otros'
      );

      // Si no existe la opción "Otros", crearla automáticamente
      if (!hasOtrosOption) {
        const { error: insertError } = await supabase
          .from('selection_options')
          .insert([{
            area_id: areaId,
            group_name: 'default',
            option_value: 'otros',
            option_label: 'Otros',
            order_index: 999 // Ponerla al final
          }]);

        if (insertError) {
          console.error('Error al crear opción "Otros":', insertError);
        } else {
          // Recargar las opciones para incluir "Otros"
          const { data: updatedData, error: reloadError } = await supabase
            .from('selection_options')
            .select('*')
            .eq('area_id', areaId)
            .order('group_name', { ascending: true })
            .order('order_index', { ascending: true });

          if (!reloadError) {
            setSelectionOptions(updatedData || []);
          }
        }
      } else {
        setSelectionOptions(data || []);
      }

      // Extraer nombres de grupos únicos
      const groups = [...new Set(data?.map(opt => opt.group_name) || [])];
      setOptionGroups(groups);
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0]);
      }
    } catch (error) {
      console.error('Error al cargar opciones de selección:', error);
    }
  };

  const loadFieldOptions = async (fieldId: number) => {
    try {
      const { data, error } = await supabase
        .from('field_options')
        .select('*')
        .eq('field_id', fieldId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFieldOptions(data || []);
    } catch (error) {
      console.error('Error al cargar opciones:', error);
      setFieldOptions([]);
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
      order_index: 0
    });
    setFieldOptions([]);
    setNewOption({ label: '', value: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.field_label?.trim()) {
      setError('El nombre del campo es requerido');
      return;
    }

    // Validar que si es select, haya seleccionado un grupo de opciones
    if (formData.field_type === 'select' && !formData.options?.trim()) {
      setError('Debes seleccionar un grupo de opciones para el campo de selección');
      return;
    }

    try {
      // Generar nombre interno automáticamente desde la etiqueta
      const autoFieldName = formData.field_label!.trim().toLowerCase().replace(/\s+/g, '_');

      const fieldData = {
        area_id: areaId,
        field_name: autoFieldName,
        field_type: formData.field_type!,
        field_label: formData.field_label!.trim(),
        is_required: formData.is_required!,
        options: formData.options?.trim() || null,
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

  const handleAddOption = () => {
    if (!newOption.label.trim() || !newOption.value.trim()) {
      setError('Debes completar la etiqueta y el valor de la opción');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Verificar que no exista ya una opción con el mismo valor
    if (fieldOptions.some(opt => opt.option_value === newOption.value.trim())) {
      setError('Ya existe una opción con ese valor');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const newFieldOption: FieldOption = {
      field_id: 0, // Se asignará al guardar
      option_value: newOption.value.trim(),
      option_label: newOption.label.trim(),
      order_index: fieldOptions.length
    };

    setFieldOptions([...fieldOptions, newFieldOption]);
    setNewOption({ label: '', value: '' });
  };

  const handleRemoveOption = (index: number) => {
    const updated = fieldOptions.filter((_, i) => i !== index);
    setFieldOptions(updated);
  };

  // Funciones para gestionar opciones de selección
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Debes ingresar un nombre para el grupo');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (optionGroups.includes(newGroupName.trim())) {
      setError('Ya existe un grupo con ese nombre');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setOptionGroups([...optionGroups, newGroupName.trim()]);
    setSelectedGroup(newGroupName.trim());
    setNewGroupName('');
    setSuccess('Grupo creado correctamente');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddSelectionOption = async () => {
    if (!newSelectionOption.label.trim()) {
      setError('Debes ingresar una etiqueta para la opción');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Usar grupo por defecto
      const defaultGroup = 'default';
      const optionsInGroup = selectionOptions.filter(opt => opt.group_name === defaultGroup);
      const orderIndex = optionsInGroup.length;

      // Generar valor automáticamente desde la etiqueta
      const autoValue = newSelectionOption.label.trim().toLowerCase().replace(/\s+/g, '_');

      const { error: insertError } = await supabase
        .from('selection_options')
        .insert([{
          area_id: areaId,
          group_name: defaultGroup,
          option_value: autoValue,
          option_label: newSelectionOption.label.trim(),
          order_index: orderIndex
        }]);

      if (insertError) throw insertError;

      setNewSelectionOption({ label: '', value: '' });
      setSuccess('Opción agregada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      await loadSelectionOptions();
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al agregar la opción');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteSelectionOption = async (optionId: number, optionValue: string) => {
    // Prevenir eliminación de la opción "Otros"
    if (optionValue === 'otros') {
      setError('La opción "Otros" no se puede eliminar');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const { error } = await supabase
        .from('selection_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      setSuccess('Opción eliminada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      await loadSelectionOptions();
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar la opción');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!window.confirm(`¿Eliminar el grupo "${groupName}" y todas sus opciones?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('selection_options')
        .delete()
        .eq('area_id', areaId)
        .eq('group_name', groupName);

      if (error) throw error;

      setSuccess('Grupo eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      await loadSelectionOptions();

      // Seleccionar otro grupo si existe
      const remainingGroups = optionGroups.filter(g => g !== groupName);
      if (remainingGroups.length > 0) {
        setSelectedGroup(remainingGroups[0]);
      } else {
        setSelectedGroup('');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al eliminar el grupo');
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
          <h2 className="text-2xl font-bold text-white">Configuración de: {areaName}</h2>
          <p className="text-gray-400 mt-1">Gestiona opciones y campos del área</p>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('opciones')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'opciones'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Opciones de Selección
        </button>
        <button
          onClick={() => setActiveTab('campos')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'campos'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Campos del Área
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

      {/* Contenido de pestaña: Opciones de Selección */}
      {activeTab === 'opciones' && (
        <div className="space-y-4">
          {/* Agregar nueva opción */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Crear Opciones</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newSelectionOption.label}
                onChange={(e) => setNewSelectionOption({ ...newSelectionOption, label: e.target.value })}
                placeholder="Nombre de la opción (ej: Alta, Media, Baja)"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSelectionOption()}
              />
              <button
                onClick={handleAddSelectionOption}
                className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-400 transition-colors text-sm font-medium"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Lista de opciones horizontales */}
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Opciones Disponibles</h3>
            {selectionOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectionOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm text-white border transition-colors ${
                      option.option_value === 'otros'
                        ? 'bg-yellow-900 bg-opacity-30 border-yellow-600'
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span>{option.option_label}</span>
                    {option.option_value !== 'otros' && (
                      <button
                        onClick={() => handleDeleteSelectionOption(option.id!, option.option_value)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {option.option_value === 'otros' && (
                      <span className="text-yellow-500 text-xs ml-1" title="Opción predeterminada">🔒</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay opciones creadas</p>
            )}
          </div>
        </div>
      )}

      {/* Contenido de pestaña: Campos del Área */}
      {activeTab === 'campos' && (
        <>
          {/* Botón nuevo campo */}
          <div className="flex justify-end">
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
        </>
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
                    Nombre del campo *
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

                {/* Tipo de campo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de campo *
                  </label>
                  <select
                    value={formData.field_type}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      // Si selecciona "select", automáticamente asignar el grupo "default"
                      if (newType === 'select') {
                        setFormData({ ...formData, field_type: newType, options: 'default' });
                      } else {
                        setFormData({ ...formData, field_type: newType, options: null });
                      }
                    }}
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

                {/* Vista previa de opciones (solo para select) */}
                {formData.field_type === 'select' && (
                  <div className="border border-gray-600 rounded-lg p-4 bg-gray-750">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Opciones disponibles
                    </label>

                    {selectionOptions.length > 0 ? (
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-400 mb-2">
                          Este campo usará las siguientes opciones:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectionOptions
                            .filter(opt => opt.group_name === 'default')
                            .map((option, index) => (
                              <div key={index} className="inline-flex items-center bg-gray-600 px-2 py-1 rounded text-xs text-white">
                                {option.option_label}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 mb-2">No hay opciones disponibles</p>
                        <p className="text-xs text-gray-500">
                          Ve a la pestaña "Opciones de Selección" para crear opciones primero
                        </p>
                      </div>
                    )}
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