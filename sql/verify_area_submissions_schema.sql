-- ================================================
-- Verificar y Arreglar Esquema de area_submissions
-- ================================================

-- 1. Ver las columnas actuales de la tabla
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'area_submissions'
ORDER BY ordinal_position;

-- 2. Si falta created_at, agregarlo
-- (Descomenta esta línea si la columna no existe)
-- ALTER TABLE public.area_submissions
-- ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Si falta updated_at, agregarlo
-- (Descomenta esta línea si la columna no existe)
-- ALTER TABLE public.area_submissions
-- ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Agregar trigger para updated_at (opcional pero recomendado)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_area_submissions_updated_at
--     BEFORE UPDATE ON public.area_submissions
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Verificación Adicional
-- ================================================

-- Ver la estructura completa de la tabla
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'area_submissions'
ORDER BY ordinal_position;
