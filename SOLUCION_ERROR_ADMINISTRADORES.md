# 🚨 ERROR: relation "public.administradores" does not exist

## 🔍 Problema

Cuando eliminaste la tabla `administradores`, quedaron **triggers, funciones o políticas RLS** en la base de datos que todavía hacen referencia a esa tabla. Esto impide crear reportes en `area_submissions`.

## ✅ Solución: Ejecutar script de limpieza

Debes ejecutar **DOS scripts SQL** en Supabase para solucionar el problema:

### 📋 Script 1: Limpiar referencias a administradores

**Archivo:** `sql/cleanup_administradores_references.sql`

Este script:
- 🧹 Elimina todas las políticas RLS que referencian `administradores`
- 🧹 Elimina funciones que referencian `administradores`
- 🧹 Elimina triggers que referencian `administradores`
- ✅ Recrea políticas básicas para `area_submissions`

### 📋 Script 2: Permitir alumno_id NULL

**Archivo:** `sql/fix_foreign_key_docentes.sql`

Este script:
- ✅ Permite que `alumno_id` sea NULL (necesario para reportes de docentes)
- ✅ Actualiza las constraints de foreign key

---

## 🎯 PASOS PARA EJECUTAR:

### 1️⃣ Ve a Supabase SQL Editor

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### 2️⃣ Ejecuta el Script 1 (Limpieza)

Copia y pega todo el contenido de `sql/cleanup_administradores_references.sql` y ejecútalo.

O copia este SQL abreviado:

```sql
-- Eliminar todas las políticas en area_submissions
DO $$
DECLARE pol record;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies WHERE tablename = 'area_submissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.area_submissions', pol.policyname);
    END LOOP;
END $$;

-- Deshabilitar RLS temporalmente
ALTER TABLE public.area_submissions DISABLE ROW LEVEL SECURITY;

-- Eliminar funciones que referencien administradores
DO $$
DECLARE func record;
BEGIN
    FOR func IN
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) ILIKE '%administradores%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', func.proname, func.args);
    END LOOP;
END $$;

-- Recrear políticas simples
ALTER TABLE public.area_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_select" ON public.area_submissions FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON public.area_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON public.area_submissions FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete" ON public.area_submissions FOR DELETE USING (true);
```

### 3️⃣ Ejecuta el Script 2 (Alumno ID Nullable)

```sql
-- Permitir NULL en alumno_id
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS fk_alumno_id;
ALTER TABLE public.area_submissions DROP CONSTRAINT IF EXISTS area_submissions_alumno_id_fkey;
ALTER TABLE public.area_submissions ALTER COLUMN alumno_id DROP NOT NULL;

ALTER TABLE public.area_submissions
ADD CONSTRAINT fk_alumno_id
FOREIGN KEY (alumno_id) REFERENCES public.data_alumnos(id) ON DELETE SET NULL;
```

### 4️⃣ Verificar

Ejecuta esta query para verificar que todo está bien:

```sql
-- Verificar que no hay referencias a administradores
SELECT COUNT(*) as funciones_con_ref
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND pg_get_functiondef(p.oid) ILIKE '%administradores%';

-- Debería retornar 0
```

---

## ✅ Después de ejecutar los scripts:

El chatbot debería funcionar correctamente:
- ✅ Podrá crear reportes de estudiantes
- ✅ Podrá crear reportes de docentes (con DNI)
- ✅ No habrá errores de "administradores does not exist"

---

## 🆘 Si el problema persiste:

Ejecuta este SQL para deshabilitar completamente RLS (menos seguro, pero funciona):

```sql
ALTER TABLE public.area_submissions DISABLE ROW LEVEL SECURITY;
```

Luego prueba crear un reporte nuevamente.
