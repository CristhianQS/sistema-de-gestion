-- ================================================
-- Sistema Completo de Notificaciones
-- ================================================

-- 1. Crear tabla de administradores (si no existe)
CREATE TABLE IF NOT EXISTS public.administradores (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar administrador BLACK
INSERT INTO public.administradores (nombre, email, rol)
VALUES ('Black', 'black@upeu.edu.pe', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Agregar campo de encargado a la tabla areas
ALTER TABLE public.areas
ADD COLUMN IF NOT EXISTS encargado_email TEXT,
ADD COLUMN IF NOT EXISTS encargado_nombre TEXT;

-- 3. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'new_report', 'status_change', 'comment', etc.
    related_submission_id BIGINT REFERENCES public.area_submissions(id) ON DELETE CASCADE,
    related_area_id BIGINT REFERENCES public.areas(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON public.notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_submission ON public.notifications(related_submission_id);

-- 4. Función para crear notificaciones cuando se crea un reporte
CREATE OR REPLACE FUNCTION create_report_notifications()
RETURNS TRIGGER AS $$
DECLARE
    v_area_name TEXT;
    v_encargado_email TEXT;
    v_encargado_nombre TEXT;
    v_alumno_nombre TEXT;
    v_admin_email TEXT;
    v_admin_nombre TEXT;
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

    -- 2. Notificar al administrador BLACK
    SELECT email, nombre
    INTO v_admin_email, v_admin_nombre
    FROM public.administradores
    WHERE rol = 'super_admin' OR nombre ILIKE '%black%'
    LIMIT 1;

    IF v_admin_email IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_email,
            user_name,
            title,
            message,
            type,
            related_submission_id,
            related_area_id
        ) VALUES (
            v_admin_email,
            v_admin_nombre,
            '🔔 Nuevo Reporte en ' || v_area_name,
            'El estudiante ' || v_alumno_nombre || ' ha reportado un problema.',
            'new_report',
            NEW.id,
            NEW.area_id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger que se activa al insertar un nuevo reporte
DROP TRIGGER IF EXISTS trigger_create_report_notifications ON public.area_submissions;
CREATE TRIGGER trigger_create_report_notifications
    AFTER INSERT ON public.area_submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_report_notifications();

-- 6. Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET read = TRUE, read_at = NOW()
    WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Función para marcar todas las notificaciones de un usuario como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET read = TRUE, read_at = NOW()
    WHERE user_email = p_user_email AND read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 8. Permisos
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos (usuarios autenticados)
CREATE POLICY "Allow authenticated read" ON public.administradores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to read their notifications" ON public.notifications
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update their notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (true);

-- Permitir insertar notificaciones (para el trigger)
CREATE POLICY "Allow insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (true);

-- 9. Crear vista para obtener notificaciones con información completa
CREATE OR REPLACE VIEW notifications_with_details AS
SELECT
    n.id,
    n.user_email,
    n.user_name,
    n.title,
    n.message,
    n.type,
    n.related_submission_id,
    n.related_area_id,
    n.read,
    n.created_at,
    n.read_at,
    a.name as area_name,
    s.alumno_nombre,
    s.alumno_codigo,
    s.status as submission_status
FROM public.notifications n
LEFT JOIN public.areas a ON n.related_area_id = a.id
LEFT JOIN public.area_submissions s ON n.related_submission_id = s.id
ORDER BY n.created_at DESC;

-- ================================================
-- Mensajes de confirmación
-- ================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ Sistema de Notificaciones Creado';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tablas creadas:';
    RAISE NOTICE '   ✅ administradores';
    RAISE NOTICE '   ✅ notifications';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Funciones creadas:';
    RAISE NOTICE '   ✅ create_report_notifications()';
    RAISE NOTICE '   ✅ mark_notification_as_read()';
    RAISE NOTICE '   ✅ mark_all_notifications_as_read()';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Triggers creados:';
    RAISE NOTICE '   ✅ trigger_create_report_notifications';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Administrador BLACK registrado:';
    RAISE NOTICE '   📧 Email: black@upeu.edu.pe';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Próximos pasos:';
    RAISE NOTICE '   1. Actualiza el email del admin black si es necesario';
    RAISE NOTICE '   2. Agrega encargados a las áreas:';
    RAISE NOTICE '      UPDATE areas SET encargado_email = ''email@upeu.edu.pe'',';
    RAISE NOTICE '                       encargado_nombre = ''Nombre''';
    RAISE NOTICE '      WHERE id = [ID_DEL_AREA];';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 El sistema está listo!';
    RAISE NOTICE '   Cuando un alumno cree un reporte:';
    RAISE NOTICE '   - Se notificará al encargado del área';
    RAISE NOTICE '   - Se notificará al admin BLACK';
    RAISE NOTICE '';
END $$;
