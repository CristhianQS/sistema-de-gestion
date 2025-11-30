import { createClient } from '@supabase/supabase-js';

// Obtener credenciales desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'Por favor, copia .env.example a .env y configura tus credenciales de Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-exportar tipos desde la carpeta types para mantener compatibilidad
export type {
  AdminUser,
  Area,
  AreaField,
  DataAlumno,
  AreaSubmission,
  Pabellon,
  Salon,
  AdminRole,
  SubmissionStatus,
  FieldType,
} from '../types';