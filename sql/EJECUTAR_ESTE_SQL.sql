-- ============================================================================
-- SISTEMA DE NOTIFICACIONES COMPLETO - EJECUTAR ESTE SQL
-- ============================================================================
-- Este script consolida todo el sistema de notificaciones en tiempo real
-- Incluye: Notificaciones, Admin BLACK/ORO, Indicador de revisión
-- Fecha: 2025-12-10
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA DE ADMINISTRADORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.administradores (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT DEFAULT 'admin',
    areas_asignadas INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden ver y editar su propia información
CREATE POLICY IF NOT EXISTS "Administradores pueden ver su info"
    ON public.administradores
    FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Super admins pueden gestionar"
    ON public.administradores
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.administradores
            WHERE rol = 'super_admin'
        )
    );

-- ============================================================================
-- PASO 2: INSERTAR ADMINISTRADORES BLACK Y ORO
-- ============================================================================

-- Insertar Admin BLACK (acceso total a todas las áreas)
INSERT INTO public.administradores (nombre, email, rol, areas_asignadas)
VALUES ('Black', 'black@upeu.edu.pe', 'super_admin', NULL)
ON CONFLICT (email) DO UPDATE
SET rol = 'super_admin',
    areas_asignadas = NULL;

-- Insertar Admin ORO (acceso solo a áreas asignadas)
INSERT INTO public.administradores (nombre, email, rol, areas_asignadas)
VALUES ('Oro', 'oro@upeu.edu.pe', 'admin', ARRAY[]::INTEGER[])
ON CONFLICT (email) DO UPDATE
SET rol = 'admin';

-- ============================================================================
-- PASO 3: AGREGAR CAMPOS DE ENCARGADO A ÁREAS
-- ============================================================================

ALTER TABLE public.areas
ADD COLUMN IF NOT EXISTS encargado_email TEXT,
ADD COLUMN IF NOT EXISTS encargado_nombre TEXT;

COMMENT ON COLUMN public.areas.encargado_email IS 'Email del encargado del área (recibirá notificaciones)';
COMMENT ON COLUMN public.areas.encargado_nombre IS 'Nombre completo del encargado del área';

-- ============================================================================
-- PASO 4: CREAR TABLA DE NOTIFICACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    related_submission_id BIGINT REFERENCES public.area_submissions(id) ON DELETE CASCADE,
    related_area_id BIGINT REFERENCES public.areas(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_email, read) WHERE read = FALSE;

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY IF NOT EXISTS "Usuarios pueden ver sus notificaciones"
    ON public.notifications
    FOR SELECT
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR user_email = current_user);

CREATE POLICY IF NOT EXISTS "Usuarios pueden actualizar sus notificaciones"
    ON public.notifications
    FOR UPDATE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR user_email = current_user);

CREATE POLICY IF NOT EXISTS "Usuarios pueden eliminar sus notificaciones"
    ON public.notifications
    FOR DELETE
    USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR user_email = current_user);

-- Política para que el sistema pueda crear notificaciones
CREATE POLICY IF NOT EXISTS "Sistema puede crear notificaciones"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- PASO 5: AGREGAR CAMPOS DE REVISIÓN A area_submissions
-- ============================================================================

ALTER TABLE public.area_submissions
ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Índice para consultas de reportes no revisados
CREATE INDEX IF NOT EXISTS idx_area_submissions_reviewed ON public.area_submissions(reviewed);

COMMENT ON COLUMN public.area_submissions.reviewed IS 'Indica si el reporte ha sido revisado por un administrador';
COMMENT ON COLUMN public.area_submissions.reviewed_at IS 'Fecha y hora en que se revisó el reporte';
COMMENT ON COLUMN public.area_submissions.reviewed_by IS 'Email del administrador que revisó el reporte';

