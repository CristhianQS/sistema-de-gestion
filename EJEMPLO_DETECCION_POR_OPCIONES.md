# 📝 Ejemplo: Detección de Área por Opciones de Campos

## 🎯 Concepto Clave

**El nombre del área NO es lo importante.**
**Las OPCIONES de los campos SÍ son lo importante.**

El chatbot busca coincidencias entre lo que el usuario dice y las **opciones específicas** configuradas en los campos de cada área.

---

## 📊 Ejemplo Real con 3 Áreas

### Área 1: "Infraestructura y Mantenimiento"
```json
{
  "id": 1,
  "name": "Infraestructura y Mantenimiento",
  "campos": [
    {
      "field_label": "Tipo de problema",
      "field_type": "select",
      "options": ["proyector", "aire acondicionado", "luces", "puertas", "ventanas"]
    },
    {
      "field_label": "Descripción",
      "field_type": "textarea"
    }
  ]
}
```

### Área 2: "Mobiliario"
```json
{
  "id": 2,
  "name": "Mobiliario",
  "campos": [
    {
      "field_label": "Tipo de daño",
      "field_type": "select",
      "options": ["silla rota", "mesa dañada", "estante", "pizarra", "casillero"]
    },
    {
      "field_label": "Ubicación",
      "field_type": "text"
    }
  ]
}
```

### Área 3: "Servicios Académicos"
```json
{
  "id": 3,
  "name": "Servicios Académicos",
  "campos": [
    {
      "field_label": "Tipo de consulta",
      "field_type": "select",
      "options": ["notas", "inscripción", "certificados", "horarios", "convalidación"]
    },
    {
      "field_label": "Semestre",
      "field_type": "text"
    }
  ]
}
```

---

## 🔍 Casos de Uso: Cómo la IA Detecta el Área

### Caso 1: Usuario reporta problema con proyector

**Usuario dice:**
```
"El proyector del salón A-101 no enciende"
```

**Proceso de la IA:**

1. **Recibe información de áreas con opciones:**
   ```
   0. Infraestructura y Mantenimiento
      Campos del formulario:
      - Tipo de problema (select) - Opciones: proyector, aire acondicionado, luces, puertas, ventanas

   1. Mobiliario
      Campos del formulario:
      - Tipo de daño (select) - Opciones: silla rota, mesa dañada, estante, pizarra, casillero

   2. Servicios Académicos
      Campos del formulario:
      - Tipo de consulta (select) - Opciones: notas, inscripción, certificados, horarios, convalidación
   ```

2. **Analiza el mensaje del usuario:**
   - Palabra clave encontrada: **"proyector"**
   - Busca "proyector" en todas las opciones
   - ✅ Encuentra coincidencia en Área 0, campo "Tipo de problema"

3. **Resultado:**
   ```json
   {
     "areaIndex": 0,
     "confianza": 95,
     "razon": "El usuario menciona 'proyector', que coincide exactamente con una opción del campo 'Tipo de problema' del área Infraestructura"
   }
   ```

4. **Respuesta del chatbot:**
   ```
   ✅ Entiendo. Detecto que es un problema de Infraestructura y Mantenimiento.
   📝 Proyector del salón no enciende
   ```

---

### Caso 2: Usuario reporta silla rota

**Usuario dice:**
```
"Hay una silla rota en el salón B-203"
```

**Proceso de la IA:**

1. **Analiza el mensaje:**
   - Palabra clave encontrada: **"silla rota"**
   - Busca "silla" o "silla rota" en todas las opciones
   - ✅ Encuentra coincidencia en Área 1, campo "Tipo de daño"

2. **Resultado:**
   ```json
   {
     "areaIndex": 1,
     "confianza": 92,
     "razon": "El usuario menciona 'silla rota', que coincide exactamente con una opción del campo 'Tipo de daño' del área Mobiliario"
   }
   ```

3. **Respuesta del chatbot:**
   ```
   ✅ Entiendo. Detecto que es un problema de Mobiliario.
   📝 Silla rota en el salón
   ```

---

### Caso 3: Usuario pregunta por notas

**Usuario dice:**
```
"Necesito revisar mis notas del semestre pasado"
```

