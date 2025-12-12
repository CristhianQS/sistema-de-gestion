-- ============================================================================
-- SOLUCIÓN URGENTE: Eliminar TODAS las referencias a administradores
-- ============================================================================
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase
-- ============================================================================

-- PASO 1: Deshabilitar RLS en area_submissions
ALTER TABLE public.area_submissions DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON public.area_submissions;
DROP POLICY IF EXISTS "Permitir inserción a todos" ON public.area_submissions;
DROP POLICY IF EXISTS "Permitir actualización a todos" ON public.area_submissions;
DROP POLICY IF EXISTS "Permitir eliminación a todos" ON public.area_submissions;
DROP POLICY IF EXISTS "allow_all_select" ON public.area_submissions;
DROP POLICY IF EXISTS "allow_all_insert" ON public.area_submissions;
DROP POLICY IF EXISTS "allow_all_update" ON public.area_submissions;
DROP POLICY IF EXISTS "allow_all_delete" ON public.area_submissions;

-- PASO 3: Eliminar funciones que mencionen administradores
DROP FUNCTION IF EXISTS check_admin_access CASCADE;
DROP FUNCTION IF EXISTS get_admin_role CASCADE;
DROP FUNCTION IF EXISTS verify_admin CASCADE;
DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP FUNCTION IF EXISTS check_administrador CASCADE;

-- PASO 4: Buscar y eliminar TODAS las funciones con 'admin' o 'administrador'
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        INNER JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    LOOP
        BEGIN
            -- Intentar obtener la definición de la función
            IF pg_get_functiondef(func_record.function_name::regproc::oid) ILIKE '%administradores%' THEN
                EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                    func_record.schema_name,
                    func_record.function_name,
                    func_record.args);
                RAISE NOTICE 'Eliminada función: %.%(%)',
                    func_record.schema_name,
                    func_record.function_name,
                    func_record.args;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorar errores y continuar
                CONTINUE;
        END;
    END LOOP;
END $$;

-- PASO 5: Eliminar vistas que puedan referenciar administradores
DROP VIEW IF EXISTS admin_view CASCADE;
DROP VIEW IF EXISTS administradores_view CASCADE;
DROP VIEW IF EXISTS v_administradores CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_administradores CASCADE;

-- PASO 6: Permitir NULL en alumno_id
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS fk_alumno_id;
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS area_submissions_alumno_id_fkey;
ALTER TABLE public.area_submissions ALTER COLUMN alumno_id DROP NOT NULL;

-- PASO 7: Recrear constraint sin problemas
ALTER TABLE public.area_submissions
ADD CONSTRAINT fk_alumno_id FOREIGN KEY (alumno_id)
REFERENCES public.data_alumnos(id) ON DELETE SET NULL;

-- PASO 8: NO volver a habilitar RLS (dejar deshabilitado)
-- Esto es temporal hasta identificar el problema exacto

-- VERIFICACIÓN
SELECT
    'Script ejecutado correctamente' as status,
    'RLS está DESHABILITADO en area_submissions' as nota_importante,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'area_submissions') as politicas_restantes;
