# Solución al Error 406 - Supabase

## 🔴 **Problema**
```
GET https://.../rest/v1/chatbot_config?select=config_data&config_key=eq.chatbot_main_config
406 (Not Acceptable)
```

## ❓ **¿Qué Causa el Error 406?**

El error **406 (Not Acceptable)** en Supabase ocurre por:

1. **RLS (Row Level Security) habilitado SIN políticas configuradas**
   - Supabase bloquea el acceso pero devuelve 406 en lugar de 403

2. **Permisos de tabla incorrectos**
   - Los roles `anon` o `authenticated` no tienen permisos SELECT/INSERT

3. **La tabla no existe**
   - El endpoint existe pero la tabla no está creada

## ✅ **Solución Rápida (2 minutos)**

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com/dashboard)
2. Haz clic en **SQL Editor** en el menú lateral
3. Crea una nueva query

### Paso 2: Ejecutar el Script SQL

Copia y pega el contenido de `sql/fix_chatbot_config_permissions.sql` y ejecútalo.

**O ejecuta esto directamente:**

```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE public.chatbot_config DISABLE ROW LEVEL SECURITY;

-- Dar permisos públicos
GRANT SELECT ON public.chatbot_config TO anon;
GRANT SELECT ON public.chatbot_config TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chatbot_config TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.chatbot_config_id_seq TO authenticated;
```

### Paso 3: Verificar

Ejecuta esta query para verificar:

```sql
SELECT * FROM chatbot_config WHERE config_key = 'chatbot_main_config';
```

Si devuelve resultados o un conjunto vacío (no un error), ¡está funcionando!

### Paso 4: Recargar la Aplicación

1. Cierra y vuelve a abrir tu navegador
2. Limpia el caché (Ctrl + Shift + R)
3. El error 406 debería desaparecer

## 🔒 **Solución Segura (Para Producción)**

Si quieres mantener RLS habilitado (recomendado):

```sql
-- 1. Habilitar RLS
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;

-- 2. Crear política de lectura pública
CREATE POLICY "Allow public read chatbot_config"
ON public.chatbot_config
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Crear política de escritura para autenticados
CREATE POLICY "Allow authenticated write chatbot_config"
ON public.chatbot_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

## 🐛 **Debugging Adicional**

### Verificar permisos de la tabla:
```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'chatbot_config';
```

Deberías ver algo como:
```
grantee        | privilege_type
---------------|---------------
anon           | SELECT
authenticated  | SELECT
authenticated  | INSERT
authenticated  | UPDATE
authenticated  | DELETE
```

### Verificar estado de RLS:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'chatbot_config';
```

### Ver políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'chatbot_config';
```

## 📋 **Checklist de Verificación**

- [ ] La tabla `chatbot_config` existe
- [ ] RLS está deshabilitado O tiene políticas configuradas
- [ ] Los roles `anon` y `authenticated` tienen permisos SELECT
- [ ] El rol `authenticated` tiene permisos INSERT/UPDATE/DELETE
- [ ] La secuencia tiene permisos USAGE
- [ ] La aplicación está recargada con caché limpio

## 🚀 **Después de Arreglarlo**

El error 406 desaparecerá y verás en la consola:

```
✅ Configuración del chatbot cargada desde la base de datos
```

O si no hay configuración guardada:

```
ℹ️ No hay configuración guardada, usando valores por defecto
```

Ambos son correctos. El sistema funcionará con o sin configuración guardada.

## 💡 **Prevención Futura**

Para evitar este error en otras tablas:

1. **Siempre configura RLS con políticas** al crear tablas públicas
2. **O deshabilita RLS completamente** en tablas que no necesitan seguridad
3. **Otorga permisos explícitos** a los roles anon/authenticated
4. **Documenta los permisos** de cada tabla en tu proyecto

## 🆘 **Si Sigue Fallando**

Si después de estos pasos aún tienes el error:

1. Verifica las credenciales en `.env`:
   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-key-aqui
   ```

2. Verifica que la URL en el error coincida con tu proyecto

3. Revisa la consola del navegador para errores adicionales

4. Prueba acceder a la tabla desde la API REST directamente:
   ```
   https://TU-PROYECTO.supabase.co/rest/v1/chatbot_config
   ```

5. Si nada funciona, considera comentar temporalmente la carga de configuración:
   ```typescript
   // En ChatbotAsistente.tsx
   // await loadCustomConfig(); // Comentar temporalmente
   ```

---

**Última actualización:** 2025-12-10
**Aplicable a:** Supabase PostgreSQL 15.x
