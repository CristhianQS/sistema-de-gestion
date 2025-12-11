# Integración de ChatGPT con el Chatbot

## ✅ Implementación Completada

El chatbot ahora puede usar **ChatGPT** para ser mucho más inteligente. La integración es **opcional** - funciona con y sin IA.

---

## 🎯 Cómo Funciona

### Sin OpenAI (Modo Reglas)
- ✅ Flujo conversacional paso a paso
- ✅ Valida código de estudiante
- ✅ Lista áreas disponibles
- ✅ Pide descripción y ubicación
- ✅ Crea reporte

### Con OpenAI (Modo IA) 🤖
- ✅ **Todo lo anterior** +
- ✅ Extrae ubicación automáticamente del mensaje
- ✅ Mejora la descripción del problema
- ✅ Detecta urgencia automáticamente
- ✅ Sugiere el área correcta
- ✅ Conversación más natural

---

## 📦 Archivos Creados/Modificados

### 1. **Servicio de OpenAI**
```
src/services/openai.service.ts
```
Funciones para interactuar con ChatGPT:
- `clasificarArea()` - Detecta a qué área pertenece el problema
- `extraerInformacion()` - Extrae datos estructurados
- `mejorarDescripcion()` - Mejora ortografía y claridad
- `sugerirUbicacion()` - Detecta pabellón/salón en el mensaje
- `esUrgente()` - Determina si es urgente
- `generarResumen()` - Crea resumen corto

### 2. **Chatbot Actualizado**
```
src/components/ChatbotAsistente.tsx
```
- Badge "🤖 IA" cuando OpenAI está activo
- Detección automática de ubicación
- Mejora de descripciones
- Flujo inteligente

### 3. **Variables de Entorno**
```
.env.example
```
Variable agregada: `VITE_OPENAI_API_KEY`

### 4. **Dependencia**
```
package.json
```
Agregado: `openai: ^4.73.0`

---

## 🚀 Cómo Activar ChatGPT

### Paso 1: Instalar Dependencias

```bash
npm install
```

### Paso 2: Obtener API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Crea una cuenta si no tienes
3. Click en "Create new secret key"
4. Copia la key (empieza con `sk-...`)

**Importante:** Guarda la key en un lugar seguro, solo se muestra una vez.

### Paso 3: Configurar Variable de Entorno

Abre tu archivo `.env` y agrega:

```env
VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
```

### Paso 4: Reiniciar el Servidor

```bash
# Ctrl+C para detener
npm run dev
```

### Paso 5: ¡Listo!

Abre el chatbot y verás el badge "🤖 IA" en el header.

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Extracción Automática de Ubicación

**Usuario escribe:**
```
"La puerta del salón B-201 está rota y no cierra bien"
```

**Sin IA:**
- Bot: "¿Cuál es la ubicación?"
- Usuario: "B-201"

**Con IA:**
- Bot detecta automáticamente "Pabellón B - Salón 201"
- Bot: "Ubicación detectada: Pabellón B - Salón 201 ✓"
- Crea el reporte sin preguntar

---

### Ejemplo 2: Mejora de Descripción

**Usuario escribe:**
```
"ahi esta el foco roto del salon"
```

**Sin IA:**
- Guarda exactamente: "ahi esta el foco roto del salon"

**Con IA:**
- Mejora a: "El foco del salón está roto y necesita reemplazo"
- Corrige ortografía automáticamente

---

### Ejemplo 3: Detección de Urgencia

**Usuario escribe:**
```
"HAY UN CABLE SUELTO CON CHISPAS EN EL PABELLÓN A"
```

**Con IA:**
- Detecta urgencia: ALTA
- Marca el reporte como prioritario
- Agrega metadata de urgencia

---

## 📊 Funciones Disponibles

### 1. `clasificarArea()`
Clasifica automáticamente el problema en un área.

```typescript
const areaIndex = await clasificarArea(
  "La computadora del laboratorio no enciende",
  areas
);
// Retorna: índice del área "Tecnología"
```

### 2. `extraerInformacion()`
Extrae datos estructurados del mensaje.

```typescript
const info = await extraerInformacion(
  "La puerta del B-201 está rota, es urgente"
);
// Retorna:
// {
//   descripcion: "La puerta está rota",
//   ubicacion: "Pabellón B - Salón 201",
//   urgencia: "alta",
//   categoria: "infraestructura"
// }
```

### 3. `mejorarDescripcion()`
Mejora ortografía y claridad.

```typescript
const mejorada = await mejorarDescripcion(
  "ahi sta el bano roto"
);
// Retorna: "El baño está roto y requiere reparación"
```

### 4. `sugerirUbicacion()`
Detecta ubicación en el mensaje.

```typescript
const ubicacion = await sugerirUbicacion(
  "El problema está en el pabellón C salón 305"
);
// Retorna: "Pabellón C - Salón 305"
```

### 5. `esUrgente()`
Determina si es urgente.

```typescript
const urgente = await esUrgente(
  "Hay un incendio en el laboratorio"
);
// Retorna: true
```

---

## 💰 Costos de OpenAI

### GPT-3.5-Turbo (Recomendado)
- **Input:** $0.0005 / 1K tokens
- **Output:** $0.0015 / 1K tokens
- **Promedio por conversación:** ~$0.001 USD

### GPT-4-Turbo (Opcional - Más inteligente)
- **Input:** $0.01 / 1K tokens
- **Output:** $0.03 / 1K tokens
- **Promedio por conversación:** ~$0.02 USD

### Estimación Mensual

Con 1,000 estudiantes usando el chatbot:
- GPT-3.5: **~$1 USD/mes**
- GPT-4: **~$20 USD/mes**

**Conclusión:** Es muy económico usar GPT-3.5-Turbo.

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE - Producción

