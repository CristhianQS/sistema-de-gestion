# 🔔 Sistema de Notificaciones Actualizado

## ✅ Nuevas Funcionalidades

### 1. **Administradores BLACK y ORO**
- ✅ **Admin BLACK**: Recibe notificaciones de TODAS las áreas (super_admin)
- ✅ **Admin ORO**: Recibe notificaciones solo de sus áreas asignadas

### 2. **Indicador de Revisión (Campanita)**
- 🔴 **Campanita roja parpadeante**: Reporte NO revisado
- ✅ **Campanita verde con check**: Reporte revisado
- 📅 **Tooltip**: Muestra cuándo y quién lo revisó

---

## 📋 Configuración en Supabase

### Paso 1: Ejecutar Script SQL

**Archivo:** `sql/update_notifications_system_admins.sql`

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido del archivo
3. Click **Run** ▶️

Esto creará:
```sql
✅ Campo "reviewed" en area_submissions
✅ Campo "areas_asignadas" en administradores
✅ Admin BLACK (super_admin)
✅ Admin ORO (admin)
✅ Funciones para marcar como revisado
✅ Trigger mejorado para notificaciones
```

### Paso 2: Asignar Áreas a Admin ORO

```sql
-- Asignar áreas 2, 7, 8 a Admin ORO
UPDATE administradores
SET areas_asignadas = ARRAY[2, 7, 8]
WHERE nombre = 'Oro';
```

**Ejemplo:**
- Área 2: Infraestructura
- Área 7: DTI
- Área 8: Biblioteca

Admin ORO solo verá reportes de estas áreas.

### Paso 3: Actualizar Emails

```sql
-- Actualizar email de BLACK
UPDATE administradores
SET email = 'black@upeu.edu.pe'
WHERE nombre = 'Black';

-- Actualizar email de ORO
UPDATE administradores
SET email = 'oro@upeu.edu.pe'
WHERE nombre = 'Oro';
```

---

## 🎯 Cómo Funciona

### Flujo de Notificaciones

```
┌─────────────────────────────────────────────────────────────┐
│  1. Alumno crea reporte en Área 7 (DTI)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Trigger detecta nuevo reporte                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Se crean notificaciones para:                          │
│                                                             │
│  ✅ Encargado del área DTI                                 │
│  ✅ Admin BLACK (tiene acceso a todas las áreas)           │
│  ✅ Admin ORO (si DTI está en sus áreas asignadas)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Notificaciones aparecen en tiempo real                 │
│     - Campana en la app                                    │
│     - Notificación push del navegador                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 Indicador de Revisión (Campanita)

### **Uso del Componente**

```tsx
import ReviewIndicator from './components/ReviewIndicator';

<ReviewIndicator
  reviewed={submission.reviewed || false}
  reviewedAt={submission.reviewed_at}
  reviewedBy={submission.reviewed_by}
  size="md"
  showTooltip={true}
/>
```

### **Estados Visuales**

#### **No Revisado (Pendiente)**
```
🔔 ← Campanita roja parpadeante
     Tooltip: "🔔 Pendiente de revisar"
```

#### **Revisado**
```
🔔✓ ← Campanita verde con checkmark
      Tooltip: "✅ Revisado el 10/12/2025 14:30 por admin@upeu.edu.pe"
```

---

## 💻 Funciones del Servicio

### **1. Marcar como Revisado**

```typescript
import { markAsReviewed } from './services/database/submissions.service';

// Marcar reporte como revisado
await markAsReviewed(123, 'admin@upeu.edu.pe');
```

### **2. Obtener Reportes No Revisados**

```typescript
import { getUnreviewedSubmissions } from './services/database/submissions.service';

const unreviewedReports = await getUnreviewedSubmissions();
console.log(`${unreviewedReports.length} reportes pendientes`);
```

### **3. Contar No Revisados por Área**

```typescript
import { getUnreviewedCountByArea } from './services/database/submissions.service';

const count = await getUnreviewedCountByArea(7); // DTI
console.log(`${count} reportes pendientes en DTI`);
```

---

## 🎨 Integración en la UI

### **Ejemplo: Lista de Reportes**

```tsx
import ReviewIndicator from './components/ReviewIndicator';
import { markAsReviewed } from './services/database/submissions.service';

