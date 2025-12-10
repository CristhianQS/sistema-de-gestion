-- ================================================
-- Actualizar Sistema de Notificaciones
-- Agregar Admin ORO y campo de revisión en reportes
-- ================================================

-- 1. Agregar campo "reviewed" a area_submissions
ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_area_submissions_reviewed ON public.area_submissions(reviewed);

-- 2. Agregar campo "areas_asignadas" a administradores
ALTER TABLE public.administradores
ADD COLUMN IF NOT EXISTS areas_asignadas INTEGER[] DEFAULT '{}';

-- 3. Insertar Admin ORO
INSERT INTO public.administradores (nombre, email, rol, areas_asignadas)
VALUES ('Oro', 'oro@upeu.edu.pe', 'admin', '{}')
ON CONFLICT (email) DO UPDATE
SET nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;

-- 4. Actualizar Admin BLACK (super_admin ve todas las áreas)
UPDATE public.administradores
SET rol = 'super_admin',
    areas_asignadas = NULL -- NULL = ve todas las áreas
WHERE nombre = 'Black';

-- 5. Función MEJORADA para crear notificaciones
CREATE OR REPLACE FUNCTION create_report_notifications()
RETURNS TRIGGER AS $$
DECLARE
    v_area_name TEXT;
    v_encargado_email TEXT;
    v_encargado_nombre TEXT;
    v_alumno_nombre TEXT;
    v_admin RECORD;
BEGIN
    -- Obtener información del área
    SELECT name, encargado_email, encargado_nombre
    INTO v_area_name, v_encargado_email, v_encargado_nombre
    FROM public.areas
    WHERE id = NEW.area_id;

    -- Obtener nombre del alumno
    v_alumno_nombre := NEW.alumno_nombre;

    -- 1. Notificar al encargado del área (si existe)
    IF v_encargado_email IS NOT NULL AND v_encargado_email != '' THEN
        INSERT INTO public.notifications (
            user_email,
            user_name,
            title,
            message,
            type,
            related_submission_id,
            related_area_id
        ) VALUES (
            v_encargado_email,
            v_encargado_nombre,
            '🔔 Nuevo Reporte en ' || v_area_name,
            'El estudiante ' || v_alumno_nombre || ' ha reportado un problema en tu área.',
            'new_report',
            NEW.id,
            NEW.area_id
        );
    END IF;

    -- 2. Notificar a administradores según sus áreas asignadas
    FOR v_admin IN
        SELECT nombre, email, rol, areas_asignadas
        FROM public.administradores
        WHERE
            -- Super admin (BLACK) recibe todas
            rol = 'super_admin'
            OR
            -- Admin con área específica asignada
            (areas_asignadas IS NOT NULL AND NEW.area_id = ANY(areas_asignadas))
    LOOP
        INSERT INTO public.notifications (
            user_email,
            user_name,
            title,
            message,
            type,
            related_submission_id,
            related_area_id
        ) VALUES (
            v_admin.email,
            v_admin.nombre,
            '🔔 Nuevo Reporte en ' || v_area_name,
            'El estudiante ' || v_alumno_nombre || ' ha reportado un problema.',
            'new_report',
            NEW.id,
            NEW.area_id
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Recrear trigger (por si ya existía)
DROP TRIGGER IF EXISTS trigger_create_report_notifications ON public.area_submissions;
CREATE TRIGGER trigger_create_report_notifications
    AFTER INSERT ON public.area_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_report_notifications();

-- 7. Función para marcar reporte como revisado
CREATE OR REPLACE FUNCTION mark_report_as_reviewed(
    p_submission_id BIGINT,
    p_reviewed_by TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.area_submissions
    SET
        reviewed = TRUE,
        reviewed_at = NOW(),
        reviewed_by = p_reviewed_by
    WHERE id = p_submission_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Función para obtener reportes no revisados por área
CREATE OR REPLACE FUNCTION get_unreviewed_count_by_area(p_area_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.area_submissions
    WHERE area_id = p_area_id AND reviewed = FALSE;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Vista mejorada de reportes con estado de revisión
CREATE OR REPLACE VIEW submissions_with_review_status AS
SELECT
    s.*,
    a.name as area_name,
    a.encargado_email,
    a.encargado_nombre,
    s.reviewed,
    s.reviewed_at,
    s.reviewed_by,
    CASE
        WHEN s.reviewed = TRUE THEN '✅ Revisado'
        ELSE '🔔 Pendiente'
    END as review_status
FROM public.area_submissions s
LEFT JOIN public.areas a ON s.area_id = a.id
ORDER BY s.created_at DESC;

-- ================================================
-- Mensajes de confirmación
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Sistema Actualizado';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Cambios aplicados:';
    RAISE NOTICE '   ✅ Campo "reviewed" agregado a reportes';
    RAISE NOTICE '   ✅ Campo "areas_asignadas" agregado a admins';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Administradores:';
    RAISE NOTICE '   ✅ BLACK (super_admin) - Ve TODAS las áreas';
    RAISE NOTICE '   ✅ ORO (admin) - Ve áreas asignadas';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Asignar áreas a Admin ORO:';
    RAISE NOTICE '   UPDATE administradores';
    RAISE NOTICE '   SET areas_asignadas = ARRAY[2, 7, 8]';
    RAISE NOTICE '   WHERE nombre = ''Oro'';';
    RAISE NOTICE '';
    RAISE NOTICE '   Ejemplo: ORO verá reportes de áreas 2, 7, 8';
    RAISE NOTICE '            BLACK verá reportes de TODAS las áreas';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 Notificaciones:';
    RAISE NOTICE '   - Encargado del área recibe notificación';
    RAISE NOTICE '   - Admin BLACK recibe notificación (todas las áreas)';
    RAISE NOTICE '   - Admin ORO recibe notificación (solo sus áreas)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Marcar reporte como revisado:';
    RAISE NOTICE '   SELECT mark_report_as_reviewed(123, ''admin@upeu.edu.pe'');';
    RAISE NOTICE '';
END $$;
