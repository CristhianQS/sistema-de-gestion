# Chatbot Asistente Integrado

## ✅ Implementación Completada

El chatbot ha sido implementado **directamente en el proyecto React** sin necesidad de n8n. Funciona con lógica de reglas y se integra completamente con tu base de datos de Supabase.

---

## 🎯 Características Implementadas

### ✓ Funcionalidades
1. **Consulta de alumno por código** - Busca automáticamente en `data_alumnos`
2. **Saludo personalizado** - Responde con el nombre del estudiante
3. **Selección de área** - Lista todas las áreas disponibles
4. **Captura de descripción del problema** - Recopila detalles
5. **Captura de ubicación** - Pabellón y salón
6. **Creación de reporte** - Guarda en `area_submissions` con marca de IA
7. **Interfaz estilo WhatsApp** - Diseño verde moderno

### ✓ Identificación de Reportes de IA
Los reportes creados por el chatbot incluyen:
```javascript
{
  created_by: 'ia_chatbot',
  ia_metadata: {
    timestamp: '2025-12-02T10:30:00Z',
    confidence: 1.0,
    model: 'chatbot_rules',
    type: 'asistente_automatico'
  }
}
```

---

## 📁 Archivos Creados/Modificados

### Nuevo Archivo
```
src/components/ChatbotAsistente.tsx
```
- Componente React completo
- Maneja toda la lógica de conversación
- Se conecta directamente a Supabase

### Archivo Modificado
```
src/pages/PublicView.tsx
```
- Importa y renderiza `ChatbotAsistente`
- Eliminó el código de n8n
- Chatbot visible solo en vista pública

---

## 🚀 Cómo Funciona

### Flujo de Conversación

```
1. Usuario abre el chat
   ↓
2. Chatbot: "Bienvenido, ingresa tu código"
   ↓
3. Usuario: 202110234
   ↓
4. Chatbot busca en data_alumnos
   ↓
5. Chatbot: "¡Hola Juan Pérez! ¿En qué área?"
   ↓
6. Usuario: 1 (selecciona área)
   ↓
7. Chatbot: "Describe el problema"
   ↓
8. Usuario: "La puerta está rota"
   ↓
9. Chatbot: "¿Ubicación?"
   ↓
10. Usuario: "Pabellón B, Salón 201"
    ↓
11. Chatbot crea reporte en area_submissions
    ↓
12. Chatbot: "✅ Reporte #1234 creado"
```

### Estados de Conversación

```typescript
'greeting' → 'waiting_code' → 'waiting_area' →
'waiting_description' → 'waiting_location' → 'completed'
```

---

## 🎨 Interfaz Visual

### Botón Flotante
- Verde estilo WhatsApp
- Ubicación: inferior derecha
- Tamaño: 56x56px
- Animación hover

### Ventana del Chat
- Ancho: 384px (96 en Tailwind)
- Alto: 600px
- Borde verde superior (2px)
- Fondo degradado sutil
- Scrollbar personalizada

### Mensajes
- **Usuario**: Verde claro, derecha
- **Bot**: Blanco, izquierda
- Timestamp incluido
- Animación de "escribiendo..."

---

## 📊 Base de Datos

### Tabla Utilizada: `area_submissions`

```sql
INSERT INTO area_submissions (
  area_id,
  alumno_id,
  alumno_dni,
  alumno_codigo,
  alumno_nombre,
  form_data,
  status,
  created_by  -- ⭐ Nuevo campo (opcional)
) VALUES (...)
```

### Estructura del `form_data`:

```json
{
  "descripcion": "La puerta está rota",
  "ubicacion": "Pabellón B, Salón 201",
  "created_by": "ia_chatbot",
  "ia_metadata": {
    "timestamp": "2025-12-02T10:30:00Z",
    "confidence": 1.0,
    "model": "chatbot_rules",
    "type": "asistente_automatico"
  }
}
```

---

## 🔧 Configuración Adicional (Opcional)

### Opción 1: Agregar columna `created_by`

Si quieres una columna dedicada para identificar el origen:

```sql
ALTER TABLE area_submissions
ADD COLUMN created_by VARCHAR(50) DEFAULT 'usuario';

CREATE INDEX idx_area_submissions_created_by
ON area_submissions(created_by);
```

### Opción 2: Sin modificar tabla

El chatbot ya guarda la identificación dentro de `form_data`, así que **NO necesitas modificar la tabla**.

---

## 🎨 Mostrar Badge de IA en Reportes

Para mostrar un badge "🤖 Creado por IA" en la lista de reportes:

### En `VisualizarReportes.tsx` o similar:

```tsx
// Función helper
const esReporteIA = (submission: AreaSubmission) => {
  return submission.created_by === 'ia_chatbot' ||
         submission.form_data?.created_by === 'ia_chatbot';
};

// En el render de cada reporte
{submissions.map((submission) => (
  <div key={submission.id} className="border rounded-lg p-4">
    <div className="flex items-center justify-between">
      <h3>{submission.alumno_nombre}</h3>

      {/* Badge de IA */}
      {esReporteIA(submission) && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-lg">
          🤖 Creado por IA
        </span>
      )}
    </div>
    {/* resto del contenido */}
  </div>
))}
```

---

## 🚀 Mejora Futura: Agregar OpenAI (Opcional)

Si quieres hacer el chatbot más inteligente con IA real, puedes agregar OpenAI:

### 1. Instalar dependencia

```bash
npm install openai
```

### 2. Agregar variables de entorno

