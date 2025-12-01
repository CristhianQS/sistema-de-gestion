-- Habilitar acceso a la tabla data_alumnos
-- Ejecutar este script en Supabase SQL Editor

-- Opción 1: Deshabilitar RLS (más simple, menos seguro)
-- Descomentar la siguiente línea si quieres deshabilitar RLS completamente
-- ALTER TABLE data_alumnos DISABLE ROW LEVEL SECURITY;

-- Opción 2: Habilitar RLS con políticas (más seguro, recomendado)
-- Esto permite acceso de lectura a todos los usuarios autenticados

-- Habilitar RLS si no está habilitado
ALTER TABLE data_alumnos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (evita errores)
DROP POLICY IF EXISTS "Permitir SELECT a todos" ON data_alumnos;
DROP POLICY IF EXISTS "Permitir INSERT a todos" ON data_alumnos;
DROP POLICY IF EXISTS "Permitir UPDATE a todos" ON data_alumnos;
DROP POLICY IF EXISTS "Permitir DELETE a todos" ON data_alumnos;

-- Crear política para permitir SELECT (lectura) a todos
CREATE POLICY "Permitir SELECT a todos"
ON data_alumnos
FOR SELECT
USING (true);

-- Crear política para permitir INSERT (escritura) a todos
CREATE POLICY "Permitir INSERT a todos"
ON data_alumnos
FOR INSERT
WITH CHECK (true);

-- Crear política para permitir UPDATE (actualización) a todos
CREATE POLICY "Permitir UPDATE a todos"
ON data_alumnos
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Crear política para permitir DELETE (eliminación) a todos
CREATE POLICY "Permitir DELETE a todos"
ON data_alumnos
FOR DELETE
USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'data_alumnos';