**NO uses `dangerouslyAllowBrowser: true` en producción.**

El código actual tiene:
```typescript
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ Solo desarrollo
});
```

### Solución Recomendada para Producción

Usa **Supabase Edge Functions** para llamar a OpenAI desde el servidor:

#### 1. Crear Edge Function

```bash
npx supabase functions new chatbot-ai
```

#### 2. Código de la Edge Function

```typescript
// supabase/functions/chatbot-ai/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.0.0'

serve(async (req) => {
  const { accion, datos } = await req.json()

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY') // Seguro en servidor
  })

  let respuesta

  switch (accion) {
    case 'clasificar_area':
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: datos.prompt }]
      })
      respuesta = completion.choices[0].message.content
      break

    case 'mejorar_descripcion':
      // ... similar
      break
  }

  return new Response(
    JSON.stringify({ respuesta }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### 3. Llamar desde el Frontend

```typescript
// Reemplazar llamada directa por:
const { data } = await supabase.functions.invoke('chatbot-ai', {
  body: {
    accion: 'clasificar_area',
    datos: { prompt: '...' }
  }
})
```

---

## ⚙️ Configuración Avanzada

### Cambiar Modelo de IA

Edita `src/services/openai.service.ts`:

```typescript
const MODELS = {
  fast: 'gpt-3.5-turbo',        // Rápido y barato
  smart: 'gpt-4-turbo-preview',  // Más inteligente
  default: 'gpt-3.5-turbo'      // Cambiar aquí
};
```

### Ajustar Temperature

```typescript
// Temperature = 0.0 → Más determinista
// Temperature = 1.0 → Más creativo

// Clasificación (necesita precisión)
temperature: 0.2

// Conversación (puede ser creativo)
temperature: 0.7
```

### Personalizar Prompts

Los prompts del sistema se toman de `chatbotPrompts.ts`:

```typescript
sistemPrompts: {
  rol: `Eres un asistente virtual universitario...`,
  objetivo: `Tu objetivo es...`,
  tono: `Mantén un tono...`,
  restricciones: [...]
}
```

---

## 🧪 Testing

### Test Manual

1. Abre el chatbot
2. Verifica que aparezca el badge "🤖 IA"
3. Prueba:

**Test 1: Ubicación en mensaje**
```
Usuario: "La luz del B-201 no funciona"
Esperado: Detecta "Pabellón B - Salón 201" automáticamente
```

**Test 2: Mejora de descripción**
```
Usuario: "ahi sta roto"
Esperado: Mejora a "Está roto"
```

**Test 3: Sin ubicación**
```
Usuario: "La puerta está rota"
Esperado: Pregunta por la ubicación
```

### Verificar en Console

Abre DevTools (F12) y revisa:
```javascript
console.log('OpenAI habilitado:', OpenAIService.isOpenAIEnabled())
// Debe retornar: true
```

---

## 🎯 Flujo Completo con IA

```
1. Usuario: código de estudiante
   ↓
2. Bot: "¡Hola [Nombre]! ¿En qué área?"
   ↓
3. Usuario: "1" (selecciona área)
   ↓
4. Bot: "Describe el problema"
   ↓
5. Usuario: "La puerta del B-201 está rota"
   ↓
6. 🤖 IA PROCESA:
   - Extrae ubicación: "Pabellón B - Salón 201"
   - Mejora descripción: "La puerta está descolgada..."
   - Detecta urgencia: "media"
   ↓
7. Bot: "Ubicación detectada: B-201 ✓"
   Bot: "Creando reporte..."
   ↓
8. ✅ Reporte creado con todos los datos
```

---

## 📈 Métricas y Monitoreo

### Agregar Logging de IA

```typescript
// En openai.service.ts
console.log('🤖 IA usada:', {
  funcion: 'clasificarArea',
  tokens_usados: response.usage.total_tokens,
  costo_estimado: response.usage.total_tokens * 0.000002
})
```

### Tabla de Analytics (Opcional)

```sql
CREATE TABLE chatbot_ai_usage (
  id SERIAL PRIMARY KEY,
  funcion VARCHAR(50),
  tokens_usados INT,
  costo_estimado DECIMAL(10, 6),
  tiempo_respuesta_ms INT,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### El badge "🤖 IA" no aparece

**Causa:** API key no configurada

**Solución:**
1. Verifica que `.env` tenga `VITE_OPENAI_API_KEY`
2. Reinicia el servidor (`Ctrl+C` y `npm run dev`)
3. Refresca el navegador

### Error: "API key inválida"

**Causa:** La API key es incorrecta

**Solución:**
1. Verifica que la key empiece con `sk-`
2. Genera una nueva en https://platform.openai.com/api-keys
3. Actualiza `.env`

### Error: "Rate limit exceeded"

**Causa:** Demasiadas peticiones

**Solución:**
1. Espera unos minutos
2. Verifica tu plan en OpenAI
3. Agrega límites de rate en tu código

### La IA no extrae la ubicación

**Causa:** Mensaje ambiguo

**Solución:** El chatbot preguntará por la ubicación manualmente

---

## ✨ Resumen

✅ **OpenAI integrado** - Listo para usar
✅ **Opcional** - Funciona con y sin IA
✅ **Badge visual** - Muestra cuando IA está activa
✅ **8 funciones** - Clasificación, extracción, mejora, etc.
✅ **Económico** - ~$1 USD/mes para 1000 usuarios
✅ **Fácil activar** - Solo agregar API key
✅ **Seguro** - Instrucciones para producción incluidas

---

## 📚 Recursos

- [OpenAI Platform](https://platform.openai.com/)
- [Pricing](https://openai.com/pricing)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Documento creado:** 2025-12-02
**Versión:** 1.0
