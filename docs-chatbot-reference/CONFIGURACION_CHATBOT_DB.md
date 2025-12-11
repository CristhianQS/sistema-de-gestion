# 🤖 Configuración del Chatbot desde Base de Datos

## 📋 Descripción

Sistema completo para personalizar todos los prompts y configuraciones del chatbot desde el panel de administración, con almacenamiento permanente en la base de datos.

---

## 🚀 Instalación

### 1. Crear la tabla en Supabase

Ejecuta el siguiente script SQL en tu panel de Supabase:

```sql
-- El archivo completo está en: sql/create_chatbot_config_table.sql
```

O copia y pega el contenido de `sql/create_chatbot_config_table.sql` en el editor SQL de Supabase.

### 2. Verificar la instalación

Después de ejecutar el script, verifica que:
- La tabla `chatbot_config` existe
- Los índices están creados
- Las políticas RLS están activas

---

## 🎯 Cómo Usar

### Acceso al Panel

1. Inicia sesión como **Admin Black**
2. Ve al Dashboard principal
3. Haz clic en la tarjeta **"Configuración Chatbot"** 🤖 IA
4. O accede directamente a: `/admin/chatbot-config`

---

## ⚙️ Secciones Configurables

### 1️⃣ **👋 Mensajes de Bienvenida**

Personaliza los primeros mensajes que ve el usuario:

- **Mensaje Inicial**: Primer mensaje al abrir el chat
- **Código Inválido**: Respuesta cuando el formato es incorrecto
- **Código No Encontrado**: Mensaje si el código no existe

**Ejemplo de personalización:**
```
Antes: "¡Bienvenido al chatbot de asuntos académicos! 👋"
Después: "¡Hola! Soy el Asistente Virtual UPEU 🎓 ¿Cómo puedo ayudarte?"
```

### 2️⃣ **📝 Solicitudes de Información**

Configura cómo el bot pide información:

- **Descripción Muy Corta**: Mensaje de validación
- **Solicitud de Ubicación**: Cómo pide pabellón y salón
- **Ubicación Inválida**: Mensaje de error de ubicación

### 3️⃣ **✅ Parámetros de Validación**

Ajusta las reglas de validación:

- **Longitud Mínima de Descripción**: 5-100 caracteres
- **Longitud Mínima de Ubicación**: 1-50 caracteres
- **Permitir Solo Números en Código**: ☑️ Activar/desactivar

### 4️⃣ **🤖 Configuración de IA (GPT-4o-mini)**

**¡La sección más importante!** Controla el comportamiento inteligente:

#### **Rol del Asistente**
Define la identidad del chatbot:
```
Ejemplo:
"Eres UPEU Bot, un asistente virtual especializado en ayudar
a estudiantes de la Universidad Peruana Unión. Tu misión es
recopilar información clara sobre problemas del campus."
```

#### **Objetivo Principal**
Qué debe lograr:
```
Ejemplo:
"Tu objetivo es obtener:
1. Descripción detallada del problema
2. Ubicación exacta (pabellón y salón)
3. Nivel de urgencia
4. Información de contacto del estudiante"
```

#### **Tono de Comunicación**
Estilo de lenguaje:
```
Ejemplo:
"Usa un tono amigable y cercano, pero mantén profesionalismo.
Sé conciso. Evita respuestas muy largas. Usa emojis con moderación."
```

#### **Restricciones**
Límites y reglas (una por línea):
```
Ejemplo:
- No inventes información que no tienes
- No prometas tiempos de resolución
- No pidas datos personales sensibles
- Si no entiendes, pide aclaración
- Mantén respuestas de máximo 3 líneas
- Solo habla de temas relacionados al campus
```

---

## 🔧 Casos de Uso Prácticos

### Caso 1: Hacer el bot más formal

```
Tono:
"Usa tratamiento de 'usted'. Evita emojis.
Mantén un lenguaje académico y profesional."

Restricciones:
- No uses contracciones (usa "usted tiene" en vez de "tienes")
- No uses emojis
- Usa vocabulario técnico apropiado
```

### Caso 2: Hacer el bot más amigable

```
Tono:
"Sé muy cercano y amigable. Usa emojis relevantes.
Habla como un compañero de estudios que ayuda."

Restricciones:
- Usa un emoji por mensaje como máximo
- Mantén un tono casual pero respetuoso
- Si el estudiante se ve frustrado, muestra empatía
```

### Caso 3: Optimizar para velocidad

```
Objetivo:
"Recopila información en el menor tiempo posible.
Haz preguntas directas. No des explicaciones largas."

Restricciones:
- Máximo 2 líneas por respuesta
- Preguntas directas y cerradas
- No des contexto adicional innecesario
```

### Caso 4: Mejorar detección de áreas

```
Rol:
"Eres un experto en clasificar problemas del campus.
Analiza cuidadosamente las palabras clave para detectar
el área correcta."

Restricciones:
- Solo sugiere un área si tienes más del 80% de confianza
- Si hay ambigüedad, pregunta al estudiante
- Considera sinónimos y términos técnicos
```

---

## 💾 Funcionamiento Técnico

### Flujo de Datos

