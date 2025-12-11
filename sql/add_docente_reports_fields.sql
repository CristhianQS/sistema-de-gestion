-- ============================================================================
-- AGREGAR SOPORTE PARA REPORTES DE DOCENTES
-- ============================================================================
-- Este script agrega campos a area_submissions para soportar reportes de docentes
-- Los reportes de docentes tienen PRIORIDAD y deben resaltarse
-- Fecha: 2025-12-11
-- ============================================================================

-- ============================================================================
-- PASO 1: AGREGAR CAMPOS A LA TABLA area_submissions
-- ============================================================================

-- Agregar campo para identificar si el reporte es de un docente
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS es_docente BOOLEAN DEFAULT FALSE;

-- Agregar campo para el DNI del docente (si aplica)
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS docente_dni TEXT;

-- Agregar campo para el nombre del docente (si aplica)
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS docente_nombre TEXT;

-- Agregar campo para el ID del docente (relación con tabla docentes)
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS docente_id BIGINT REFERENCES public.docentes(id) ON DELETE SET NULL;

-- Agregar campo de prioridad (los reportes de docentes tienen prioridad alta)
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('normal', 'alta', 'urgente'));

-- ============================================================================
-- PASO 2: ACTUALIZAR PRIORIDAD AUTOMÁTICAMENTE
-- ============================================================================

-- Función para establecer prioridad automáticamente basada en si es docente
CREATE OR REPLACE FUNCTION public.set_report_priority()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si es un reporte de docente, establecer prioridad alta
    IF NEW.es_docente = TRUE THEN
        NEW.prioridad = 'alta';
    ELSE
        -- Si no se especificó prioridad, establecer normal
        IF NEW.prioridad IS NULL THEN
            NEW.prioridad = 'normal';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger para ejecutar la función antes de insertar o actualizar
DROP TRIGGER IF EXISTS trigger_set_report_priority ON public.area_submissions;

CREATE TRIGGER trigger_set_report_priority
    BEFORE INSERT OR UPDATE ON public.area_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_report_priority();

-- ============================================================================
-- PASO 3: ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índice para filtrar por reportes de docentes
CREATE INDEX IF NOT EXISTS idx_area_submissions_es_docente
ON public.area_submissions(es_docente);

-- Índice para ordenar por prioridad
CREATE INDEX IF NOT EXISTS idx_area_submissions_prioridad
ON public.area_submissions(prioridad);

-- Índice compuesto para queries comunes (prioridad + fecha)
-- Nota: area_submissions usa 'submitted_at' en lugar de 'created_at'
CREATE INDEX IF NOT EXISTS idx_area_submissions_priority_date
ON public.area_submissions(prioridad DESC, submitted_at DESC);

-- Índice para buscar por docente
CREATE INDEX IF NOT EXISTS idx_area_submissions_docente_id
ON public.area_submissions(docente_id) WHERE docente_id IS NOT NULL;

-- ============================================================================
-- PASO 4: COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON COLUMN public.area_submissions.es_docente IS 'Indica si el reporte fue creado por un docente';
COMMENT ON COLUMN public.area_submissions.docente_dni IS 'DNI del docente que creó el reporte';
COMMENT ON COLUMN public.area_submissions.docente_nombre IS 'Nombre completo del docente';
COMMENT ON COLUMN public.area_submissions.docente_id IS 'ID del docente en la tabla docentes';
COMMENT ON COLUMN public.area_submissions.prioridad IS 'Prioridad del reporte: normal, alta (docentes), urgente';

-- ============================================================================
-- PASO 5: ACTUALIZAR REPORTES EXISTENTES (OPCIONAL)
-- ============================================================================

-- Establecer prioridad normal para todos los reportes existentes que no la tengan
UPDATE public.area_submissions
SET prioridad = 'normal'
WHERE prioridad IS NULL;

-- Establecer es_docente = false para todos los reportes existentes
UPDATE public.area_submissions
SET es_docente = FALSE
WHERE es_docente IS NULL;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que las columnas se agregaron correctamente
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'area_submissions'
    AND table_schema = 'public'
    AND column_name IN ('es_docente', 'docente_dni', 'docente_nombre', 'docente_id', 'prioridad')
ORDER BY ordinal_position;

-- Mostrar resultado
SELECT 'Tabla area_submissions actualizada con soporte para reportes de docentes' as status;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
