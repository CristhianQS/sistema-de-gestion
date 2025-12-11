# Configuración de Prompts del Chatbot

## ✅ Sistema de Configuración Implementado

El chatbot ahora tiene un **sistema completo de prompts configurables** que te permite personalizar todos los mensajes sin tocar el código del componente.

---

## 📁 Archivos Creados

### 1. **Archivo de Configuración**
```
src/config/chatbotPrompts.ts
```
Contiene todos los prompts y mensajes del chatbot organizados por categorías.

### 2. **Componente de Administración**
```
src/components/ConfiguracionChatbot.tsx
```
Interfaz visual para editar los prompts desde el navegador.

### 3. **Componente Modificado**
```
src/components/ChatbotAsistente.tsx
```
Ahora usa los prompts del archivo de configuración en lugar de texto hardcodeado.

---

## 🎯 Cómo Funciona

### Opción 1: Editar Archivo Directamente (Recomendado)

Edita el archivo `src/config/chatbotPrompts.ts`:

```typescript
export const chatbotConfig: ChatbotConfig = {
  mensajes: {
    bienvenida: `¡Hola! Soy tu asistente virtual UPEU 👋

¿En qué puedo ayudarte hoy?`,

    codigoInvalido: '❌ Código inválido. Solo números por favor.',

    // ... más mensajes
  },

  validacion: {
    longitudMinimaDescripcion: 15, // Cambiar de 10 a 15
    longitudMinimaUbicacion: 5,    // Cambiar de 3 a 5
  }
}
```

**Ventajas:**
- ✅ Cambios permanentes
- ✅ Control total
- ✅ Fácil de versionar con Git

---

### Opción 2: Usar Interfaz de Administración

#### A. Agregar Ruta de Configuración

Agrega el componente a las rutas de admin en `src/routes/AppRoutes.tsx`:

```typescript
import ConfiguracionChatbot from '../components/ConfiguracionChatbot';

// En las rutas protegidas:
<Route
  path="/admin/black/chatbot-config"
  element={
    <ProtectedRoute allowedRoles={['admin_black']}>
      <div className="min-h-screen bg-gray-100 p-6">
        <ConfiguracionChatbot />
      </div>
    </ProtectedRoute>
  }
/>
```

#### B. Acceder desde el Panel de Admin

1. Login como admin_black
2. Ve a: `/admin/black/chatbot-config`
3. Edita los mensajes desde la interfaz
4. Click en "Guardar Cambios"

**Nota:** Los cambios desde la interfaz son **temporales** (solo duran durante la sesión).

---

## 📝 Categorías de Prompts Disponibles

### 1. **Mensajes de Bienvenida**
```typescript
mensajes: {
  bienvenida: string,              // Primer mensaje al abrir chat
  esperandoCodigo: string,         // Solicitar código nuevamente
  codigoInvalido: string,          // Código con formato incorrecto
  codigoNoEncontrado: string,      // Código no existe en BD
  saludoAlumno: (nombre) => string, // Saludo personalizado
  listaAreas: (areas) => string    // Mostrar áreas disponibles
}
```

### 2. **Solicitudes de Información**
```typescript
solicitudes: {
  seleccionArea: string,
  areaInvalida: (max) => string,
  descripcionProblema: (areaNombre) => string,
  descripcionMuyCorta: string,
  ubicacion: string,
  ubicacionInvalida: string
}
```

### 3. **Confirmaciones**
```typescript
confirmaciones: {
  creandoReporte: string,
  reporteCreado: (ticketId, areaNombre) => string,
  errorCrearReporte: (error) => string
}
```

### 4. **Validaciones**
```typescript
validacion: {
  longitudMinimaDescripcion: number,    // Ej: 10
  longitudMinimaUbicacion: number,      // Ej: 3
  permitirSoloNumerosCodigo: boolean    // true/false
}
```

### 5. **Prompts del Sistema (Para IA Futura)**
```typescript
sistemPrompts: {
  rol: string,
  objetivo: string,
  tono: string,
  restricciones: string[]
}
```

