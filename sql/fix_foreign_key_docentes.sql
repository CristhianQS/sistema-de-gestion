-- ============================================================================
-- FIX: Permitir reportes de docentes sin alumno_id
-- ============================================================================
-- Este script modifica la constraint para permitir NULL en alumno_id
-- cuando el reporte es de un docente
-- Fecha: 2025-12-11
-- ============================================================================

-- PASO 1: Eliminar la constraint existente de foreign key
ALTER TABLE public.area_submissions
DROP CONSTRAINT IF EXISTS fk_alumno_id;

ALTER TABLE public.area_submissions
DROP CONSTRAINT IF EXISTS area_submissions_alumno_id_fkey;

-- PASO 2: Modificar la columna alumno_id para permitir NULL
ALTER TABLE public.area_submissions
ALTER COLUMN alumno_id DROP NOT NULL;

-- PASO 3: Crear nueva constraint que permite NULL
-- Solo valida la foreign key cuando alumno_id NO es NULL
ALTER TABLE public.area_submissions
ADD CONSTRAINT fk_alumno_id
FOREIGN KEY (alumno_id)
REFERENCES public.data_alumnos(id)
ON DELETE SET NULL;

-- PASO 4: Actualizar registros existentes de docentes
-- Cambiar alumno_id de 0 a NULL para reportes de docentes
UPDATE public.area_submissions
SET alumno_id = NULL
WHERE es_docente = true AND alumno_id = 0;

-- VERIFICACIÓN
SELECT
    'Constraint actualizada correctamente' as status,
    COUNT(*) FILTER (WHERE alumno_id IS NULL AND es_docente = true) as reportes_docentes_sin_alumno,
    COUNT(*) FILTER (WHERE alumno_id IS NOT NULL) as reportes_con_alumno
FROM public.area_submissions;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
