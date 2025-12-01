import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

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

const GestionDatosAlumnos: React.FC = () => {
  const [alumnos, setAlumnos] = useState<DataAlumno[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<DataAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumno, setSelectedAlumno] = useState<DataAlumno | null>(null);
  const [filterFacultad, setFilterFacultad] = useState<string>('all');
  const [filterCarrera, setFilterCarrera] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    loadAlumnos();
  }, []);

  useEffect(() => {
    filterAlumnos();
  }, [searchTerm, filterFacultad, filterCarrera, alumnos]);

  useEffect(() => {
    // Resetear a la página 1 cuando cambien los filtros
    setCurrentPage(1);
  }, [searchTerm, filterFacultad, filterCarrera, itemsPerPage]);

  const loadAlumnos = async () => {
    try {
      console.log('Iniciando carga de alumnos...');

      // Primero obtenemos el conteo total
      const { count } = await supabase
        .from('data_alumnos')
        .select('*', { count: 'exact', head: true });

      console.log('Total de registros en BD:', count);

      if (!count || count === 0) {
        setAlumnos([]);
        return;
      }

      // Cargar datos en lotes de 1000 registros
      const batchSize = 1000;
      const totalBatches = Math.ceil(count / batchSize);
      let allData: DataAlumno[] = [];

      console.log(`Cargando ${count} registros en ${totalBatches} lotes...`);

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize - 1;

        console.log(`Cargando lote ${i + 1}/${totalBatches} (registros ${start}-${end})...`);

        const { data, error } = await supabase
          .from('data_alumnos')
          .select('*')
          .order('estudiante', { ascending: true })
          .range(start, end);

        if (error) {
          console.error(`Error en lote ${i + 1}:`, error);
          throw error;
        }

        if (data) {
          allData = [...allData, ...data];
          console.log(`Lote ${i + 1} cargado: ${data.length} registros. Total acumulado: ${allData.length}`);
        }
      }

      console.log('Todos los alumnos cargados exitosamente:', allData.length);
      setAlumnos(allData);
    } catch (error: any) {
      console.error('Error al cargar alumnos:', error);
      setUploadError(`Error al cargar alumnos: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const filterAlumnos = () => {
    let filtered = [...alumnos];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (alumno) =>
          alumno.estudiante?.toLowerCase().includes(term) ||
          alumno.dni?.toLowerCase().includes(term) ||
          alumno.codigo?.toString().includes(term) ||
          alumno.correo?.toLowerCase().includes(term) ||
          alumno.carrera_profesional?.toLowerCase().includes(term)
      );
    }

    // Filtrar por facultad
    if (filterFacultad !== 'all') {
      filtered = filtered.filter((alumno) => alumno.facultad === filterFacultad);
    }

    // Filtrar por carrera
    if (filterCarrera !== 'all') {
      filtered = filtered.filter((alumno) => alumno.carrera_profesional === filterCarrera);
    }

    setFilteredAlumnos(filtered);
  };

  const getFacultades = () => {
    const facultades = new Set(alumnos.map((a) => a.facultad).filter(Boolean));
    return Array.from(facultades);
  };

  const getCarreras = () => {
    const carreras = new Set(alumnos.map((a) => a.carrera_profesional).filter(Boolean));
    return Array.from(carreras);
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlumnos = filteredAlumnos.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const downloadTemplate = () => {
    // Crear plantilla con las columnas requeridas
    const template = [
      {
        dni: '12345678',
        codigo: 2024001234,
        estudiante: 'Juan Pérez García',
        carrera_profesional: 'Ingeniería de Sistemas',
        facultad: 'Facultad de Ingeniería',
        modalidad: 'Presencial',
        ciclo: 5,
        grupo: 'A',
        celular: '987654321',
        religion: 'Católica',
        fecha_nacimiento: '2000-01-15',
        correo: 'juan.perez@upeu.edu.pe',
        pais: 'Perú'
      }
    ];

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(template);

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');

    // Descargar archivo
    XLSX.writeFile(wb, 'plantilla_alumnos.xlsx');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // Leer archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setUploadError('El archivo está vacío');
        setUploading(false);
        return;
      }

      // Validar y preparar datos
      const alumnosToInsert = jsonData.map((row: any) => ({
        dni: row.dni ? String(row.dni) : null,
        codigo: row.codigo ? Number(row.codigo) : null,
        estudiante: row.estudiante || null,
        carrera_profesional: row.carrera_profesional || null,
        facultad: row.facultad || null,
        modalidad: row.modalidad || null,
        ciclo: row.ciclo ? Number(row.ciclo) : null,
        grupo: row.grupo || null,
        celular: row.celular ? String(row.celular) : null,
        religion: row.religion || null,
        fecha_nacimiento: row.fecha_nacimiento || null,
        correo: row.correo || null,
        pais: row.pais || null
      }));

      // Insertar en la base de datos
      const { error } = await supabase
        .from('data_alumnos')
        .insert(alumnosToInsert);

      if (error) throw error;

      setUploadSuccess(`Se agregaron ${alumnosToInsert.length} alumnos correctamente`);
      await loadAlumnos();

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => setUploadSuccess(''), 5000);
    } catch (error: any) {
      console.error('Error al cargar archivo:', error);
      setUploadError(error.message || 'Error al procesar el archivo Excel');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Cargando datos de alumnos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Datos de Alumnos</h2>
          <p className="text-gray-400 mt-1">
            Total: {alumnos.length} | Filtrados: {filteredAlumnos.length} | Mostrando: {startIndex + 1}-{Math.min(endIndex, filteredAlumnos.length)} | Página {currentPage} de {totalPages}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar Plantilla
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {uploading ? 'Subiendo...' : 'Subir Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {uploadError && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {uploadSuccess}
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, DNI, Código, Email..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Facultad */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Facultad
            </label>
            <select
              value={filterFacultad}
              onChange={(e) => setFilterFacultad(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Facultades</option>
              {getFacultades().map((facultad) => (
                <option key={facultad} value={facultad as string}>
                  {facultad}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Carrera */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Carrera Profesional
            </label>
            <select
              value={filterCarrera}
              onChange={(e) => setFilterCarrera(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Carreras</option>
              {getCarreras().map((carrera) => (
                <option key={carrera} value={carrera as string}>
                  {carrera}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón Limpiar Filtros y Selector de Items por Página */}
        <div className="mt-4 flex justify-between items-center">
          {(searchTerm || filterFacultad !== 'all' || filterCarrera !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterFacultad('all');
                setFilterCarrera('all');
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Limpiar Filtros
            </button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-300">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={1000}>1000</option>
            </select>
            <label className="text-sm text-gray-300">por página</label>
          </div>
        </div>
      </div>

      {/* Tabla de Alumnos */}
      {filteredAlumnos.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No se encontraron alumnos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ciclo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedAlumnos.map((alumno, index) => (
                  <tr key={alumno.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {alumno.codigo || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{alumno.estudiante || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-400">{alumno.correo || 'Sin correo'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {alumno.dni || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      <div className="max-w-xs truncate">{alumno.carrera_profesional || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{alumno.facultad || ''}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {alumno.ciclo || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedAlumno(alumno)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginación */}
          {filteredAlumnos.length > 0 && (
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{' '}
                    <span className="font-medium text-white">{Math.min(endIndex, filteredAlumnos.length)}</span> de{' '}
                    <span className="font-medium text-white">{filteredAlumnos.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Primera</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Páginas */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => goToPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Última</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedAlumno && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedAlumno.estudiante || 'Sin nombre'}</h3>
                  <p className="text-gray-400">Código: {selectedAlumno.codigo}</p>
                </div>
                <button
                  onClick={() => setSelectedAlumno(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">Información Personal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">DNI</p>
                      <p className="text-sm text-white">{selectedAlumno.dni || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fecha de Nacimiento</p>
                      <p className="text-sm text-white">{formatDate(selectedAlumno.fecha_nacimiento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Celular</p>
                      <p className="text-sm text-white">{selectedAlumno.celular || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Correo Electrónico</p>
                      <p className="text-sm text-white">{selectedAlumno.correo || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Religión</p>
                      <p className="text-sm text-white">{selectedAlumno.religion || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">País</p>
                      <p className="text-sm text-white">{selectedAlumno.pais || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Información Académica */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">Información Académica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Facultad</p>
                      <p className="text-sm text-white">{selectedAlumno.facultad || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Carrera Profesional</p>
                      <p className="text-sm text-white">{selectedAlumno.carrera_profesional || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Modalidad</p>
                      <p className="text-sm text-white">{selectedAlumno.modalidad || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ciclo</p>
                      <p className="text-sm text-white">{selectedAlumno.ciclo || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Grupo</p>
                      <p className="text-sm text-white">{selectedAlumno.grupo || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="mt-6">
                <button
                  onClick={() => setSelectedAlumno(null)}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDatosAlumnos;
