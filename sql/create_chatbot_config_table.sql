-- ================================================
-- TABLA: chatbot_config
-- Descripción: Almacena la configuración personalizada del chatbot
-- ================================================

CREATE TABLE IF NOT EXISTS chatbot_config (
  id BIGSERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas por config_key
CREATE INDEX IF NOT EXISTS idx_chatbot_config_key ON chatbot_config(config_key);

-- Comentarios descriptivos
COMMENT ON TABLE chatbot_config IS 'Configuración personalizada del chatbot con prompts y parámetros';
COMMENT ON COLUMN chatbot_config.config_key IS 'Clave única para identificar la configuración (ej: chatbot_main_config)';
COMMENT ON COLUMN chatbot_config.config_data IS 'Datos de configuración en formato JSON (mensajes, prompts, validaciones)';
COMMENT ON COLUMN chatbot_config.created_at IS 'Fecha de creación de la configuración';
COMMENT ON COLUMN chatbot_config.updated_at IS 'Fecha de última actualización';

-- Habilitar Row Level Security
ALTER TABLE chatbot_config ENABLE ROW LEVEL SECURITY;

-- Política: Solo administradores pueden leer
CREATE POLICY "Admins pueden leer configuración del chatbot"
  ON chatbot_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo admin_black puede modificar
CREATE POLICY "Solo Admin Black puede modificar configuración"
  ON chatbot_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_user
      WHERE admin_user.email = auth.email()
      AND admin_user.role = 'admin_black'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_user
      WHERE admin_user.email = auth.email()
      AND admin_user.role = 'admin_black'
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_chatbot_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chatbot_config_timestamp
  BEFORE UPDATE ON chatbot_config
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_config_timestamp();

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tabla chatbot_config creada exitosamente';
  RAISE NOTICE 'ℹ️  Ahora puedes personalizar los prompts desde el panel Admin Black';
END $$;
