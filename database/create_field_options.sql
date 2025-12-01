-- Tabla para almacenar las opciones de los campos tipo SELECT
-- Cada opción está relacionada con un field_id específico

CREATE TABLE IF NOT EXISTS field_options (
  id SERIAL PRIMARY KEY,
  field_id INTEGER NOT NULL REFERENCES area_fields(id) ON DELETE CASCADE,
  option_value TEXT NOT NULL,
  option_label TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(field_id, option_value)
);

-- Índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_field_options_field_id ON field_options(field_id);

-- Habilitar RLS
ALTER TABLE field_options ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Permitir SELECT a todos" ON field_options;
DROP POLICY IF EXISTS "Permitir INSERT a todos" ON field_options;
DROP POLICY IF EXISTS "Permitir UPDATE a todos" ON field_options;
DROP POLICY IF EXISTS "Permitir DELETE a todos" ON field_options;

CREATE POLICY "Permitir SELECT a todos"
ON field_options
FOR SELECT
USING (true);

CREATE POLICY "Permitir INSERT a todos"
ON field_options
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE a todos"
ON field_options
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir DELETE a todos"
ON field_options
FOR DELETE
USING (true);

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'field_options'
ORDER BY ordinal_position;