function ReportList({ reports }) {
  const handleMarkReviewed = async (id) => {
    await markAsReviewed(id, userEmail);
    // Actualizar lista
  };

  return (
    <div>
      {reports.map(report => (
        <div key={report.id} className="flex items-center space-x-3">
          {/* Indicador de revisión */}
          <button onClick={() => handleMarkReviewed(report.id)}>
            <ReviewIndicator
              reviewed={report.reviewed || false}
              reviewedAt={report.reviewed_at}
              reviewedBy={report.reviewed_by}
            />
          </button>

          {/* Info del reporte */}
          <div>
            <h3>{report.area?.name}</h3>
            <p>{report.alumno_nombre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Ejemplos de Configuración

### **Escenario 1: Universidad con 2 Admins**

```sql
-- Admin BLACK: Ve TODAS las áreas
UPDATE administradores
SET rol = 'super_admin',
    areas_asignadas = NULL,
    email = 'black@upeu.edu.pe'
WHERE nombre = 'Black';

-- Admin ORO: Solo ve Infraestructura (2) y DTI (7)
UPDATE administradores
SET rol = 'admin',
    areas_asignadas = ARRAY[2, 7],
    email = 'oro@upeu.edu.pe'
WHERE nombre = 'Oro';
```

**Resultado:**
- Reporte en DTI (7) → BLACK ✅ y ORO ✅ reciben notificación
- Reporte en Biblioteca (8) → Solo BLACK ✅ recibe notificación

### **Escenario 2: Agregar Más Áreas a ORO**

```sql
-- ORO ahora ve áreas 2, 7, 8, 9
UPDATE administradores
SET areas_asignadas = ARRAY[2, 7, 8, 9]
WHERE nombre = 'Oro';
```

---

## 🧪 Pruebas

### **Prueba 1: Notificaciones por Rol**

1. **Crear reporte en DTI (área 7)**
2. **Verificar notificaciones:**
   ```sql
   SELECT user_email, title
   FROM notifications
   WHERE related_area_id = 7
   ORDER BY created_at DESC
   LIMIT 10;
   ```
3. **Resultado esperado:**
   - Encargado de DTI
   - Admin BLACK
   - Admin ORO (si DTI está en sus áreas)

### **Prueba 2: Indicador de Revisión**

1. **Ver lista de reportes**
2. **Verificar campanitas:**
   - 🔴 Parpadeante = No revisado
   - ✅ Verde = Revisado
3. **Click en campanita roja**
4. **Verifica que cambia a verde**

### **Prueba 3: Áreas Asignadas**

1. **Configurar ORO con áreas [2, 7]**
2. **Crear reporte en área 8**
3. **Verificar:**
   - BLACK recibe notificación ✅
   - ORO NO recibe notificación ❌

---

## 📁 Archivos del Sistema

```
sql/
  ├─ create_notifications_system.sql (original)
  └─ update_notifications_system_admins.sql (NUEVO)

src/
  ├─ services/database/
  │   ├─ notifications.service.ts
  │   └─ submissions.service.ts (actualizado)
  │
  ├─ components/
  │   ├─ ReviewIndicator.tsx (NUEVO)
  │   └─ notifications/
  │       ├─ NotificationBell.tsx
  │       ├─ NotificationsList.tsx
  │       └─ NotificationPermissionBanner.tsx
  │
  ├─ types/
  │   └─ index.ts (actualizado con campos reviewed)
  │
  └─ hooks/
      └─ useNotifications.ts
```

---

## 🔧 Funciones SQL Disponibles

### **mark_report_as_reviewed()**
```sql
SELECT mark_report_as_reviewed(123, 'admin@upeu.edu.pe');
```

### **get_unreviewed_count_by_area()**
```sql
SELECT get_unreviewed_count_by_area(7); -- DTI
-- Retorna: número de reportes no revisados
```

### **Vista submissions_with_review_status**
```sql
SELECT * FROM submissions_with_review_status
WHERE reviewed = FALSE
ORDER BY created_at DESC;
```

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `sql/update_notifications_system_admins.sql`
- [ ] Configurar emails de BLACK y ORO
- [ ] Asignar áreas a Admin ORO
- [ ] Importar componente `ReviewIndicator`
- [ ] Agregar campanita a lista de reportes
- [ ] Implementar función para marcar como revisado
- [ ] Probar notificaciones para BLACK
- [ ] Probar notificaciones para ORO (solo sus áreas)
- [ ] Probar cambio de estado de campanita

---

## 🎯 Resumen de Cambios

| Característica | Antes | Ahora |
|----------------|-------|-------|
| Administradores | Solo BLACK | BLACK + ORO |
| Áreas de ORO | N/A | Configurable |
| Indicador de revisión | ❌ No existía | ✅ Campanita animada |
| Estado de reporte | Solo status | Status + reviewed |
| Notificaciones | Todas para todos | Según áreas asignadas |

---

**Versión:** 2.0
**Fecha:** 2025-12-10
**Estado:** ✅ LISTO PARA USAR
