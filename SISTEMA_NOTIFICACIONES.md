# 🔔 Sistema Completo de Notificaciones

## ✅ Sistema Implementado

Sistema de notificaciones **in-app** + **push del navegador** para notificar cuando un alumno crea un reporte.

---

## 🎯 Funcionalidad

Cuando un alumno crea un reporte:
1. ✅ **Encargado del área** recibe notificación
2. ✅ **Administrador BLACK** recibe notificación
3. ✅ Notificación aparece en la app (campana 🔔)
4. ✅ Notificación push del navegador

---

## 📋 Componentes Creados

### 1. **Base de Datos** (SQL)
**Archivo:** `sql/create_notifications_system.sql`

```sql
✅ Tabla: administradores
   - Almacena admins (BLACK incluido)

✅ Tabla: notifications
   - Almacena notificaciones de usuarios

✅ Campo agregado a areas:
   - encargado_email
   - encargado_nombre

✅ Trigger: trigger_create_report_notifications
   - Se activa al crear reporte
   - Crea notificaciones automáticamente

✅ Funciones:
   - create_report_notifications()
   - mark_notification_as_read()
   - mark_all_notifications_as_read()

✅ Vista: notifications_with_details
   - Muestra notificaciones con info completa
```

### 2. **Backend Services**
**Archivo:** `src/services/database/notifications.service.ts`

```typescript
✅ getNotifications(userEmail)
✅ getUnreadNotifications(userEmail)
✅ getUnreadCount(userEmail)
✅ markAsRead(notificationId)
✅ markAllAsRead(userEmail)
✅ deleteNotification(notificationId)
✅ subscribeToNotifications(userEmail, callback)
✅ createNotification(notification)
```

### 3. **Frontend Components**

#### **Hook personalizado**
**Archivo:** `src/hooks/useNotifications.ts`

```typescript
const {
  notifications,        // Array de notificaciones
  unreadCount,          // Contador de no leídas
  loading,              // Estado de carga
  error,                // Errores
  markAsRead,           // Marcar como leída
  markAllAsRead,        // Marcar todas
  deleteNotification,   // Eliminar
  refresh               // Recargar
} = useNotifications(userEmail);
```

#### **Componente de campana**
**Archivo:** `src/components/notifications/NotificationBell.tsx`

```tsx
<NotificationBell userEmail="usuario@upeu.edu.pe" />
```

Features:
- 🔔 Icono de campana
- 🔴 Badge con contador (ej: "5" nuevas)
- 📋 Dropdown con lista de notificaciones
- ✅ Botón "Marcar todas como leídas"

#### **Lista de notificaciones**
**Archivo:** `src/components/notifications/NotificationsList.tsx`

Features:
- 📜 Lista scrolleable de notificaciones
- ✅ Botón para marcar individual como leída
- 🗑️ Botón para eliminar
- ⏰ Timestamp relativo ("hace 5 minutos")
- 📌 Indicador visual de "no leída"

#### **Banner de permisos**
**Archivo:** `src/components/notifications/NotificationPermissionBanner.tsx`

Features:
- 💬 Solicita permisos de notificaciones push
- 🎨 Diseño no invasivo (aparece después de 2 seg)
- ✅ Botón "Activar" / "Ahora no"
- 🔔 Notificación de prueba al activar

### 4. **Utilidades**
**Archivo:** `src/utils/browserNotifications.ts`

```typescript
✅ isSupported()            - Verificar soporte
✅ getPermissionStatus()    - Estado actual
✅ requestPermission()      - Solicitar permisos
✅ showNotification()       - Mostrar notif push
✅ playNotificationSound()  - Reproducir sonido
✅ initializeBrowserNotifications() - Inicializar
```

---

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar Script SQL en Supabase

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abrir SQL Editor:**
   - Click en "SQL Editor" (menú lateral)
   - Click en "New Query"

3. **Copiar y Ejecutar:**
   - Copia todo el contenido de: `sql/create_notifications_system.sql`
   - Pega en el editor
   - Click en "Run" (▶️)

4. **Verificar que se creó:**
   ```sql
   ✅ Tabla "administradores" creada
   ✅ Tabla "notifications" creada
   ✅ Campo "encargado_email" agregado a "areas"
   ✅ Trigger creado
   ✅ Admin BLACK registrado (black@upeu.edu.pe)
   ```

