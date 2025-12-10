-- ==================================================
-- Script para arreglar el error 406 en chatbot_config
-- ==================================================
-- Este script soluciona problemas de permisos RLS que causan error 406

-- 1. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.chatbot_config (
    id BIGSERIAL PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Deshabilitar RLS temporalmente si está causando problemas
-- (En producción, es mejor configurar políticas apropiadas)
ALTER TABLE public.chatbot_config DISABLE ROW LEVEL SECURITY;

-- 3. Dar permisos públicos de lectura
GRANT SELECT ON public.chatbot_config TO anon;
GRANT SELECT ON public.chatbot_config TO authenticated;

-- 4. Dar permisos de escritura a usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON public.chatbot_config TO authenticated;

-- 5. Dar permisos en la secuencia (para INSERTs)
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_config_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_config_id_seq TO authenticated;

-- 6. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_chatbot_config_key ON public.chatbot_config(config_key);

-- ==================================================
-- ALTERNATIVA CON RLS HABILITADO (Más seguro)
-- ==================================================
-- Si prefieres usar RLS (recomendado para producción):

-- Paso 1: Habilitar RLS
-- ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;

-- Paso 2: Crear políticas permisivas
-- Permitir lectura a todos (anon y authenticated)
-- CREATE POLICY "Allow public read access" ON public.chatbot_config
--     FOR SELECT
--     TO anon, authenticated
--     USING (true);

-- Permitir escritura solo a usuarios autenticados
-- CREATE POLICY "Allow authenticated write access" ON public.chatbot_config
--     FOR ALL
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- ==================================================
-- Verificación
-- ==================================================
-- Ejecutar estas queries para verificar que funcione:

-- Ver permisos de la tabla
-- SELECT grantee, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_name = 'chatbot_config';

-- Ver estado de RLS
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'chatbot_config';

-- Ver políticas RLS (si RLS está habilitado)
-- SELECT * FROM pg_policies WHERE tablename = 'chatbot_config';

-- ==================================================
-- Insertar configuración por defecto (opcional)
-- ==================================================
INSERT INTO public.chatbot_config (config_key, config_data)
VALUES (
    'chatbot_main_config',
    '{
        "mensajes": {
            "bienvenida": "¡Hola! Soy tu asistente virtual de UPEU",
            "esperandoCodigo": "Por favor, ingresa tu código de estudiante",
            "codigoInvalido": "El código ingresado no es válido",
            "codigoNoEncontrado": "No encontré tu código en el sistema"
        },
        "solicitudes": {
            "seleccionArea": "Selecciona el área relacionada con tu consulta",
            "descripcionMuyCorta": "Por favor, describe tu problema con más detalle",
            "ubicacion": "¿En qué ubicación se encuentra el problema?",
            "ubicacionInvalida": "Por favor, especifica una ubicación válida"
        },
        "confirmaciones": {
            "creandoReporte": "Estoy creando tu reporte..."
        },
        "validacion": {
            "codigoMinLength": 6,
            "descripcionMinLength": 10
        }
    }'::jsonb
)
ON CONFLICT (config_key)
DO NOTHING;

-- Mensaje de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla chatbot_config configurada correctamente';
    RAISE NOTICE '✅ Permisos RLS configurados';
    RAISE NOTICE '✅ El error 406 debería estar resuelto';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Recarga tu aplicación para aplicar los cambios';
END $$;