---

## 🎨 Ejemplos de Personalización

### Ejemplo 1: Cambiar Mensaje de Bienvenida

**Antes:**
```
¡Bienvenido al chatbot de asuntos académicos! 👋

Por favor, ingresa tu código de estudiante para comenzar.
```

**Después:**
```typescript
bienvenida: `Hola, soy tu asistente virtual de la UPEU 🎓

Para empezar, escribe tu código de estudiante.

Estoy aquí para ayudarte 24/7 🕐`
```

---

### Ejemplo 2: Hacer Validación Más Estricta

```typescript
validacion: {
  longitudMinimaDescripcion: 20,  // Antes: 10
  longitudMinimaUbicacion: 5,     // Antes: 3
  permitirSoloNumerosCodigo: true
}
```

---

### Ejemplo 3: Personalizar Mensaje de Éxito

```typescript
reporteCreado: (ticketId, areaNombre) => `
🎉 ¡Excelente! Tu reporte ha sido creado.

📋 DETALLES:
━━━━━━━━━━━━━━━━━━━━━
• Ticket: #${ticketId}
• Área: ${areaNombre}
• Estado: ⏳ En revisión

📧 Te notificaremos por correo cuando sea atendido.

¿Necesitas reportar algo más?
Escribe tu código de nuevo para comenzar.
`
```

---

### Ejemplo 4: Configurar Prompts para OpenAI (Futuro)

```typescript
sistemPrompts: {
  rol: `Eres "AsistenteUPEU", un chatbot universitario amigable y profesional de la Universidad Peruana Unión.`,

  objetivo: `Ayudar a los estudiantes a:
1. Reportar problemas de infraestructura
2. Solicitar servicios académicos
3. Obtener información general del campus
4. Derivar casos complejos a personal humano`,

  tono: `Mantén un tono:
• Cercano pero respetuoso (tutear está bien)
• Empático con las preocupaciones estudiantiles
• Positivo y orientado a soluciones
• Claro y directo (evita tecnicismos)`,

  restricciones: [
    'No dar información personal de otros estudiantes',
    'No prometer fechas exactas de resolución',
    'Derivar temas de notas/matrículas a secretaría',
    'No tomar decisiones administrativas',
    'Validar siempre la identidad del estudiante'
  ]
}
```

---

## 🔧 Uso Avanzado

### Función Helper: `getMensaje()`

Puedes usar la función helper para obtener mensajes dinámicamente:

```typescript
import { getMensaje } from '../config/chatbotPrompts';

// Obtener mensaje simple
const bienvenida = getMensaje('mensajes.bienvenida');

// Obtener mensaje con parámetros
const saludo = getMensaje('mensajes.saludoAlumno', 'Juan Pérez');
```

### Actualizar Configuración en Runtime

```typescript
import { actualizarConfig } from '../config/chatbotPrompts';

// Actualizar configuración temporalmente
actualizarConfig({
  mensajes: {
    bienvenida: 'Nuevo mensaje de bienvenida'
  }
});
```

---

## 📊 Estructura del Archivo de Configuración

```
chatbotPrompts.ts
├── ChatbotConfig (interface)
│   ├── mensajes
│   ├── solicitudes
│   ├── confirmaciones
│   ├── validacion
│   └── sistemPrompts
│
├── chatbotConfig (objeto de configuración)
├── getMensaje() (helper)
└── actualizarConfig() (helper)
```

---

## 🎯 Casos de Uso

### 1. Cambiar Idioma del Chatbot

Edita todos los mensajes en `chatbotConfig` y tradúcelos:

```typescript
mensajes: {
  bienvenida: `Welcome to the academic chatbot! 👋

Please enter your student code to begin.`
}
```

### 2. Personalizar por Campus

Crea múltiples configuraciones para diferentes campus:

