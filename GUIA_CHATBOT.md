# 🤖 Guía del Chatbot - Detección Automática

## 🔍 **Problema: El chatbot no detecta las opciones automáticamente**

### ¿Por Qué Pasa Esto?

El chatbot tiene **DOS MODOS** de funcionamiento:

#### **Modo 1: CON Inteligencia Artificial (Recomendado)** ✨
- ✅ Detecta automáticamente el área del problema
- ✅ Extrae información relevante
- ✅ Hace el proceso más fluido y natural
- ❗ **REQUIERE**: API Key de OpenAI

#### **Modo 2: SIN Inteligencia Artificial (Manual)** 📝
- ❌ El usuario debe seleccionar manualmente el área
- ❌ Proceso más largo y manual
- ✅ **NO REQUIERE**: Nada adicional (funciona por defecto)

## ⚙️ **Cómo Activar la Detección Automática (IA)**

### Paso 1: Obtener API Key de OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com/api-keys)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en el menú
4. Haz clic en **Create new secret key**
5. Copia la clave (empieza con `sk-...`)

### Paso 2: Configurar la API Key

1. Abre el archivo `.env` en la raíz del proyecto
2. Agrega o actualiza esta línea:
   ```bash
   VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
   ```

### Paso 3: Reiniciar la Aplicación

```bash
# Detener el servidor (Ctrl + C)
# Volver a iniciar
npm run dev
```

### Paso 4: Verificar

Abre la consola del navegador (F12) y busca:

✅ **CON IA habilitada:**
```
✅ OpenAI habilitado - Chatbot funcionará con IA
```

❌ **SIN IA:**
```
⚠️ OpenAI no configurado - Chatbot funcionará sin IA
```

## 🎯 **Cómo Funciona con IA Habilitada**

### Flujo Automático:

1. **Usuario escribe su código** → `2020123456`

2. **Chatbot saluda** → "¡Hola Juan! ¿Tienes algún inconveniente?"

3. **Usuario describe el problema** → "El proyector del salón A-301 no funciona"

4. **🤖 IA Analiza y Detecta:**
   ```
   Déjame analizar tu problema... 🤔

   Entiendo. Detecto que es un problema de **Infraestructura y Mantenimiento**.

   📝 Problema detectado: Proyector no funciona en salón A-301

   Ahora, ¿en qué pabellón se encuentra el problema?
   1. Pabellón A
   2. Pabellón B
   3. Pabellón C
   ```

5. **Usuario selecciona pabellón** → `1`

6. **Chatbot muestra salones** → Lista de salones del pabellón

7. **Usuario selecciona salón** → `5`

8. **Chatbot pregunta ubicación específica** → "¿Puedes ser más específico sobre la ubicación?"

9. **Usuario responde** → "En la parte frontal del salón"

10. **✅ Reporte creado automáticamente**

## 🔧 **Solución: Mejorar el Flujo Sin IA**

Si **NO puedes configurar OpenAI**, voy a mejorar el flujo manual para que sea más claro:

### Mejoras que voy a implementar:

1. ✅ Mensajes más claros cuando no hay IA
2. ✅ Botones de opciones en lugar de solo texto
3. ✅ Validación de respuestas más robusta
4. ✅ Indicador visual del paso actual
5. ✅ Ayuda contextual en cada paso

## 📊 **Comparación de Modos**

| Característica | Con IA ✨ | Sin IA 📝 |
|----------------|-----------|-----------|
| Detección automática de área | ✅ | ❌ |
| Extracción de información | ✅ | ❌ |
| Conversación natural | ✅ | ❌ |
| Proceso más rápido | ✅ | ❌ |
| Costo | $0.002 por mensaje | Gratis |
| Requiere configuración | API Key | Ninguna |

## 💰 **Costos de OpenAI**

- **Modelo usado**: GPT-4o-mini (el más económico)
- **Costo aproximado**: $0.001 - $0.002 por mensaje
- **Ejemplo**: 1000 mensajes = ~$2 USD
- **Muy económico** para el beneficio que da

## 🐛 **Diagnóstico de Problemas**

### Problema: "El chatbot no muestra opciones"

**Causa 1: No hay IA configurada**
```
Solución: Agregar VITE_OPENAI_API_KEY al .env
```

**Causa 2: IA configurada pero no funciona**
```bash
# Verificar en consola del navegador:
localStorage.getItem('openai_enabled')  # Debería ser 'true'

# Ver logs de IA:
# Abre F12 > Console y busca mensajes con 🤖
```

**Causa 3: API Key inválida**
```
Error: 401 Unauthorized
Solución: Verifica que la API key sea correcta
```

**Causa 4: Sin créditos en OpenAI**
```
Error: 429 Rate Limit
Solución: Agrega créditos en platform.openai.com/account/billing
```

### Problema: "El chatbot se queda esperando"

**Solución temporal:**
```
Recarga la página (F5)
El chatbot se reiniciará
```

### Problema: "No se crea el reporte"

**Verifica:**
1. Que Supabase esté configurado correctamente
2. Que la tabla `area_submissions` exista
3. Permisos RLS configurados

## 🎨 **Personalización del Chatbot**

Los mensajes del chatbot se pueden personalizar en:
```
src/features/chatbot/config/chatbotPrompts.ts
```

Ejemplo:
```typescript
mensajes: {
  bienvenida: "¡Hola! ¿En qué te puedo ayudar? 😊",
  // ... más mensajes
}
```

## 📋 **Checklist de Configuración**

### Para Detección Automática (IA):
- [ ] Cuenta de OpenAI creada
- [ ] API Key generada
- [ ] API Key agregada al `.env`
- [ ] Créditos disponibles en OpenAI
- [ ] Servidor reiniciado
- [ ] Consola muestra "OpenAI habilitado"
- [ ] Chatbot detecta áreas automáticamente

### Para Flujo Manual (Sin IA):
- [ ] Áreas creadas en Supabase
- [ ] Pabellones creados en Supabase
- [ ] Salones creados en Supabase
- [ ] Chatbot muestra lista de áreas
- [ ] Usuario puede seleccionar manualmente

## 🚀 **Próximos Pasos**

¿Quieres habilitar la IA? Te puedo ayudar con:
1. Configurar la API Key de OpenAI
2. Mejorar el flujo manual sin IA
3. Agregar más funcionalidades al chatbot
4. Personalizar los mensajes

---

**Última actualización:** 2025-12-10
