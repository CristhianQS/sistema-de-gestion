# 🚀 Guía de Implementación del Sistema de Notificaciones

## ✅ Estado del Proyecto

**COMPLETADO** - Todos los archivos necesarios están creados y listos para usar.

---

## 📋 Checklist de Implementación

### Fase 1: Base de Datos (Supabase)

#### ✅ Paso 1.1: Ejecutar Script Base
1. Ir a **Supabase Dashboard** → **SQL Editor**
2. Abrir archivo: `sql/create_notifications_system.sql`
3. Copiar todo el contenido
4. Pegar en el editor SQL
5. Click **Run** ▶️

**Resultado esperado:**
- ✅ Tabla `administradores` creada
- ✅ Tabla `notifications` creada
- ✅ Campos `encargado_email` y `encargado_nombre` agregados a `areas`
- ✅ Admin BLACK insertado
- ✅ Trigger de notificaciones creado

#### ✅ Paso 1.2: Actualizar Sistema para BLACK y ORO
1. En el **SQL Editor** de Supabase
2. Abrir archivo: `sql/update_notifications_system_admins.sql`
3. Copiar todo el contenido
4. Pegar en el editor SQL
5. Click **Run** ▶️

**Resultado esperado:**
- ✅ Campos `reviewed`, `reviewed_at`, `reviewed_by` agregados a `area_submissions`
- ✅ Campo `areas_asignadas` agregado a `administradores`
- ✅ Admin ORO insertado
- ✅ Funciones SQL para marcar como revisado
- ✅ Trigger actualizado para notificar según áreas asignadas

#### ✅ Paso 1.3: Configurar Emails de Administradores

```sql
-- Actualizar email de BLACK
UPDATE administradores
SET email = 'black@upeu.edu.pe'  -- Cambiar por el email real
WHERE nombre = 'Black';

-- Actualizar email de ORO
UPDATE administradores
SET email = 'oro@upeu.edu.pe'  -- Cambiar por el email real
WHERE nombre = 'Oro';
```

#### ✅ Paso 1.4: Asignar Áreas a Admin ORO

```sql
-- Ver todas las áreas disponibles
SELECT id, name FROM areas ORDER BY id;

-- Ejemplo: Asignar áreas 2, 7, 8 a Admin ORO
UPDATE administradores
SET areas_asignadas = ARRAY[2, 7, 8]  -- Cambiar por los IDs de áreas reales
WHERE nombre = 'Oro';
```

#### ✅ Paso 1.5: Configurar Encargados de Área

```sql
-- Ver áreas actuales
SELECT id, name, encargado_nombre, encargado_email FROM areas;

-- Ejemplo: Asignar encargado al área DTI (ID 7)
UPDATE areas
SET
  encargado_nombre = 'Juan Pérez',
  encargado_email = 'juan.perez@upeu.edu.pe'
WHERE id = 7;

-- Repetir para cada área
```

---

### Fase 2: Verificación en Supabase

#### ✅ Paso 2.1: Verificar Administradores

```sql
SELECT * FROM administradores ORDER BY id;
```

**Deberías ver:**
| id | nombre | email | rol | areas_asignadas |
|----|--------|-------|-----|-----------------|
| 1 | Black | black@upeu.edu.pe | super_admin | NULL |
| 2 | Oro | oro@upeu.edu.pe | admin | {2,7,8} |

#### ✅ Paso 2.2: Verificar Campos de Revisión

```sql
SELECT id, alumno_nombre, reviewed, reviewed_at, reviewed_by
FROM area_submissions
ORDER BY created_at DESC
LIMIT 5;
```

#### ✅ Paso 2.3: Probar Trigger de Notificaciones

```sql
-- Ver notificaciones recientes
SELECT
  id,
  user_email,
  title,
  type,
  related_area_id,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
```

---

### Fase 3: Integración en el Frontend

#### ✅ Paso 3.1: Verificar Archivos Frontend

**Servicios:**
- ✅ `src/services/database/notifications.service.ts`
- ✅ `src/services/database/submissions.service.ts` (actualizado)

**Componentes:**
- ✅ `src/components/notifications/NotificationBell.tsx`
- ✅ `src/components/notifications/NotificationsList.tsx`
- ✅ `src/components/notifications/NotificationPermissionBanner.tsx`
- ✅ `src/components/ReviewIndicator.tsx`

**Hooks:**
- ✅ `src/hooks/useNotifications.ts`

**Utilidades:**
- ✅ `src/utils/browserNotifications.ts`

**Tipos:**
- ✅ `src/types/index.ts` (actualizado con campos `reviewed`)

#### ✅ Paso 3.2: Agregar NotificationBell al Layout

**Ubicación recomendada:** En el header/navbar de tu aplicación

**Ejemplo para `src/App.tsx` o tu componente de layout:**

