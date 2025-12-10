/**
 * Índice principal de servicios de base de datos
 * Exporta todos los servicios para facilitar las importaciones
 */

// Servicios de Áreas
export * from './areas.service';

// Servicios de Estudiantes
export * from './students.service';

// Servicios de Reportes/Submissions
export * from './submissions.service';

// Servicios de Pabellones y Salones
export * from './pabellones.service';

// Servicios de Autenticación
export * from './auth.service';

// NOTA: Por defecto, las funciones principales (getAllAreas, getAllSubmissions, getAllStudents)
// ahora retornan resultados paginados. Para obtener datos sin paginación (compatibilidad con código antiguo),
// usar las versiones *Unpaginated: getAllAreasUnpaginated(), etc.