```
1. Admin modifica prompts en panel →
2. Se guarda en tabla chatbot_config →
3. Chatbot carga config al iniciar →
4. IA usa prompts personalizados
```

### Estructura en BD

```json
{
  "mensajes": {
    "bienvenida": "...",
    "codigoInvalido": "...",
    ...
  },
  "solicitudes": {
    "descripcionMuyCorta": "...",
    ...
  },
  "validacion": {
    "longitudMinimaDescripcion": 10,
    ...
  },
  "sistemPrompts": {
    "rol": "...",
    "objetivo": "...",
    "tono": "...",
    "restricciones": ["...", "..."]
  }
}
```

### Archivos Modificados

```
src/
├── services/database/
│   └── chatbot-config.service.ts  ← Nuevo servicio
├── features/chatbot/
│   ├── components/
│   │   ├── ConfiguracionChatbot.tsx  ← Actualizado
│   │   └── ChatbotAsistente.tsx      ← Actualizado
│   └── config/
│       └── chatbotPrompts.ts         ← Sin cambios

sql/
└── create_chatbot_config_table.sql   ← Script SQL

docs/
└── CONFIGURACION_CHATBOT_DB.md       ← Esta documentación
```

---

## 🎛️ Funciones Principales

### Guardar Configuración
```typescript
await saveChatbotConfig(config);
```
Guarda toda la configuración en la BD de forma permanente.

### Cargar Configuración
```typescript
const config = await loadChatbotConfig();
```
Carga la configuración guardada (o null si no hay ninguna).

### Restaurar a Valores por Defecto
```typescript
await deleteChatbotConfig();
```
Elimina la configuración personalizada y vuelve a los valores originales.

---

## 🔒 Seguridad

### Permisos

- ✅ **Admin Black**: Puede leer y modificar toda la configuración
- ✅ **Admin Oro/Plata**: Solo pueden leer (no modificar)
- ❌ **Usuarios públicos**: Sin acceso

### Row Level Security (RLS)

```sql
-- Solo Admin Black puede modificar
CREATE POLICY "Solo Admin Black puede modificar configuración"
  ON chatbot_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.email()
      AND admins.role = 'admin_black'
    )
  );
```

---

## 📊 Monitoreo

### Ver configuración actual en BD

```sql
SELECT
  config_key,
  config_data->>'mensajes' as mensajes,
  config_data->>'sistemPrompts' as prompts_ia,
  updated_at
FROM chatbot_config
WHERE config_key = 'chatbot_main_config';
```

### Ver historial de cambios

```sql
SELECT
  config_key,
  updated_at,
  jsonb_pretty(config_data) as configuracion
FROM chatbot_config
ORDER BY updated_at DESC;
```

---

## 🐛 Solución de Problemas

### Problema: Los cambios no se aplican

**Solución:**
1. Verifica que hiciste clic en "Guardar Cambios"
2. Recarga la página del chatbot
3. Revisa la consola del navegador para errores

### Problema: Error al guardar

**Solución:**
1. Verifica que la tabla `chatbot_config` existe
2. Confirma que tienes rol de Admin Black
3. Revisa las políticas RLS en Supabase

### Problema: El chatbot usa configuración antigua

**Solución:**
1. El chatbot carga la config al iniciar
2. Cierra y abre el chatbot nuevamente
3. O recarga la página completa (F5)

---

## 📈 Mejores Prácticas

### ✅ HACER

- Prueba cambios en entorno de desarrollo primero
- Usa restricciones claras y específicas
- Mantén prompts concisos (máximo 2-3 párrafos)
- Documenta por qué hiciste cambios importantes
- Haz backup de configuraciones exitosas

### ❌ NO HACER

- No uses prompts ambiguos o contradictorios
- No cambies todo de golpe (hazlo gradualmente)
- No olvides probar después de cada cambio
- No uses lenguaje ofensivo o inapropiado
- No elimines restricciones de seguridad

---

## 🎓 Ejemplos de Prompts Efectivos

### Prompt Efectivo ✅

```
Rol:
"Eres UPEU Assistant, especializado en problemas del campus."

Objetivo:
"Recopila: descripción, ubicación y urgencia del problema."

Tono:
"Amigable pero conciso. Máximo 2 líneas por mensaje."

Restricciones:
- No inventes información
- Pide aclaración si algo no es claro
- Solo maneja temas del campus
```

### Prompt Inefectivo ❌

```
Rol:
"Eres un bot super inteligente que sabe todo y puede
resolver cualquier problema del universo..."

Objetivo:
"Ayuda con lo que sea..."

Tono:
"Como quieras, depende..."

Restricciones:
- Ninguna
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta documentación
2. Verifica los logs en la consola
3. Contacta al equipo de desarrollo
4. Reporta bugs en el sistema de issues

---

## 🔄 Actualizaciones Futuras

Próximas funcionalidades planeadas:

- [ ] Historial de versiones de configuración
- [ ] Plantillas predefinidas de prompts
- [ ] A/B testing de diferentes configuraciones
- [ ] Métricas de efectividad de prompts
- [ ] Exportar/importar configuraciones

---

## 📄 Licencia

Parte del Sistema de Gestión UPEU

**Versión:** 1.0.0
**Última actualización:** Diciembre 2025
