-- Tabla intermedia para relación muchos-a-muchos entre usuarios y áreas
-- Permite que un usuario tenga múltiples áreas asignadas

CREATE TABLE IF NOT EXISTS user_areas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admin_user(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Evitar duplicados: un usuario no puede tener la misma área dos veces
  UNIQUE(user_id, area_id)
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_user_areas_user_id ON user_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_areas_area_id ON user_areas(area_id);

-- Comentarios para documentación
COMMENT ON TABLE user_areas IS 'Tabla intermedia que relaciona usuarios con áreas (relación muchos-a-muchos)';
COMMENT ON COLUMN user_areas.user_id IS 'ID del usuario administrador';
COMMENT ON COLUMN user_areas.area_id IS 'ID del área asignada';

-- Migración de datos existentes
-- Copiar las asignaciones actuales de area_id en admin_user a la nueva tabla
INSERT INTO user_areas (user_id, area_id)
SELECT id, area_id
FROM admin_user
WHERE area_id IS NOT NULL
ON CONFLICT (user_id, area_id) DO NOTHING;

-- NOTA: NO eliminamos la columna area_id de admin_user todavía
-- para mantener compatibilidad durante la transición
