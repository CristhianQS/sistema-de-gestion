-- ============================================================================
-- TABLA DE DOCENTES - Sistema de Gestión UPEU
-- ============================================================================
-- Este script crea la tabla para gestionar datos de docentes
-- Fecha: 2025-12-11
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA DE DOCENTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.docentes (
    id BIGSERIAL PRIMARY KEY,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    email TEXT,
    telefono TEXT,
    especialidad TEXT,
    departamento TEXT,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'licencia')),
    fecha_ingreso DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_docentes_dni ON public.docentes(dni);
CREATE INDEX IF NOT EXISTS idx_docentes_email ON public.docentes(email);
CREATE INDEX IF NOT EXISTS idx_docentes_estado ON public.docentes(estado);
CREATE INDEX IF NOT EXISTS idx_docentes_nombres ON public.docentes(nombres);
CREATE INDEX IF NOT EXISTS idx_docentes_apellidos ON public.docentes(apellidos);

-- Comentarios para documentación
COMMENT ON TABLE public.docentes IS 'Tabla que almacena información de los docentes de la universidad';
COMMENT ON COLUMN public.docentes.nombres IS 'Nombres del docente';
COMMENT ON COLUMN public.docentes.apellidos IS 'Apellidos del docente';
COMMENT ON COLUMN public.docentes.dni IS 'DNI del docente (único)';
COMMENT ON COLUMN public.docentes.email IS 'Email institucional del docente';
COMMENT ON COLUMN public.docentes.telefono IS 'Número de teléfono de contacto';
COMMENT ON COLUMN public.docentes.especialidad IS 'Especialidad o área del docente';
COMMENT ON COLUMN public.docentes.departamento IS 'Departamento académico al que pertenece';
COMMENT ON COLUMN public.docentes.estado IS 'Estado del docente: activo, inactivo, licencia';
COMMENT ON COLUMN public.docentes.fecha_ingreso IS 'Fecha de ingreso a la institución';

-- ============================================================================
-- PASO 2: ROW LEVEL SECURITY (DESHABILITADO)
-- ============================================================================
-- NOTA: RLS está deshabilitado porque este sistema usa autenticación personalizada
-- a nivel de aplicación (tabla admin_user) en lugar de Supabase Auth.
-- La seguridad se maneja mediante el sistema de login de la aplicación.

-- Asegurar que RLS esté deshabilitado (por defecto lo está, pero lo hacemos explícito)
ALTER TABLE public.docentes DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (limpieza)
DROP POLICY IF EXISTS "Todos pueden ver docentes" ON public.docentes;
DROP POLICY IF EXISTS "Solo admin puede insertar docentes" ON public.docentes;
DROP POLICY IF EXISTS "Solo admin puede actualizar docentes" ON public.docentes;
DROP POLICY IF EXISTS "Solo admin puede eliminar docentes" ON public.docentes;

-- ============================================================================
-- PASO 3: FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_docentes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger para actualizar automáticamente updated_at
DROP TRIGGER IF EXISTS trigger_update_docentes_updated_at ON public.docentes;

CREATE TRIGGER trigger_update_docentes_updated_at
    BEFORE UPDATE ON public.docentes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_docentes_updated_at();

-- ============================================================================
-- PASO 4: FUNCIÓN PARA VALIDAR DNI
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_docente_dni()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar que el DNI tenga 8 dígitos
    IF LENGTH(NEW.dni) != 8 OR NEW.dni !~ '^[0-9]+$' THEN
        RAISE EXCEPTION 'El DNI debe tener exactamente 8 dígitos numéricos';
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger para validar DNI
DROP TRIGGER IF EXISTS trigger_validate_docente_dni ON public.docentes;

CREATE TRIGGER trigger_validate_docente_dni
    BEFORE INSERT OR UPDATE ON public.docentes
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_docente_dni();

-- ============================================================================
-- PASO 5: FUNCIONES AUXILIARES
-- ============================================================================

-- Función para buscar docentes por nombre
CREATE OR REPLACE FUNCTION public.search_docentes(search_term TEXT)
RETURNS TABLE (
    id BIGINT,
    nombres TEXT,
    apellidos TEXT,
    dni TEXT,
    email TEXT,
    telefono TEXT,
    especialidad TEXT,
    departamento TEXT,
    estado TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.nombres,
        d.apellidos,
        d.dni,
        d.email,
        d.telefono,
        d.especialidad,
        d.departamento,
        d.estado
    FROM public.docentes d
    WHERE
        d.nombres ILIKE '%' || search_term || '%'
        OR d.apellidos ILIKE '%' || search_term || '%'
        OR d.dni ILIKE '%' || search_term || '%'
        OR d.email ILIKE '%' || search_term || '%'
    ORDER BY d.apellidos, d.nombres;
END;
$$;

-- Función para obtener docentes por estado
CREATE OR REPLACE FUNCTION public.get_docentes_by_estado(p_estado TEXT DEFAULT 'activo')
RETURNS TABLE (
    id BIGINT,
    nombres TEXT,
    apellidos TEXT,
    dni TEXT,
    email TEXT,
    telefono TEXT,
    especialidad TEXT,
    departamento TEXT,
    estado TEXT,
    fecha_ingreso DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.nombres,
        d.apellidos,
        d.dni,
        d.email,
        d.telefono,
        d.especialidad,
        d.departamento,
        d.estado,
        d.fecha_ingreso
    FROM public.docentes d
    WHERE d.estado = p_estado
    ORDER BY d.apellidos, d.nombres;
END;
$$;

-- ============================================================================
-- PASO 6: DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Insertar algunos docentes de ejemplo
INSERT INTO public.docentes (nombres, apellidos, dni, email, especialidad, departamento, fecha_ingreso)
VALUES
    ('Juan Carlos', 'Pérez García', '12345678', 'jperez@upeu.edu.pe', 'Matemáticas', 'Ciencias Exactas', '2020-03-01'),
    ('María Elena', 'Rodríguez López', '87654321', 'mrodriguez@upeu.edu.pe', 'Literatura', 'Humanidades', '2019-08-15'),
    ('Roberto', 'Sánchez Torres', '11223344', 'rsanchez@upeu.edu.pe', 'Programación', 'Ingeniería', '2021-02-10')
ON CONFLICT (dni) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que la tabla se creó correctamente
SELECT
    'Tabla de docentes creada correctamente' as status,
    COUNT(*) as total_docentes
FROM public.docentes;

-- Mostrar estructura de la tabla
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'docentes'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