```tsx
import NotificationBell from './components/notifications/NotificationBell';
import NotificationPermissionBanner from './components/notifications/NotificationPermissionBanner';

function App() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Obtener email del usuario logueado
    // Ejemplo: desde localStorage, context, o Supabase auth
    const email = localStorage.getItem('admin_email');
    setUserEmail(email);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de permisos de notificación */}
      <NotificationPermissionBanner />

      {/* Header con campana de notificaciones */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sistema de Gestión</h1>

          {/* CAMPANA DE NOTIFICACIONES */}
          <div className="flex items-center space-x-4">
            {userEmail && <NotificationBell userEmail={userEmail} />}
            <span className="text-sm text-gray-600">{userEmail}</span>
          </div>
        </div>
      </header>

      {/* Resto de tu aplicación */}
      <main>
        {/* ... */}
      </main>
    </div>
  );
}
```

#### ✅ Paso 3.3: Agregar ReviewIndicator a la Lista de Reportes

**Consulta la guía detallada:** `EJEMPLO_USO_CAMPANITA.md`

**Ejemplo rápido:**

```tsx
import ReviewIndicator from '../components/ReviewIndicator';
import { markAsReviewed } from '../services/database/submissions.service';

function ReportesList() {
  const [reportes, setReportes] = useState<AreaSubmission[]>([]);
  const userEmail = 'admin@upeu.edu.pe'; // Email del admin logueado

  const handleMarkReviewed = async (id: number) => {
    await markAsReviewed(id, userEmail);
    await loadReportes(); // Recargar lista
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Estado</th>
          <th>Área</th>
          <th>Estudiante</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {reportes.map(reporte => (
          <tr key={reporte.id}>
            <td>
              <button onClick={() => handleMarkReviewed(reporte.id)}>
                <ReviewIndicator
                  reviewed={reporte.reviewed || false}
                  reviewedAt={reporte.reviewed_at}
                  reviewedBy={reporte.reviewed_by}
                />
              </button>
            </td>
            <td>{reporte.area?.name}</td>
            <td>{reporte.alumno_nombre}</td>
            <td>{new Date(reporte.submitted_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**IMPORTANTE:** Asegúrate de que tus queries incluyan los campos de revisión:

```typescript
const { data } = await supabase
  .from('area_submissions')
  .select(`
    *,
    reviewed,        // ← AGREGAR
    reviewed_at,     // ← AGREGAR
    reviewed_by,     // ← AGREGAR
    area:areas(id, name, description)
  `)
  .order('created_at', { ascending: false });
```

---

### Fase 4: Pruebas

#### ✅ Paso 4.1: Probar Notificaciones In-App

1. Abrir la aplicación con el email de Admin BLACK
2. Crear un nuevo reporte en cualquier área
3. **Verificar:** La campana debe mostrar un contador con "1"
4. Click en la campana
5. **Verificar:** Se muestra la notificación del nuevo reporte

#### ✅ Paso 4.2: Probar Notificaciones de Navegador

1. Al abrir la app por primera vez, aparece banner solicitando permisos
2. Click en "Permitir notificaciones"
3. Crear un nuevo reporte
4. **Verificar:** Notificación push del navegador aparece (incluso si el navegador está en segundo plano)

#### ✅ Paso 4.3: Probar Sistema BLACK/ORO

**Configuración de prueba:**
```sql
-- Admin BLACK: ve TODAS las áreas
-- Admin ORO: solo ve áreas 2, 7, 8

-- Crear reporte en área 7 (DTI)
-- Verificar que BLACK y ORO reciben notificación

-- Crear reporte en área 5 (otra área)
-- Verificar que solo BLACK recibe notificación
```

**Query para verificar:**
```sql
SELECT
  n.user_email,
  n.title,
  a.name as area_nombre
FROM notifications n
JOIN area_submissions s ON n.related_submission_id = s.id
JOIN areas a ON s.area_id = a.id
WHERE n.created_at > NOW() - INTERVAL '1 hour'
ORDER BY n.created_at DESC;
```

#### ✅ Paso 4.4: Probar Indicador de Revisión

1. Ver lista de reportes
2. **Verificar:** Reportes nuevos tienen campanita roja parpadeante 🔴
3. Click en una campanita roja
4. **Verificar:** Campanita cambia a verde con checkmark ✅
5. Hover sobre campanita verde
6. **Verificar:** Tooltip muestra fecha y usuario que revisó

---

## 🔧 Comandos SQL Útiles

### Ver Notificaciones de un Usuario

```sql
SELECT
  id,
  title,
  message,
  type,
  read,
  created_at
FROM notifications
WHERE user_email = 'black@upeu.edu.pe'
ORDER BY created_at DESC
LIMIT 20;
```

### Ver Reportes No Revisados

```sql
SELECT
  id,
  alumno_nombre,
  area_id,
  reviewed,
  submitted_at
FROM area_submissions
WHERE reviewed = FALSE
ORDER BY submitted_at DESC;
```

### Contar Notificaciones por Usuario

```sql
SELECT
  user_email,
  COUNT(*) as total,
  SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as no_leidas