**Proceso de la IA:**

1. **Analiza el mensaje:**
   - Palabra clave encontrada: **"notas"**
   - Busca "notas" en todas las opciones
   - ✅ Encuentra coincidencia en Área 2, campo "Tipo de consulta"

2. **Resultado:**
   ```json
   {
     "areaIndex": 2,
     "confianza": 88,
     "razon": "El usuario menciona 'notas', que coincide con una opción del campo 'Tipo de consulta' del área Servicios Académicos"
   }
   ```

3. **Respuesta del chatbot:**
   ```
   ✅ Entiendo. Detecto que es un problema de Servicios Académicos.
   📝 Consulta sobre notas del semestre anterior
   ```

---

### Caso 4: Usuario con palabra similar

**Usuario dice:**
```
"El aire del salón está muy frío"
```

**Proceso de la IA:**

1. **Analiza el mensaje:**
   - Palabra clave encontrada: **"aire"**
   - Busca "aire" en todas las opciones
   - ✅ Encuentra coincidencia parcial con "aire acondicionado" en Área 0

2. **Resultado:**
   ```json
   {
     "areaIndex": 0,
     "confianza": 85,
     "razon": "El usuario menciona 'aire', que relaciona con la opción 'aire acondicionado' del campo 'Tipo de problema'"
   }
   ```

3. **Respuesta del chatbot:**
   ```
   ✅ Entiendo. Detecto que es un problema de Infraestructura y Mantenimiento.
   📝 Problema con temperatura del aire acondicionado
   ```

---

## 🎯 Lo Que Importa

| ❌ NO importa | ✅ SÍ importa |
|--------------|-------------|
| El nombre exacto del área | Las opciones de los campos select |
| La descripción del área | Coincidencias entre problema y opciones |
| El orden de las áreas | Las palabras clave en las opciones |

---

## 📋 Flujo Técnico Completo

```
1. Usuario describe problema
   ↓
2. Chatbot carga TODAS las áreas con sus campos
   ↓
3. Para cada área, extrae las opciones de los campos select
   ↓
4. Envía a OpenAI:
   - Mensaje del usuario
   - Lista de áreas con sus opciones
   ↓
5. OpenAI busca coincidencias entre:
   - Palabras del mensaje
   - Opciones configuradas en cada área
   ↓
6. OpenAI devuelve:
   - Área detectada (por índice)
   - Confianza (0-100%)
   - Razón (explicando qué opción coincidió)
   ↓
7. Chatbot usa esa área para crear el reporte
```

---

## 🧪 Prueba Real

### En Supabase, configura:

**Área: "Soporte TI"**
| Campo | Tipo | Opciones |
|-------|------|----------|
| Tipo de equipo | select | `["laptop", "desktop", "impresora", "scanner"]` |

**Área: "Mantenimiento Aulas"**
| Campo | Tipo | Opciones |
|-------|------|----------|
| Problema | select | `["limpieza", "basura", "pisos sucios", "baños"]` |

### Prueba en el chatbot:

```
Usuario: "La impresora no imprime"
→ Detecta: "Soporte TI" (coincide con opción "impresora")

Usuario: "El baño está sucio"
→ Detecta: "Mantenimiento Aulas" (coincide con opción "baños")

Usuario: "Mi laptop no prende"
→ Detecta: "Soporte TI" (coincide con opción "laptop")
```

---

## ✅ Confirmación del Funcionamiento

El código actual YA hace esto:

1. ✅ Carga todos los campos de todas las áreas
2. ✅ Extrae las opciones de los campos `select`
3. ✅ Pasa las opciones a la IA
4. ✅ La IA busca coincidencias entre el mensaje y las opciones
5. ✅ Selecciona el área basándose en las coincidencias con las opciones

**El sistema está listo para usar!** 🚀

---

**Recuerda:**
- El nombre del área puede ser cualquier cosa
- Lo importante son las **opciones configuradas en los campos**
- El chatbot detecta automáticamente qué opción menciona el usuario
- Envía el reporte al área que tiene esa opción configurada

---

**Versión:** 1.0
**Fecha:** 2025-12-10
**Estado:** ✅ FUNCIONANDO