### Paso 2: Configurar Encargados de Área

Actualiza cada área con su encargado:

```sql
UPDATE areas
SET encargado_email = 'encargado.dti@upeu.edu.pe',
    encargado_nombre = 'Juan Pérez'
WHERE id = 7; -- DTI

UPDATE areas
SET encargado_email = 'encargado.infra@upeu.edu.pe',
    encargado_nombre = 'María García'
WHERE id = 2; -- Infraestructura

-- Repetir para cada área...
```

### Paso 3: Actualizar Email del Admin BLACK (si es necesario)

```sql
UPDATE administradores
SET email = 'email_real_de_black@upeu.edu.pe'
WHERE nombre = 'Black';
```

### Paso 4: Agregar Componente a tu Layout

En tu layout principal (ej: `App.tsx` o `Layout.tsx`):

```tsx
import NotificationBell from './components/notifications/NotificationBell';
import NotificationPermissionBanner from './components/notifications/NotificationPermissionBanner';

function App() {
  const userEmail = 'usuario@upeu.edu.pe'; // Email del usuario logueado

  return (
    <div>
      {/* Header con campana de notificaciones */}
      <header>
        <nav>
          {/* ... otros elementos del nav ... */}
          <NotificationBell userEmail={userEmail} />
        </nav>
      </header>

      {/* Banner para solicitar permisos */}
      <NotificationPermissionBanner />

      {/* Resto de tu app */}
      <main>...</main>
    </div>
  );
}
```

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Alumno crea reporte                                     │
│     - Desde chatbot o formulario                            │
│     - Se inserta en "area_submissions"                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Trigger automático se activa                            │
│     - trigger_create_report_notifications                   │
│     - Ejecuta función: create_report_notifications()        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Se crean 2 notificaciones                              │
│                                                             │
│  Notificación 1:                                           │
│    user_email: encargado_email del área                    │
│    title: "🔔 Nuevo Reporte en DTI"                        │
│    message: "El estudiante Juan ha reportado..."           │
│                                                             │
│  Notificación 2:                                           │
│    user_email: email del admin BLACK                       │
│    title: "🔔 Nuevo Reporte en DTI"                        │
│    message: "El estudiante Juan ha reportado..."           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Hook useNotifications detecta cambio                   │
│     - Suscripción en tiempo real activa                    │
│     - Recibe nueva notificación vía Supabase Realtime      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Actualización automática de UI                         │
│     a) Badge de campana: "1" → "2" (contador actualizado)  │
│     b) Nueva notif aparece en lista                        │
│     c) Notificación push del navegador                     │
│     d) Sonido de notificación (opcional)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Usuario hace clic en notificación                      │
│     - Se marca como leída                                  │
│     - Badge se actualiza: "2" → "1"                        │
│     - Color de fondo cambia (blue-50 → white)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Pruebas

### Prueba 1: Crear Reporte y Verificar Notificaciones

1. **Crear un reporte:**
   ```typescript
   // Desde chatbot o formulario
   await createSubmission({
     area_id: 7, // DTI
     alumno_id: 1,
     alumno_nombre: "Juan Pérez",
     form_data: { ... }
   });
   ```

2. **Verificar en la base de datos:**
   ```sql
   SELECT * FROM notifications
   WHERE related_submission_id = [ID_DEL_REPORTE];

   -- Debe mostrar 2 notificaciones:
   -- 1 para el encargado
   -- 1 para BLACK
   ```

3. **Verificar en la UI:**
   - ✅ Badge de campana muestra "2"
   - ✅ Lista muestra 2 notificaciones
   - ✅ Notificaciones marcadas como "no leídas"

### Prueba 2: Notificaciones en Tiempo Real

1. **Abrir 2 navegadores:**
   - Navegador A: Admin BLACK logueado
   - Navegador B: Crear reporte

2. **Crear reporte en Navegador B**

3. **Verificar en Navegador A:**
   - ✅ Badge se actualiza automáticamente (sin recargar)
   - ✅ Notificación aparece en la lista
   - ✅ Notificación push del navegador aparece
   - ✅ Sonido se reproduce (si está configurado)

