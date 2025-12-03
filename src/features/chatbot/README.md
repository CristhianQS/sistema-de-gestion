# 🤖 Chatbot Inteligente - Feature Module

Este módulo contiene toda la funcionalidad del chatbot inteligente con IA.

## 📁 Estructura

```
src/features/chatbot/
├── components/
│   ├── ChatbotAsistente.tsx      # Componente principal del chatbot
│   └── ConfiguracionChatbot.tsx  # Panel de configuración de prompts
├── services/
│   └── openai.service.ts         # Servicio de integración con OpenAI GPT-4o-mini
├── config/
│   └── chatbotPrompts.ts         # Configuración de mensajes y prompts
└── README.md                      # Este archivo
```

## 🎯 Componentes

### ChatbotAsistente.tsx
**Ubicación:** `components/ChatbotAsistente.tsx`

Componente principal del chatbot que maneja:
- Interfaz de chat tipo WhatsApp
- Flujo conversacional completo
- Detección automática de áreas con IA
- Selección de pabellón y salón
- Validación de estudiantes
- Creación de reportes

**Uso:**
```tsx
import ChatbotAsistente from '@/features/chatbot/components/ChatbotAsistente';

<ChatbotAsistente />
```

### ConfiguracionChatbot.tsx
**Ubicación:** `components/ConfiguracionChatbot.tsx`

Panel de administración para configurar:
- Mensajes de bienvenida
- Solicitudes de información
- Parámetros de validación
- Prompts del sistema para IA
- Restricciones del chatbot

**Ruta:** `/admin/chatbot-config` (Solo Admin Black)

## 🤖 Servicios

### openai.service.ts
**Ubicación:** `services/openai.service.ts`

Servicio que maneja todas las interacciones con OpenAI GPT-4o-mini:

**Funciones principales:**
- `isOpenAIEnabled()` - Verifica si OpenAI está configurado
- `responderSaludo(mensaje)` - Responde a saludos naturalmente
- `detectarAreaPorPalabrasClave(problema, areas)` - Detecta área automáticamente
- `extraerInformacionCompleta(problema, area)` - Extrae ubicación, urgencia, etc.
- `mejorarDescripcion(descripcion)` - Mejora ortografía y claridad
- `sugerirUbicacion(mensaje)` - Detecta ubicación en el texto
- `esUrgente(mensaje)` - Determina nivel de urgencia

**Modelo usado:** GPT-4o-mini (económico y rápido)

## ⚙️ Configuración

### chatbotPrompts.ts
**Ubicación:** `config/chatbotPrompts.ts`

Configuración centralizada de todos los mensajes del chatbot:

**Estructura:**
```typescript
export const chatbotConfig = {
  mensajes: {
    bienvenida: "...",
    saludoAlumno: (nombre) => `...`,
    // ...
  },
  solicitudes: {
    descripcionProblema: (area) => `...`,
    // ...
  },
  confirmaciones: {
    reporteCreado: (id, area) => `...`,
    // ...
  },
  validacion: {
    longitudMinimaDescripcion: 10,
    // ...
  },
  sistemPrompts: {
    rol: "...",
    objetivo: "...",
    tono: "...",
    restricciones: [...]
  }
}
```

## 🔄 Flujo de Conversación

1. **Saludo inicial**
   - Usuario saluda o inicia conversación
   - Bot responde y solicita código de estudiante

2. **Validación de estudiante**
   - Usuario ingresa código
   - Bot valida en base de datos
   - Saluda por nombre

3. **Descripción del problema**
   - Usuario describe el problema
   - IA analiza y detecta área automáticamente

4. **Selección de ubicación**
   - Bot muestra lista de pabellones
   - Usuario selecciona pabellón
   - Bot muestra lista de salones
   - Usuario selecciona salón

5. **Confirmación**
   - Bot muestra resumen completo
   - Usuario confirma o cancela

6. **Registro**
   - Bot crea reporte con metadata de IA
   - Asigna badge "🤖 IA" visible para admins

## 📊 Metadata de Reportes

Cada reporte creado incluye:

```json
{
  "form_data": {
    "descripcion": "...",
    "ubicacion": "Pabellón X - Salón Y",
    "pabellon_id": 1,
    "pabellon_nombre": "Pabellón A",
    "salon_id": 10,
    "salon_nombre": "A-101",
    "created_by": "ia_chatbot",
    "ia_metadata": {
      "timestamp": "2025-12-03T...",
      "confidence": 85,
      "model": "gpt-4o-mini",
      "ia_enabled": true,
      "urgencia": "media",
      "deteccion_automatica": true,
      "mensaje_original": "...",
      "detalles_adicionales": {
        "palabrasClave": ["proyector", "hdmi"],
        "tipoProblema": "falla_equipo"
      }
    }
  }
}
```

## 🎨 Estilos

El chatbot usa diseño tipo WhatsApp:
- **Header:** Línea verde delgada
- **Burbujas usuario:** Fondo verde gradiente
- **Burbujas bot:** Fondo blanco con sombra
- **Badge IA:** Gradiente morado-rosa

## 🔧 Dependencias

- `openai` v4.73.0 - Cliente de OpenAI
- `@supabase/supabase-js` - Base de datos
- `react` - Framework UI
- `react-router-dom` - Navegación

## 📝 Variables de Entorno

```env
VITE_OPENAI_API_KEY=sk-...  # Opcional, para funciones de IA
```

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build
```

## 📚 Documentación Adicional

- [Integración ChatGPT](../../../docs/INTEGRACION_CHATGPT.md)
- [Configuración de Prompts](../../../docs/CONFIGURACION_PROMPTS.md)

## 👥 Contribuir

Para modificar el chatbot:
1. Edita los componentes en `components/`
2. Modifica la lógica de IA en `services/openai.service.ts`
3. Actualiza prompts en `config/chatbotPrompts.ts`
4. Documenta cambios en este README

## 📄 Licencia

Parte del Sistema de Gestión UPEU
