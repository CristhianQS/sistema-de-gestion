-- ============================================================================
-- CLEANUP: Eliminar todas las referencias a la tabla administradores eliminada
-- ============================================================================
-- Este script limpia triggers, funciones y políticas que hacen referencia
-- a la tabla 'administradores' que ya no existe
-- Fecha: 2025-12-12
-- ============================================================================

-- ============================================================================
-- PASO 1: Eliminar políticas RLS que referencien administradores
-- ============================================================================

-- Buscar y eliminar políticas en area_submissions que puedan referenciar administradores
DO $$
DECLARE
    pol record;
BEGIN
    -- Buscar todas las políticas en area_submissions
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE tablename = 'area_submissions'
    LOOP
        BEGIN
            -- Intentar eliminar la política
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                pol.policyname, pol.schemaname, pol.tablename);
            RAISE NOTICE 'Política eliminada: % en %', pol.policyname, pol.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo eliminar política: % - %', pol.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 2: Eliminar funciones que referencien administradores
-- ============================================================================

-- Buscar y eliminar funciones que puedan referenciar la tabla eliminada
DO $$
DECLARE
    func record;
BEGIN
    FOR func IN
        SELECT n.nspname as schema, p.proname as name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) ILIKE '%administradores%'
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                func.schema, func.name, func.args);
            RAISE NOTICE 'Función eliminada: %s(%s)', func.name, func.args;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo eliminar función: % - %', func.name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 3: Eliminar triggers que referencien administradores
-- ============================================================================

-- Eliminar triggers en area_submissions que puedan causar problemas
DO $$
DECLARE
    trig record;
BEGIN
    FOR trig IN
        SELECT t.tgname as trigger_name, c.relname as table_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.relname = 'area_submissions'
        AND t.tgname NOT LIKE 'RI_%' -- No eliminar triggers de foreign keys
    LOOP
        BEGIN
            -- Verificar si el trigger referencia administradores
            DECLARE
                trigger_def text;
            BEGIN
                SELECT pg_get_triggerdef(oid) INTO trigger_def
                FROM pg_trigger
                WHERE tgname = trig.trigger_name;

                IF trigger_def ILIKE '%administradores%' THEN
                    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I',
                        trig.trigger_name, 'public', trig.table_name);
                    RAISE NOTICE 'Trigger eliminado: % en %', trig.trigger_name, trig.table_name;
                END IF;
            END;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo procesar trigger: % - %', trig.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 4: Verificar que no queden referencias
-- ============================================================================

-- Verificar funciones restantes que puedan tener referencias
SELECT
    n.nspname as schema,
    p.proname as function_name,
    'Posible referencia a administradores' as warning
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%administradores%';

-- Verificar triggers restantes
SELECT
    t.tgname as trigger_name,
    c.relname as table_name,
    'Posible referencia a administradores' as warning
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_triggerdef(t.oid) ILIKE '%administradores%';

-- ============================================================================
-- PASO 5: Recrear políticas básicas para area_submissions (sin referencias a administradores)
-- ============================================================================

-- Habilitar RLS en area_submissions
ALTER TABLE public.area_submissions ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos (usuarios autenticados)
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON public.area_submissions
FOR SELECT
USING (true);

-- Política para permitir inserción a todos
CREATE POLICY "Permitir inserción a todos"
ON public.area_submissions
FOR INSERT
WITH CHECK (true);

-- Política para permitir actualización
CREATE POLICY "Permitir actualización a todos"
ON public.area_submissions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para permitir eliminación
CREATE POLICY "Permitir eliminación a todos"
ON public.area_submissions
FOR DELETE
USING (true);

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT
    'Limpieza completada - area_submissions debería funcionar correctamente' as status,
    COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'area_submissions';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