### Prueba 3: Marcar como Leída

1. **Click en una notificación no leída**
2. **Click en botón ✓ (checkmark)**
3. **Verificar:**
   - ✅ Color de fondo cambia (blue-50 → white)
   - ✅ Badge disminuye en 1
   - ✅ Indicador "Nueva" desaparece

### Prueba 4: Notificación Push del Navegador

1. **Activar permisos:**
   - Click en banner "Activar Notificaciones"
   - Permitir en el navegador

2. **Crear un reporte**

3. **Verificar:**
   - ✅ Aparece notificación push del navegador
   - ✅ Tiene título correcto
   - ✅ Tiene mensaje correcto
   - ✅ Se cierra automáticamente después de 5 seg

---

## 📱 Notificaciones Push del Navegador

### Características:
- ✅ Aparecen incluso si la pestaña no está activa
- ✅ Aparecen en todas las pestañas abiertas
- ✅ Se cierran automáticamente después de 5 segundos
- ✅ Incluyen título, mensaje e icono
- ✅ Sonido opcional

### Permisos:
```typescript
// Solicitar permisos
await requestPermission(); // Retorna true/false

// Verificar estado
const status = getPermissionStatus();
// "granted", "denied", o "default"
```

### Mostrar notificación manual:
```typescript
showNotification('Título', {
  body: 'Mensaje de la notificación',
  icon: '/logo.png',
  tag: 'notification-1'
});
```

---

## 🎨 Personalización

### Cambiar Sonido de Notificación:
```typescript
// En browserNotifications.ts
const audio = new Audio('/mi-sonido-custom.mp3');
```

### Cambiar Duración de Notificación Push:
```typescript
// En browserNotifications.ts, línea ~80
setTimeout(() => {
  notification.close();
}, 10000); // 10 segundos en lugar de 5
```

### Cambiar Colores del Badge:
```tsx
// En NotificationBell.tsx
<span className="... bg-red-600"> // Cambiar color aquí
```

---

## 🔧 Troubleshooting

### Problema: No aparecen notificaciones

**Solución 1: Verificar trigger**
```sql
SELECT * FROM pg_trigger
WHERE tgname = 'trigger_create_report_notifications';
```

**Solución 2: Verificar que hay encargado**
```sql
SELECT id, name, encargado_email
FROM areas
WHERE encargado_email IS NOT NULL;
```

**Solución 3: Verificar admin BLACK**
```sql
SELECT * FROM administradores
WHERE nombre ILIKE '%black%';
```

### Problema: Notificaciones push no aparecen

**Solución 1: Verificar permisos**
```javascript
console.log(Notification.permission);
// Debe ser "granted"
```

**Solución 2: Verificar HTTPS**
- Las notificaciones push solo funcionan en HTTPS
- En desarrollo: `localhost` está permitido

### Problema: No hay tiempo real

**Solución: Verificar suscripción**
```typescript
// En consola del navegador
console.log('Realtime conectado');
// Debe mostrar conexión activa
```

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `sql/create_notifications_system.sql` en Supabase
- [ ] Configurar email del admin BLACK
- [ ] Configurar encargados de cada área
- [ ] Agregar `<NotificationBell />` al layout
- [ ] Agregar `<NotificationPermissionBanner />` al layout
- [ ] Probar creando un reporte
- [ ] Verificar que aparecen 2 notificaciones
- [ ] Verificar notificación push del navegador
- [ ] Verificar tiempo real (abrir 2 pestañas)
- [ ] Probar marcar como leída
- [ ] Probar eliminar notificación

---

## 📁 Archivos del Sistema

```
sql/
  └─ create_notifications_system.sql

src/
  ├─ services/database/
  │   └─ notifications.service.ts
  │
  ├─ hooks/
  │   └─ useNotifications.ts
  │
  ├─ components/notifications/
  │   ├─ NotificationBell.tsx
  │   ├─ NotificationsList.tsx
  │   └─ NotificationPermissionBanner.tsx
  │
  └─ utils/
      └─ browserNotifications.ts
```

---

**¡Sistema completo de notificaciones implementado!** 🔔✅

**Versión:** 1.0
**Fecha:** 2025-12-10
**Estado:** ✅ LISTO PARA USAR
