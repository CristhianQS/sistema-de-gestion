import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Users, Upload, Download, Plus, Edit2, Trash2, Search, X, Save, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as docentesService from '../services/database/docentes.service';
import type { Docente } from '../services/database/docentes.service';

const GestionDocentes: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);
  const [formData, setFormData] = useState<Partial<Docente>>({
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    especialidad: '',
    departamento: '',
    estado: 'activo',
    fecha_ingreso: ''
  });

  // Importación
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: { row: number; dni: string; error: string }[];
  } | null>(null);

  useEffect(() => {
    loadDocentes();
  }, [currentPage, searchTerm]);

  const loadDocentes = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, count } = await docentesService.getAllDocentes(currentPage, pageSize, searchTerm);
      setDocentes(data);
      setTotalCount(count);
    } catch (err: any) {
      console.error('Error al cargar docentes:', err);
      setError(err.message || 'Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (docente?: Docente) => {
    if (docente) {
      setEditingDocente(docente);
      setFormData({
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        dni: docente.dni,
        email: docente.email || '',
        telefono: docente.telefono || '',
        especialidad: docente.especialidad || '',
        departamento: docente.departamento || '',
        estado: docente.estado || 'activo',
        fecha_ingreso: docente.fecha_ingreso || ''
      });
    } else {
      setEditingDocente(null);
      setFormData({
        nombres: '',
        apellidos: '',
        dni: '',
        email: '',
        telefono: '',
        especialidad: '',
        departamento: '',
        estado: 'activo',
        fecha_ingreso: ''
      });
    }
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocente(null);
    setFormData({
      nombres: '',
      apellidos: '',
      dni: '',
      email: '',
      telefono: '',
      especialidad: '',
      departamento: '',
      estado: 'activo',
      fecha_ingreso: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.nombres?.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.apellidos?.trim()) {
      setError('Los apellidos son requeridos');
      return;
    }
    if (!formData.dni?.trim()) {
      setError('El DNI es requerido');
      return;
    }
    if (formData.dni.length !== 8 || !/^\d+$/.test(formData.dni)) {
      setError('El DNI debe tener 8 dígitos numéricos');
      return;
    }

    try {
      if (editingDocente) {
        await docentesService.updateDocente(editingDocente.id!, formData);
        setSuccess('Docente actualizado correctamente');
      } else {
        await docentesService.createDocente(formData as Omit<Docente, 'id' | 'created_at' | 'updated_at'>);
        setSuccess('Docente creado correctamente');
      }

      await loadDocentes();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Error al guardar docente:', err);
      setError(err.message || 'Error al guardar docente');
    }
  };

  const handleDelete = async (docente: Docente) => {
    if (!window.confirm(`¿Eliminar al docente ${docente.nombres} ${docente.apellidos}?`)) {
      return;
    }

    try {
      await docentesService.deleteDocente(docente.id!);
      setSuccess('Docente eliminado correctamente');
      await loadDocentes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error al eliminar docente:', err);
      setError(err.message || 'Error al eliminar docente');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Descargar plantilla Excel
  const handleDownloadTemplate = () => {
    const template = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        dni: '12345678',
        email: 'jperez@upeu.edu.pe',
        telefono: '987654321',
        especialidad: 'Matemáticas',
        departamento: 'Ciencias Exactas',
        estado: 'activo',
        fecha_ingreso: '2020-01-15'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Docentes');

    // Ajustar ancho de columnas
    const maxWidth = 20;
    const cols = Object.keys(template[0]).map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, 'plantilla_docentes.xlsx');
  };

  // Importar desde Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');
    setImportResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Mapear datos
      const docentesData: Omit<Docente, 'id' | 'created_at' | 'updated_at'>[] = jsonData.map((row: any) => ({
        nombres: row.nombres?.toString().trim() || '',
        apellidos: row.apellidos?.toString().trim() || '',
        dni: row.dni?.toString().trim() || '',
        email: row.email?.toString().trim() || undefined,
        telefono: row.telefono?.toString().trim() || undefined,
        especialidad: row.especialidad?.toString().trim() || undefined,
        departamento: row.departamento?.toString().trim() || undefined,
        estado: (row.estado?.toString().trim() as any) || 'activo',
        fecha_ingreso: row.fecha_ingreso?.toString().trim() || undefined
      }));

      // Importar
      const results = await docentesService.importDocentes(docentesData);
      setImportResults(results);

      if (results.errors.length === 0) {
        setSuccess(`✅ ${results.success} docentes importados correctamente`);
      } else {
        setError(`⚠️ ${results.success} docentes importados, ${results.errors.length} errores`);
      }

      await loadDocentes();
    } catch (err: any) {
      console.error('Error al importar:', err);
      setError(err.message || 'Error al importar el archivo');
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  // Exportar a Excel
  const handleExport = async () => {
    try {
      const data = await docentesService.getAllDocentesUnpaginated();

      const exportData = data.map(d => ({
        Nombres: d.nombres,
        Apellidos: d.apellidos,
        DNI: d.dni,
        Email: d.email || '',
        Teléfono: d.telefono || '',
        Especialidad: d.especialidad || '',
        Departamento: d.departamento || '',
        Estado: d.estado,
        'Fecha Ingreso': d.fecha_ingreso || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Docentes');

      XLSX.writeFile(workbook, `docentes_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccess('Docentes exportados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error al exportar:', err);
      setError('Error al exportar docentes');
      setTimeout(() => setError(''), 3000);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black rounded-lg">
              <Users className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Docentes</h2>
              <p className="text-sm text-gray-600">Administra la información de los docentes</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Botón Descargar Plantilla */}
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Plantilla Excel</span>
            </button>

            {/* Botón Importar */}
            <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importando...' : 'Importar Excel'}</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
              />
            </label>

            {/* Botón Exportar */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            {/* Botón Nuevo */}
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Docente</span>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, DNI o email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Resultados de importación */}
        {importResults && importResults.errors.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Errores de Importación:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {importResults.errors.map((err, idx) => (
                <div key={idx} className="text-sm text-yellow-700">
                  Fila {err.row} (DNI: {err.dni}): {err.error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabla de docentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando docentes...</p>
          </div>
        ) : docentes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay docentes registrados</p>
            <p className="text-sm">Comienza agregando uno nuevo o importando desde Excel</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apellidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {docentes.map((docente) => (
                    <tr key={docente.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {docente.nombres}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {docente.apellidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {docente.dni}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {docente.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {docente.especialidad || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          docente.estado === 'activo' ? 'bg-green-100 text-green-800' :
                          docente.estado === 'inactivo' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {docente.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(docente)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(docente)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} docentes
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingDocente ? 'Editar Docente' : 'Nuevo Docente'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      value={formData.nombres}
                      onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      value={formData.apellidos}
                      onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI *
                    </label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      maxLength={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                      disabled={!!editingDocente}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="licencia">Licencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Ingreso
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_ingreso}
                      onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingDocente ? 'Actualizar' : 'Crear'}</span>
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

export default GestionDocentes;
