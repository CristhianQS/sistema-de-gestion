-- Agregar columna estimated_time a la tabla area_submissions
ALTER TABLE area_submissions
ADD COLUMN IF NOT EXISTS estimated_time TEXT;

-- Comentario de la columna
COMMENT ON COLUMN area_submissions.estimated_time IS 'Tiempo estimado para resolver el reporte (ej: 30min, 1h, 2h, 4h, 1d, 2d, 3d, 1w, 2w)';
