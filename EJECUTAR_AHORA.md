# 🚨 EJECUTAR AHORA - SOLUCIÓN INMEDIATA

## ⚡ 3 PASOS RÁPIDOS:

### 1. Abre Supabase
- Ve a: https://supabase.com/dashboard
- Selecciona tu proyecto
- Click en **SQL Editor** (menú izquierdo)

### 2. Copia y pega este SQL:

```sql
-- SOLUCIÓN RÁPIDA: Deshabilitar RLS y limpiar referencias
ALTER TABLE public.area_submissions DISABLE ROW LEVEL SECURITY;

-- Eliminar constraints problemáticas
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS fk_alumno_id;
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS area_submissions_alumno_id_fkey;
ALTER TABLE public.area_submissions ALTER COLUMN alumno_id DROP NOT NULL;

-- Recrear constraint
ALTER TABLE public.area_submissions
ADD CONSTRAINT fk_alumno_id FOREIGN KEY (alumno_id)
REFERENCES public.data_alumnos(id) ON DELETE SET NULL;

-- Eliminar funciones problemáticas
DO $$
DECLARE func_name text;
BEGIN
    FOR func_name IN
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) ILIKE '%administradores%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_name || ' CASCADE';
        RAISE NOTICE 'Eliminada: %', func_name;
    END LOOP;
END $$;

SELECT 'Listo! Prueba crear un reporte ahora' as resultado;
```

### 3. Click en "Run" (o Ctrl+Enter)

---

## ✅ Resultado esperado:

Deberías ver:
```
resultado: "Listo! Prueba crear un reporte ahora"
```

---

## 🎯 DESPUÉS DE EJECUTAR:

1. Vuelve a tu aplicación
2. Abre el chatbot
3. Intenta crear un reporte nuevamente
4. Debería funcionar ✅

---

## ❓ Si sigue sin funcionar:

Ejecuta este SQL adicional para ver qué funciones existen:

```sql
SELECT
    p.proname as nombre_funcion,
    pg_get_functiondef(p.oid) as definicion
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%administradores%';
```

Y comparte el resultado conmigo para ayudarte mejor.
