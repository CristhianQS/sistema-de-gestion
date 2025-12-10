# ✅ Funcionalidad: Mesa de Ayuda para Problemas No Detectados

## 🎯 Funcionalidad Implementada

Cuando el chatbot **NO puede detectar** el área del problema (porque no coincide con ninguna opción configurada), muestra un mensaje con el número de la Mesa de Ayuda.

---

## 📋 Cómo Funciona

### Caso 1: ✅ Problema Detectado (Coincide con opciones)

```
Usuario: "tengo problemas con el router"

IA busca en opciones de todas las áreas:
  - DTI: [HDMI, router, cable] ← ✅ Encuentra "router"

Chatbot: "✅ Entiendo. Detecto que es un problema de DTI."
→ Continúa con el flujo normal
```

### Caso 2: ❌ Problema NO Detectado (No coincide con opciones)

```
Usuario: "necesito ayuda con mi matrícula"

IA busca en opciones de todas las áreas:
  - DTI: [HDMI, router, cable] ← ❌ No coincide
  - Infraestructura: [silla, mesa, puerta] ← ❌ No coincide
  - Biblioteca: [libro, préstamo] ← ❌ No coincide

Confianza: < 70% → No detectado

Chatbot muestra:
```

**Mensaje del Chatbot:**
```
❌ Lo siento, no logro entender completamente tu inconveniente.

📞 Te recomiendo contactar directamente con nuestra Mesa de Ayuda:

📱 WhatsApp: 951292515

💡 También puedes intentar describirme tu problema de otra manera, mencionando:
   - El equipo o lugar específico (proyector, silla, salón, etc.)
   - Qué está fallando exactamente

¿Quieres intentarlo de nuevo o prefieres contactar a la Mesa de Ayuda?
```

---

## 🔍 Cuándo se Muestra el Mensaje

El mensaje de Mesa de Ayuda aparece cuando:

1. **Ninguna opción coincide:**
   - El usuario menciona algo que no está en las opciones de ninguna área
   - Ejemplo: "matrícula", "pensión", "trámite académico" (si no están configurados)

2. **Confianza baja (< 70%):**
   - La IA encuentra alguna coincidencia pero no está segura
   - Ejemplo: Usuario dice algo muy ambiguo o genérico

3. **Error en el sistema:**
   - Falla la conexión con OpenAI
   - Error al cargar opciones

---

## 💡 Ejemplos Reales

### Ejemplo 1: Problema Académico (No configurado)

```
Usuario: "necesito cambiar de horario"

Áreas configuradas:
  - DTI: [HDMI, router, cable, proyector]
  - Infraestructura: [silla, mesa, puerta, luz]
  - Biblioteca: [libro, préstamo, carnet]

❌ Ninguna área tiene opciones relacionadas con "horario"

Chatbot:
❌ Lo siento, no logro entender completamente tu inconveniente.
📞 Te recomiendo contactar directamente con nuestra Mesa de Ayuda:
📱 WhatsApp: 951292515
```

### Ejemplo 2: Descripción Muy Genérica

```
Usuario: "tengo un problema"

IA: No hay palabras clave específicas
Confianza: 20% (muy baja)

Chatbot:
❌ Lo siento, no logro entender completamente tu inconveniente.
📞 Te recomiendo contactar directamente con nuestra Mesa de Ayuda:
📱 WhatsApp: 951292515

💡 También puedes intentar describirme tu problema de otra manera...
```

### Ejemplo 3: Usuario Reformula y Funciona

```
Usuario: "tengo un problema"
Chatbot: ❌ No logro entender... [muestra mensaje de Mesa de Ayuda]

Usuario: "el proyector no funciona"
Chatbot: ✅ Entiendo. Detecto que es un problema de DTI.
→ Continúa con el flujo normal ✅
```

---

## 🎯 Ventajas del Sistema

| Ventaja | Descripción |
|---------|-------------|
| ✅ No deja al usuario sin respuesta | Siempre ofrece una alternativa |
| ✅ Número de contacto claro | WhatsApp: 951292515 |
| ✅ Sugiere reformular | Da tips de cómo describir mejor |
| ✅ Permite intentar de nuevo | El usuario puede escribir otra vez |
| ✅ Mantiene el flujo | Vuelve a `waiting_problem` |

