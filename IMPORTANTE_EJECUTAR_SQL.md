# 🚨 IMPORTANTE: Ejecutar SQL para permitir reportes de docentes

Para que el chatbot pueda crear reportes de docentes, necesitas ejecutar el siguiente SQL en tu base de datos de Supabase:

## Pasos:

1. Ve a tu panel de **Supabase** → https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Copia y pega el siguiente SQL:

```sql
-- ============================================================================
-- FIX: Permitir reportes de docentes sin alumno_id
-- ============================================================================

-- PASO 1: Eliminar la constraint existente de foreign key
ALTER TABLE public.area_submissions
DROP CONSTRAINT IF EXISTS fk_alumno_id;

ALTER TABLE public.area_submissions
DROP CONSTRAINT IF EXISTS area_submissions_alumno_id_fkey;

-- PASO 2: Modificar la columna alumno_id para permitir NULL
ALTER TABLE public.area_submissions
ALTER COLUMN alumno_id DROP NOT NULL;

-- PASO 3: Crear nueva constraint que permite NULL
ALTER TABLE public.area_submissions
ADD CONSTRAINT fk_alumno_id
FOREIGN KEY (alumno_id)
REFERENCES public.data_alumnos(id)
ON DELETE SET NULL;

-- PASO 4: Actualizar registros existentes de docentes
UPDATE public.area_submissions
SET alumno_id = NULL
WHERE es_docente = true AND alumno_id = 0;

-- VERIFICACIÓN
SELECT
    'Constraint actualizada correctamente' as status,
    COUNT(*) FILTER (WHERE alumno_id IS NULL AND es_docente = true) as reportes_docentes_sin_alumno,
    COUNT(*) FILTER (WHERE alumno_id IS NOT NULL) as reportes_con_alumno
FROM public.area_submissions;
```

5. Haz clic en **Run** o presiona `Ctrl + Enter`
6. Deberías ver un mensaje de éxito

## ¿Qué hace este SQL?

- ✅ Permite que `alumno_id` sea `NULL` en la tabla `area_submissions`
- ✅ Esto es necesario para que los reportes de docentes no necesiten un `alumno_id`
- ✅ Mantiene la integridad referencial con una foreign key que acepta NULL

## Después de ejecutar el SQL:

El chatbot podrá:
- ✅ Reconocer docentes por DNI (8 dígitos)
- ✅ Crear reportes sin `alumno_id`
- ✅ Marcar automáticamente los reportes como `es_docente = true`

---

**Archivo SQL completo:** `sql/fix_foreign_key_docentes.sql`
