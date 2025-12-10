-- ============================================================================
-- CONFIGURACIÓN POST-INSTALACIÓN
-- ============================================================================
-- Después de ejecutar EJECUTAR_ESTE_SQL.sql, usa estos comandos para
-- configurar emails y áreas asignadas
-- ============================================================================

-- ============================================================================
-- 1. ACTUALIZAR EMAILS DE ADMINISTRADORES
-- ============================================================================

-- Cambiar email de Admin BLACK (reemplaza con el email real)
UPDATE administradores
SET email = 'TU_EMAIL_BLACK@upeu.edu.pe'  -- ⚠️ CAMBIAR ESTE EMAIL
WHERE nombre = 'Black';

-- Cambiar email de Admin ORO (reemplaza con el email real)
UPDATE administradores
SET email = 'TU_EMAIL_ORO@upeu.edu.pe'  -- ⚠️ CAMBIAR ESTE EMAIL
WHERE nombre = 'Oro';

-- ============================================================================
-- 2. VER TODAS LAS ÁREAS DISPONIBLES
-- ============================================================================

-- Ejecuta esto para ver qué áreas tienes en tu sistema
SELECT
    id,
    name as nombre_area,
    description as descripcion
FROM areas
ORDER BY id;

-- ============================================================================
-- 3. ASIGNAR ÁREAS A ADMIN ORO
-- ============================================================================

-- Opción A: Asignar áreas específicas (ejemplo: áreas 2, 7, 8)
UPDATE administradores
SET areas_asignadas = ARRAY[2, 7, 8]  -- ⚠️ CAMBIAR POR LOS IDs DE TUS ÁREAS
WHERE nombre = 'Oro';

-- Opción B: Asignar TODAS las áreas existentes
UPDATE administradores
SET areas_asignadas = (
    SELECT ARRAY_AGG(id) FROM areas
)
WHERE nombre = 'Oro';

-- Opción C: No asignar ninguna área (ORO no recibirá notificaciones)
UPDATE administradores
SET areas_asignadas = ARRAY[]::INTEGER[]
WHERE nombre = 'Oro';

-- ============================================================================
-- 4. CONFIGURAR ENCARGADOS DE ÁREA
-- ============================================================================

-- Plantilla para asignar encargado a un área
UPDATE areas
SET
    encargado_nombre = 'NOMBRE DEL ENCARGADO',  -- ⚠️ CAMBIAR
    encargado_email = 'encargado@upeu.edu.pe'   -- ⚠️ CAMBIAR
WHERE id = 1;  -- ⚠️ CAMBIAR POR EL ID DEL ÁREA

-- Ejemplo: Asignar encargado al área DTI (suponiendo que DTI tiene id=7)
UPDATE areas
SET
    encargado_nombre = 'Juan Pérez',
    encargado_email = 'juan.perez@upeu.edu.pe'
WHERE name = 'DTI';

-- ============================================================================
-- 5. VERIFICAR CONFIGURACIÓN
-- ============================================================================

-- Ver todos los administradores y sus áreas asignadas
SELECT
    nombre,
    email,
    rol,
    CASE
        WHEN rol = 'super_admin' THEN 'TODAS LAS ÁREAS'
        WHEN areas_asignadas IS NULL OR array_length(areas_asignadas, 1) IS NULL THEN 'Sin áreas'
        ELSE array_length(areas_asignadas, 1)::TEXT || ' áreas'
    END as cantidad_areas,
    areas_asignadas
FROM administradores
ORDER BY rol DESC, nombre;

-- Ver qué áreas están asignadas a Admin ORO (con nombres)
SELECT
    a.id,
    a.name as nombre_area,
    CASE
        WHEN a.id = ANY(ad.areas_asignadas) THEN '✅ Asignada a ORO'
        ELSE '❌ No asignada'
    END as estado
FROM areas a
CROSS JOIN (
    SELECT areas_asignadas
    FROM administradores
    WHERE nombre = 'Oro'
) ad
ORDER BY a.id;

-- Ver encargados configurados
SELECT
    id,
    name as nombre_area,
    encargado_nombre,
    encargado_email,
    CASE
        WHEN encargado_email IS NOT NULL THEN '✅ Configurado'
        ELSE '❌ Sin encargado'
    END as estado
FROM areas
ORDER BY id;

-- ============================================================================
-- 6. PRUEBA DEL SISTEMA
-- ============================================================================

-- Ver notificaciones existentes (si ya hay reportes)
SELECT
    user_email,
    title,
    message,
    type,
    read,
    created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- Contar notificaciones por usuario
SELECT
    user_email,
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as no_leidas
FROM notifications
GROUP BY user_email
ORDER BY user_email;

-- Ver reportes y su estado de revisión
SELECT
    id,
    alumno_nombre,
    area_id,
    reviewed,
    reviewed_at,
    reviewed_by,
    submitted_at
FROM area_submissions
ORDER BY submitted_at DESC
LIMIT 10;

-- ============================================================================
-- 7. AGREGAR MÁS ADMINISTRADORES (OPCIONAL)
-- ============================================================================

-- Agregar un nuevo Admin ORO
INSERT INTO administradores (nombre, email, rol, areas_asignadas)
VALUES (
    'Admin Extra',
    'extra@upeu.edu.pe',
    'admin',
    ARRAY[3, 5, 9]  -- Áreas asignadas
)
ON CONFLICT (email) DO NOTHING;

-- Agregar otro Admin BLACK (acceso total)
INSERT INTO administradores (nombre, email, rol, areas_asignadas)
VALUES (
    'Admin Black 2',
    'black2@upeu.edu.pe',
    'super_admin',
    NULL  -- NULL = todas las áreas
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 8. MANTENIMIENTO
-- ============================================================================

-- Eliminar notificaciones antiguas (más de 30 días)
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '30 days';

-- Marcar todas las notificaciones viejas como leídas
UPDATE notifications
SET read = TRUE, read_at = NOW()
WHERE created_at < NOW() - INTERVAL '7 days'
  AND read = FALSE;

-- Eliminar un administrador
DELETE FROM administradores
WHERE email = 'email@eliminar.com';

-- Cambiar rol de un administrador
UPDATE administradores
SET rol = 'super_admin'  -- o 'admin'
WHERE email = 'email@cambiar.com';

-- ============================================================================
-- COMANDOS ÚTILES DE DIAGNÓSTICO
-- ============================================================================

-- Ver trigger activo
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_report_notifications';

-- Ver políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('notifications', 'administradores')
ORDER BY tablename, policyname;

-- Verificar índices
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('notifications', 'area_submissions', 'administradores')
ORDER BY tablename, indexname;

-- ============================================================================
-- FIN
-- ============================================================================

SELECT '✅ Configuración lista. Ahora actualiza los emails y áreas según tu necesidad.' as mensaje;