---

## 📱 Flujo Completo con Mesa de Ayuda

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario describe problema                              │
│     "necesito ayuda con mi pensión"                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. IA busca en opciones de todas las áreas                │
│     - DTI: No coincide                                     │
│     - Infraestructura: No coincide                         │
│     - Biblioteca: No coincide                              │
│     Confianza: < 70%                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Chatbot muestra mensaje de Mesa de Ayuda              │
│     ❌ No logro entender tu inconveniente                  │
│     📱 WhatsApp: 951292515                                 │
│     💡 Puedes reformular o contactar mesa de ayuda        │
└─────────────────────────────────────────────────────────────┘
                          ↓
           ┌──────────────────────────────┐
           │  Usuario decide:             │
           └──────────────────────────────┘
                 ↙                    ↘
┌─────────────────────────┐    ┌─────────────────────────┐
│  Opción 1:              │    │  Opción 2:              │
│  Reformula el problema  │    │  Contacta por WhatsApp  │
│                         │    │                         │
│  "el cable hdmi no      │    │  Llama/escribe a:       │
│   funciona"             │    │  951292515              │
│                         │    │                         │
│  ✅ Detecta: DTI        │    │  ✅ Ayuda directa       │
└─────────────────────────┘    └─────────────────────────┘
```

---

## 🧪 Pruebas

### Prueba 1: Problema No Configurado

1. **Usuario dice:** "necesito pagar mi pensión"
2. **Resultado esperado:**
   ```
   ❌ Lo siento, no logro entender completamente tu inconveniente.
   📱 WhatsApp: 951292515
   ```

### Prueba 2: Descripción Muy Vaga

1. **Usuario dice:** "tengo un problema urgente"
2. **Resultado esperado:**
   ```
   ❌ Lo siento, no logro entender completamente tu inconveniente.
   📱 WhatsApp: 951292515
   💡 También puedes intentar describirme tu problema de otra manera...
   ```

### Prueba 3: Reformulación Exitosa

1. **Usuario dice:** "algo no funciona"
2. **Chatbot:** Mensaje de Mesa de Ayuda
3. **Usuario reformula:** "el proyector está apagado"
4. **Resultado esperado:**
   ```
   ✅ Entiendo. Detecto que es un problema de DTI.
   ```

---

## 📞 Información de Contacto

**Mesa de Ayuda UPEU:**
- 📱 WhatsApp: **951292515**
- 📝 Disponible para problemas que el chatbot no pueda procesar

---

## 🔧 Configuración Técnica

### Archivo Modificado:
**`src/features/chatbot/components/ChatbotAsistente.tsx`**

### Cambios:
1. **Líneas 453-473:** Caso cuando `areaDetectada === null`
   - Muestra mensaje de Mesa de Ayuda
   - Reinicia estado a `waiting_problem`

2. **Líneas 474-494:** Caso cuando hay error
   - Mismo mensaje de Mesa de Ayuda
   - Manejo de errores mejorado

### Lógica:
```typescript
if (areaDetectada) {
  // ✅ Área detectada → Continuar flujo normal
} else {
  // ❌ No detectada → Mostrar Mesa de Ayuda
  addBotMessage(
    `❌ Lo siento, no logro entender completamente tu inconveniente.\n\n` +
    `📞 Te recomiendo contactar directamente con nuestra Mesa de Ayuda:\n\n` +
    `📱 WhatsApp: 951292515\n\n` +
    `💡 También puedes intentar describirme tu problema de otra manera...`
  );
}
```

---

## ✅ Estado

| Componente | Estado |
|------------|--------|
| Detección por opciones | ✅ Funcionando |
| Mensaje de Mesa de Ayuda | ✅ Implementado |
| WhatsApp: 951292515 | ✅ Configurado |
| Opción de reformular | ✅ Disponible |
| Manejo de errores | ✅ Mejorado |

---

**El chatbot ahora proporciona el número de Mesa de Ayuda cuando no puede detectar el área del problema!** 📞🚀

---

**Versión:** 1.0
**Fecha:** 2025-12-10
**Número de Mesa de Ayuda:** 951292515