```env
# .env
VITE_OPENAI_API_KEY=sk-...
```

### 3. Crear servicio de OpenAI

```typescript
// src/services/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Solo para desarrollo
});

export async function clasificarArea(mensaje: string, areas: Area[]) {
  const prompt = `
Clasifica el siguiente problema en una de estas áreas:
${areas.map((a, i) => `${i + 1}. ${a.name}`).join('\n')}

Problema: "${mensaje}"

Responde SOLO con el número del área (1-${areas.length}).
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 10
  });

  const areaNum = parseInt(response.choices[0].message.content || '0');
  return areaNum > 0 && areaNum <= areas.length ? areaNum - 1 : null;
}

export async function extraerDatos(mensaje: string) {
  const prompt = `
Extrae del siguiente mensaje:
1. Descripción del problema
2. Ubicación (pabellón y salón si se menciona)
3. Nivel de urgencia (bajo/medio/alto)

Mensaje: "${mensaje}"

Responde en formato JSON:
{
  "descripcion": "...",
  "ubicacion": "...",
  "urgencia": "..."
}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
```

### 4. Usar en ChatbotAsistente.tsx

```typescript
import { clasificarArea, extraerDatos } from '../services/openai';

// En handleSeleccionArea
const areaIndex = await clasificarArea(respuesta, areas);
if (areaIndex !== null) {
  const areaSeleccionada = areas[areaIndex];
  // continuar...
}

// En handleDescripcion
const datosExtraidos = await extraerDatos(descripcion);
// usar datosExtraidos.ubicacion, datosExtraidos.urgencia, etc.
```

---

## 🔒 Seguridad

### ⚠️ Importante para Producción

Si usas OpenAI, **NO expongas la API key en el frontend**. Opciones:

1. **Usar Supabase Edge Functions** (Recomendado)
2. **Crear un backend Node.js/Express**
3. **Usar Vercel Serverless Functions**

### Ejemplo con Supabase Edge Function:

```typescript
// supabase/functions/chatbot-ai/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { OpenAI } from 'https://esm.sh/openai@4.0.0'

serve(async (req) => {
  const { mensaje, areas } = await req.json()

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: mensaje }]
  })

  return new Response(
    JSON.stringify({ respuesta: response.choices[0].message.content }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## 🧪 Testing

### Casos de Prueba

1. **Código válido**
   ```
   Usuario: 202110234
   Esperado: Saludo con nombre
   ```

2. **Código inválido**
   ```
   Usuario: 999999
   Esperado: "Código no encontrado"
   ```

3. **Flujo completo**
   ```
   1. Código: 202110234
   2. Área: 1
   3. Descripción: "Problema con la luz"
   4. Ubicación: "B-201"
   Esperado: Reporte creado exitosamente
   ```

4. **Descripción muy corta**
   ```
   Usuario: "Luz"
   Esperado: "Proporciona más detalle"
   ```

---

## 📈 Monitoreo (Opcional)

Puedes crear una tabla para hacer seguimiento:

```sql
CREATE TABLE chatbot_analytics (
  id SERIAL PRIMARY KEY,
  alumno_id INT REFERENCES data_alumnos(id),
  area_id INT REFERENCES areas(id),
  mensaje_usuario TEXT,
  reporte_creado_id INT REFERENCES area_submissions(id),
  duracion_conversacion_segundos INT,
  exitoso BOOLEAN,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Ventajas vs n8n

| Característica | Chatbot Integrado | n8n |
|----------------|-------------------|-----|
| Sin dependencias externas | ✅ | ❌ |
| Código en el proyecto | ✅ | ❌ |
| Más rápido | ✅ | ❌ |
| Personalizable | ✅ | ⚠️ |
| Requiere servidor adicional | ❌ | ✅ |
| Costo | Gratis | Gratis (self-hosted) |

---

## 🔄 Próximos Pasos Sugeridos

1. ✅ **Probar el chatbot** - Abrir la página pública y testear
2. ⚠️ **Decidir sobre `created_by`** - Agregar columna o usar `form_data`
3. 🎨 **Agregar badge en reportes** - Mostrar identificador visual
4. 🤖 **Opcional: OpenAI** - Si quieres IA más inteligente
5. 📊 **Analytics** - Tabla de seguimiento de conversaciones

---

## 🐛 Troubleshooting

### El botón no aparece
- Verifica que `ChatbotAsistente` esté importado en `PublicView.tsx`
- Revisa la consola del navegador por errores

### No encuentra al alumno
- Verifica que el código exista en `data_alumnos`
- Chequea la columna `codigo` (debe ser tipo `number`)

### Error al crear reporte
- Revisa permisos de Supabase
- Verifica que `area_submissions` tenga las columnas correctas
- Chequea la consola por mensajes de error

### Estilos no se aplican
- Limpia cache del navegador
- Verifica que Tailwind CSS esté configurado correctamente

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica logs de Supabase
3. Comprueba que las tablas existan y tengan datos

---

**Documento creado:** 2025-12-02
**Versión:** 1.0
**Última actualización:** 2025-12-02

---

## ✨ Resumen

**¡El chatbot está listo para usar!** 🎉

- ✅ Totalmente integrado en el proyecto
- ✅ Sin dependencias de n8n
- ✅ Funciona con reglas lógicas
- ✅ Guarda reportes con identificación de IA
- ✅ Interfaz estilo WhatsApp
- ✅ Listo para producción

**Opcional:** Agregar OpenAI para hacerlo más inteligente siguiendo las instrucciones de este documento.