FROM notifications
GROUP BY user_email
ORDER BY user_email;
```

### Ver Áreas Asignadas de Admin ORO

```sql
SELECT
  a.nombre as admin,
  a.areas_asignadas,
  array_agg(ar.name) as nombres_areas
FROM administradores a
LEFT JOIN areas ar ON ar.id = ANY(a.areas_asignadas)
WHERE a.nombre = 'Oro'
GROUP BY a.id, a.nombre, a.areas_asignadas;
```

### Marcar Todos los Reportes Viejos como Revisados

```sql
-- Solo si quieres empezar con reportes viejos marcados como revisados
UPDATE area_submissions
SET
  reviewed = TRUE,
  reviewed_at = NOW(),
  reviewed_by = 'system@upeu.edu.pe'
WHERE created_at < NOW() - INTERVAL '30 days'
  AND reviewed = FALSE;
```

---

## 🐛 Solución de Problemas

### Problema 1: No llegan notificaciones

**Verificar:**
1. ¿Se ejecutaron ambos scripts SQL?
2. ¿El trigger está activo?
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_report_notifications';
   ```
3. ¿El email del admin está correcto?
   ```sql
   SELECT * FROM administradores;
   ```

### Problema 2: Admin ORO recibe notificaciones de todas las áreas

**Verificar:**
1. ¿El campo `areas_asignadas` está configurado?
   ```sql
   SELECT nombre, areas_asignadas FROM administradores WHERE nombre = 'Oro';
   ```
2. ¿El rol es 'admin' y no 'super_admin'?
   ```sql
   SELECT nombre, rol FROM administradores WHERE nombre = 'Oro';
   ```

### Problema 3: NotificationBell no muestra notificaciones

**Verificar:**
1. ¿El componente tiene el email correcto?
2. ¿Hay notificaciones en la base de datos?
   ```sql
   SELECT * FROM notifications WHERE user_email = 'tu-email@upeu.edu.pe';
   ```
3. ¿El hook se está conectando a Realtime? (Ver consola del navegador)

### Problema 4: Notificaciones del navegador no aparecen

**Verificar:**
1. ¿Se otorgaron los permisos? (En configuración del navegador)
2. ¿El navegador soporta notificaciones? (Chrome, Firefox, Edge sí; Safari depende de la versión)
3. Ver consola del navegador para errores

### Problema 5: ReviewIndicator no cambia de color

**Verificar:**
1. ¿La query incluye los campos `reviewed`, `reviewed_at`, `reviewed_by`?
2. ¿La función `markAsReviewed` se está llamando correctamente?
3. ¿Se recarga la lista después de marcar como revisado?

---

## 📚 Documentación Adicional

- **Sistema completo:** `SISTEMA_NOTIFICACIONES.md`
- **Actualización BLACK/ORO:** `SISTEMA_NOTIFICACIONES_ACTUALIZADO.md`
- **Guía de campanita:** `EJEMPLO_USO_CAMPANITA.md`

---

## 🎯 Resumen de Funcionalidades

### ✅ Notificaciones In-App
- Campana con contador en tiempo real
- Lista desplegable de notificaciones
- Marcar como leídas
- Eliminar notificaciones

### ✅ Notificaciones Push del Navegador
- Solicitud de permisos con banner
- Notificaciones nativas del SO
- Funciona incluso con navegador en segundo plano

### ✅ Sistema de Administradores
- **Admin BLACK**: Acceso total, ve TODAS las áreas
- **Admin ORO**: Acceso limitado, solo áreas asignadas
- Fácil asignación de áreas por SQL

### ✅ Indicador de Revisión
- Campanita roja parpadeante: No revisado
- Campanita verde con check: Revisado
- Tooltip con detalles de revisión
- Click para marcar como revisado

---

## ✅ Checklist Final

**Base de Datos:**
- [ ] Ejecutado `create_notifications_system.sql`
- [ ] Ejecutado `update_notifications_system_admins.sql`
- [ ] Configurados emails de BLACK y ORO
- [ ] Asignadas áreas a Admin ORO
- [ ] Configurados encargados de áreas

**Frontend:**
- [ ] Agregado `NotificationBell` al layout
- [ ] Agregado `NotificationPermissionBanner`
- [ ] Agregado `ReviewIndicator` a lista de reportes
- [ ] Actualizada query para incluir campos de revisión

**Pruebas:**
- [ ] Notificaciones in-app funcionan
- [ ] Notificaciones push del navegador funcionan
- [ ] Admin BLACK recibe todas las notificaciones
- [ ] Admin ORO solo recibe de sus áreas asignadas
- [ ] Campanitas cambian de rojo a verde al hacer click

---

**¡Sistema listo para usar!** 🚀

Si encuentras algún problema, consulta la sección de **Solución de Problemas** o revisa los archivos de documentación.
