-- Tabla para almacenar grupos de opciones reutilizables
-- Estas opciones se pueden usar en múltiples campos de tipo SELECT

CREATE TABLE IF NOT EXISTS selection_options (
  id SERIAL PRIMARY KEY,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  option_value TEXT NOT NULL,
  option_label TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(area_id, group_name, option_value)
);

-- Índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_selection_options_area_id ON selection_options(area_id);
CREATE INDEX IF NOT EXISTS idx_selection_options_group_name ON selection_options(area_id, group_name);

-- Habilitar RLS
ALTER TABLE selection_options ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Permitir SELECT a todos" ON selection_options;
DROP POLICY IF EXISTS "Permitir INSERT a todos" ON selection_options;
DROP POLICY IF EXISTS "Permitir UPDATE a todos" ON selection_options;
DROP POLICY IF EXISTS "Permitir DELETE a todos" ON selection_options;

CREATE POLICY "Permitir SELECT a todos"
ON selection_options
FOR SELECT
USING (true);

CREATE POLICY "Permitir INSERT a todos"
ON selection_options
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir UPDATE a todos"
ON selection_options
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir DELETE a todos"
ON selection_options
FOR DELETE
USING (true);

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'selection_options'
ORDER BY ordinal_position;
