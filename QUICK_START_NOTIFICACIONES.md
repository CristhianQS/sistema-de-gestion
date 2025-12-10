# ⚡ Quick Start - Sistema de Notificaciones

## 🎯 Implementación en 5 Minutos

### 1️⃣ Ejecutar SQL en Supabase (2 scripts)

```sql
-- Script 1: sql/create_notifications_system.sql
-- Script 2: sql/update_notifications_system_admins.sql
```

### 2️⃣ Configurar Emails

```sql
UPDATE administradores SET email = 'black@upeu.edu.pe' WHERE nombre = 'Black';
UPDATE administradores SET email = 'oro@upeu.edu.pe' WHERE nombre = 'Oro';
```

### 3️⃣ Asignar Áreas a Admin ORO

```sql
-- Ver áreas disponibles
SELECT id, name FROM areas;

-- Asignar áreas (ejemplo: 2, 7, 8)
UPDATE administradores SET areas_asignadas = ARRAY[2, 7, 8] WHERE nombre = 'Oro';
```

### 4️⃣ Agregar Campana al Layout

```tsx
import NotificationBell from './components/notifications/NotificationBell';
import NotificationPermissionBanner from './components/notifications/NotificationPermissionBanner';

function App() {
  const userEmail = 'admin@upeu.edu.pe'; // Email del usuario logueado

  return (
    <>
      <NotificationPermissionBanner />
      <header>
        <h1>Mi App</h1>
        <NotificationBell userEmail={userEmail} />
      </header>
      {/* Resto de la app */}
    </>
  );
}
```

### 5️⃣ Agregar Campanita de Revisión a Reportes

```tsx
import ReviewIndicator from './components/ReviewIndicator';
import { markAsReviewed } from './services/database/submissions.service';

function ReportList() {
  const userEmail = 'admin@upeu.edu.pe';

  const handleMark = async (id: number) => {
    await markAsReviewed(id, userEmail);
    loadReportes(); // Recargar
  };

  return (
    <div>
      {reportes.map(r => (
        <div key={r.id}>
          <button onClick={() => handleMark(r.id)}>
            <ReviewIndicator
              reviewed={r.reviewed || false}
              reviewedAt={r.reviewed_at}
              reviewedBy={r.reviewed_by}
            />
          </button>
          <span>{r.alumno_nombre}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 Verificación Rápida

### ¿Funcionó el SQL?

```sql
-- Ver administradores
SELECT nombre, email, rol, areas_asignadas FROM administradores;

-- Ver si hay notificaciones
SELECT COUNT(*) FROM notifications;

-- Ver campos de revisión
SELECT reviewed, reviewed_at, reviewed_by FROM area_submissions LIMIT 1;
```

### ¿Funciona el Frontend?

1. Abrir app → ¿Aparece banner de permisos? ✅
2. Crear reporte → ¿Aumenta contador en campana? ✅
3. Click en campana → ¿Se muestra notificación? ✅
4. Reportes → ¿Aparece campanita roja? ✅
5. Click en campanita roja → ¿Cambia a verde? ✅

---

## 📋 Checklist Mínimo

- [ ] Ejecutar 2 scripts SQL en Supabase
- [ ] Configurar emails de BLACK y ORO
- [ ] Asignar áreas a Admin ORO
- [ ] Agregar `<NotificationBell>` al header
- [ ] Agregar `<ReviewIndicator>` a lista de reportes
- [ ] Incluir campos `reviewed`, `reviewed_at`, `reviewed_by` en query de reportes

---

## 🚨 Problemas Comunes

### No llegan notificaciones
→ Verificar que emails en `administradores` sean correctos

### Admin ORO ve todas las áreas
→ Verificar que `areas_asignadas` esté configurado y que `rol = 'admin'`

### Campanita no cambia de color
→ Verificar que query incluya `reviewed, reviewed_at, reviewed_by`

---

## 📚 Documentación Completa

- **Guía paso a paso:** `GUIA_IMPLEMENTACION_NOTIFICACIONES.md`
- **Sistema completo:** `SISTEMA_NOTIFICACIONES_ACTUALIZADO.md`
- **Ejemplos de campanita:** `EJEMPLO_USO_CAMPANITA.md`

---

**¡Listo!** 🎉