```typescript
// config/chatbotPrompts-lima.ts
export const chatbotConfigLima = { ... };

// config/chatbotPrompts-juliaca.ts
export const chatbotConfigJuliaca = { ... };

// Luego importa según el campus
import { chatbotConfigLima as chatbotConfig } from './chatbotPrompts-lima';
```

### 3. Agregar Emojis y Formato

```typescript
bienvenida: `
╔══════════════════════════════╗
║   🎓 ASISTENTE VIRTUAL UPEU  ║
╚══════════════════════════════╝

¡Hola! 👋 Estoy aquí para ayudarte.

Por favor, ingresa tu código:
┗━━► 📝 ____________
`
```

---

## ⚠️ Advertencias Importantes

### 1. Cambios Temporales vs Permanentes

| Método | Duración | Uso |
|--------|----------|-----|
| Editar `chatbotPrompts.ts` | ✅ Permanente | Producción |
| Usar `ConfiguracionChatbot` | ⚠️ Temporal (sesión) | Pruebas |
| Usar `actualizarConfig()` | ⚠️ Temporal (sesión) | Desarrollo |

### 2. Funciones Dinámicas

Los mensajes que aceptan parámetros son **funciones**:

```typescript
// ✅ CORRECTO
saludoAlumno: (nombre: string) => `¡Hola ${nombre}!`

// ❌ INCORRECTO
saludoAlumno: '¡Hola Juan!' // No es dinámico
```

### 3. Preservar Formato

Algunos mensajes usan saltos de línea y formato especial:

```typescript
// Preserva \n\n para saltos de línea
bienvenida: `Primera línea\n\nSegunda línea`

// Preserva formato de lista
listaAreas: (areas) => `Áreas:\n\n${areas}\n\nSelecciona:`
```

---

## 🚀 Próximos Pasos

### 1. Persistencia de Configuración (Opcional)

Para hacer permanentes los cambios desde la interfaz, guárdalos en Supabase:

```sql
CREATE TABLE chatbot_config (
  id SERIAL PRIMARY KEY,
  config_data JSONB NOT NULL,
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

```typescript
// Guardar en BD
const guardarEnBD = async (config) => {
  await supabase
    .from('chatbot_config')
    .upsert({ id: 1, config_data: config });
};

// Cargar al inicio
useEffect(() => {
  const { data } = await supabase
    .from('chatbot_config')
    .select('config_data')
    .single();

  if (data) actualizarConfig(data.config_data);
}, []);
```

### 2. Integración con OpenAI

Usa los `sistemPrompts` cuando integres OpenAI:

```typescript
import { chatbotConfig } from './config/chatbotPrompts';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: '...' });

const response = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'system',
      content: chatbotConfig.sistemPrompts.rol + '\n' +
               chatbotConfig.sistemPrompts.objetivo
    },
    { role: 'user', content: mensajeUsuario }
  ]
});
```

### 3. A/B Testing de Mensajes

Prueba diferentes versiones de mensajes:

```typescript
const mensajesTest = {
  version_a: 'Bienvenida versión A',
  version_b: 'Bienvenida versión B'
};

// Asignar aleatoriamente
const versionAsignada = Math.random() > 0.5 ? 'version_a' : 'version_b';
```

---

## 📖 Documentación de Referencia

- **Archivo principal:** `src/config/chatbotPrompts.ts`
- **Componente chat:** `src/components/ChatbotAsistente.tsx`
- **Interfaz admin:** `src/components/ConfiguracionChatbot.tsx`

---

## ✨ Resumen

✅ **Todos los mensajes son configurables**
✅ **Puedes editarlos desde un archivo TypeScript**
✅ **Interfaz visual disponible para pruebas**
✅ **Validaciones parametrizables**
✅ **Listo para integración con OpenAI**

---

**¿Necesitas ayuda?**
- Revisa el archivo `chatbotPrompts.ts` para ver todos los mensajes disponibles
- Usa la interfaz `ConfiguracionChatbot` para probar cambios rápidamente
- Para cambios permanentes, edita el archivo directamente

---

**Documento creado:** 2025-12-02
**Versión:** 1.0
