-- ============================================================================
-- FIX: Deshabilitar RLS en tabla administradores
-- ============================================================================
-- Este script soluciona el error de recursión infinita en la tabla administradores
-- Fecha: 2025-12-11
-- ============================================================================

-- Deshabilitar RLS en la tabla administradores (si existe)
ALTER TABLE IF EXISTS public.administradores DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes (limpieza)
DROP POLICY IF EXISTS "Administradores pueden ver administradores" ON public.administradores;
DROP POLICY IF EXISTS "Administradores pueden gestionar administradores" ON public.administradores;
DROP POLICY IF EXISTS "admin_select_policy" ON public.administradores;
DROP POLICY IF EXISTS "admin_insert_policy" ON public.administradores;
DROP POLICY IF EXISTS "admin_update_policy" ON public.administradores;
DROP POLICY IF EXISTS "admin_delete_policy" ON public.administradores;

-- Verificar que RLS esté deshabilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'administradores'
    AND schemaname = 'public';

-- Mostrar resultado
SELECT 'RLS deshabilitado en tabla administradores' as status;
