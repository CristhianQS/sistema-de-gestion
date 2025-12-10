/**
 * Tipos y definiciones TypeScript centralizados
 *
 * Este archivo contiene todas las interfaces y tipos compartidos
 * en toda la aplicación para evitar duplicación y mantener consistencia
 */

// ============================================================================
// TIPOS DE BASE DE DATOS (Supabase)
// ============================================================================

export interface AdminUser {
  id: number;
  email: string;
  password: string;
  created_at: string;
  name: string | null;
  dni: string | null;
  area_id: number | null;
  role: 'admin_black' | 'admin_oro' | 'admin_plata';
}

export interface Area {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at?: string;
}

export interface AreaField {
  id: number;
  area_id: number;
  field_name: string;
  field_type: 'text' | 'textarea' | 'file' | 'image' | 'date' | 'select';
  field_label: string;
  is_required: boolean;
  options: string | null;
  placeholder: string | null;
  order_index: number;
  created_at: string;
}

export interface DataAlumno {
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
  created_at?: string;
}

export interface AreaSubmission {
  id: number;
  area_id: number;
  alumno_id: number;
  alumno_dni: string;
  alumno_codigo: number;
  alumno_nombre: string;
  codigo_alumno?: string; // Código del alumno como string
  form_data: any;
  submitted_at: string;
  created_at: string;
  updated_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  // Campos de revisión
  reviewed?: boolean;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  // Relaciones con joins
  area?: {
    id: number;
    name: string;
    description?: string | null;
  };
  alumno?: {
    id: number;
    codigo: number | null;
    estudiante: string | null;
  };
}

export interface Pabellon {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  created_at: string;
}

export interface Salon {
  id: number;
  pabellon_id: number;
  nombre: string;
  capacidad: number | null;
  descripcion: string | null;
  created_at: string;
}

// ============================================================================
// TIPOS DE ROLES Y AUTENTICACIÓN
// ============================================================================

export type AdminRole = 'admin_black' | 'admin_oro' | 'admin_plata';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type FieldType = 'text' | 'textarea' | 'file' | 'image' | 'date' | 'select';

// ============================================================================
// TIPOS DE UI Y COMPONENTES
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
