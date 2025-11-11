import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Campus {
  id: string;
  nombre: string;
  ciudad: string;
  imagen_fondo_url: string | null;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
}
// Tipos para TypeScript
export interface AdminUser {
  id: number;
  email: string;
  password: string;
  created_at: string;
  name: string | null;
  dni: string | null; // ⬅️ AGREGADO
  area_id: number | null;
  role: 'admin_black' | 'admin_oro' | 'admin_plata';
}

// ... resto de las interfaces

export interface Area {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
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

export interface AreaSubmission {
  id: number;
  area_id: number;
  alumno_id: number;
  alumno_dni: string;
  alumno_codigo: number;
  alumno_nombre: string;
  form_data: any;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
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
