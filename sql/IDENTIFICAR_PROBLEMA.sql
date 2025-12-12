-- ============================================================================
-- IDENTIFICAR QUÉ ESTÁ CAUSANDO EL ERROR
-- ============================================================================

-- 1. Ver TODOS los triggers en area_submissions
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'public.area_submissions'::regclass
AND tgname NOT LIKE 'RI_%'  -- Excluir triggers de integridad referencial
ORDER BY tgname;

-- 2. Ver definición de funciones asociadas a los triggers
SELECT
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'public.area_submissions'::regclass
AND tgname NOT LIKE 'RI_%';