-- ============================================================================
-- PASO 6: FUNCIÓN PARA MARCAR REPORTES COMO REVISADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.mark_report_as_reviewed(
    p_submission_id BIGINT,
    p_reviewed_by TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.area_submissions
    SET
        reviewed = TRUE,
        reviewed_at = NOW(),
        reviewed_by = p_reviewed_by
    WHERE id = p_submission_id;
END;
$$;

COMMENT ON FUNCTION public.mark_report_as_reviewed IS 'Marca un reporte como revisado por un administrador';

-- ============================================================================
-- PASO 7: FUNCIÓN PARA CONTAR REPORTES NO REVISADOS POR ÁREA
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_unreviewed_count_by_area(p_area_id BIGINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.area_submissions
    WHERE area_id = p_area_id
      AND reviewed = FALSE;

    RETURN COALESCE(v_count, 0);
END;
$$;

COMMENT ON FUNCTION public.get_unreviewed_count_by_area IS 'Cuenta el número de reportes no revisados en un área específica';

-- ============================================================================
-- PASO 8: VISTA PARA REPORTES CON ESTADO DE REVISIÓN
-- ============================================================================

CREATE OR REPLACE VIEW public.submissions_with_review_status AS
SELECT
    s.*,
    CASE
        WHEN s.reviewed = TRUE THEN 'reviewed'
        ELSE 'pending_review'
    END as review_status,
    a.name as area_name,
    a.encargado_email,
    a.encargado_nombre
FROM public.area_submissions s
LEFT JOIN public.areas a ON s.area_id = a.id;

COMMENT ON VIEW public.submissions_with_review_status IS 'Vista que incluye el estado de revisión de cada reporte';

-- ============================================================================
-- PASO 9: FUNCIÓN PARA CREAR NOTIFICACIONES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_report_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_area_name TEXT;
    v_encargado_email TEXT;
    v_encargado_nombre TEXT;
    v_admin RECORD;
BEGIN
    -- Obtener información del área
    SELECT name, encargado_email, encargado_nombre
    INTO v_area_name, v_encargado_email, v_encargado_nombre
    FROM public.areas
    WHERE id = NEW.area_id;

    -- 1. Notificar al encargado del área (si existe)
    IF v_encargado_email IS NOT NULL THEN
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
            'Nuevo reporte en ' || v_area_name,
            'El estudiante ' || NEW.alumno_nombre || ' ha enviado un nuevo reporte en el área ' || v_area_name,
            'new_report',
            NEW.id,
            NEW.area_id
        );
    END IF;

    -- 2. Notificar a administradores BLACK y ORO
    FOR v_admin IN
        SELECT nombre, email, rol, areas_asignadas
        FROM public.administradores
        WHERE
            -- Admin BLACK (super_admin) recibe notificaciones de todas las áreas
            rol = 'super_admin'
            OR
            -- Admin ORO recibe notificaciones solo de sus áreas asignadas
            (
                rol = 'admin'
                AND areas_asignadas IS NOT NULL
                AND NEW.area_id = ANY(areas_asignadas)
            )
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
            'Nuevo reporte en ' || v_area_name,
            'El estudiante ' || NEW.alumno_nombre || ' ha enviado un nuevo reporte en el área ' || v_area_name,
            'new_report',
            NEW.id,
            NEW.area_id
        );
    END LOOP;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_report_notifications IS 'Crea notificaciones cuando se envía un nuevo reporte';

-- ============================================================================
-- PASO 10: TRIGGER PARA NOTIFICACIONES AUTOMÁTICAS
-- ============================================================================

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trigger_create_report_notifications ON public.area_submissions;

-- Crear trigger
CREATE TRIGGER trigger_create_report_notifications
    AFTER INSERT ON public.area_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.create_report_notifications();

COMMENT ON TRIGGER trigger_create_report_notifications ON public.area_submissions IS 'Trigger que crea notificaciones automáticamente al insertar un reporte';

-- ============================================================================
-- PASO 11: FUNCIONES AUXILIARES PARA NOTIFICACIONES
-- ============================================================================

-- Función para marcar una notificación como leída
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(p_notification_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET
        read = TRUE,
        read_at = NOW()
    WHERE id = p_notification_id;
END;
$$;

-- Función para marcar todas las notificaciones de un usuario como leídas
CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(p_user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET
        read = TRUE,
        read_at = NOW()
    WHERE user_email = p_user_email
      AND read = FALSE;
END;
$$;

-- Función para contar notificaciones no leídas
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM public.notifications
    WHERE user_email = p_user_email
      AND read = FALSE;

    RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================================================
-- PASO 12: HABILITAR REALTIME PARA NOTIFICACIONES
-- ============================================================================

-- Habilitar Realtime para la tabla de notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificar instalación
SELECT 'Sistema de notificaciones instalado correctamente' as status,
       (SELECT COUNT(*) FROM public.administradores) as total_administradores,
       (SELECT COUNT(*) FROM public.notifications) as total_notificaciones;

-- Mostrar administradores creados
SELECT
    nombre,
    email,
    rol,
    CASE
        WHEN rol = 'super_admin' THEN 'Todas las áreas'
        WHEN areas_asignadas IS NULL OR array_length(areas_asignadas, 1) IS NULL THEN 'Sin áreas asignadas'
        ELSE array_length(areas_asignadas, 1)::TEXT || ' áreas asignadas'
    END as acceso
FROM public.administradores
ORDER BY rol DESC, nombre;
