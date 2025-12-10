/**
 * Servicio de OpenAI para el Chatbot
 *
 * Este servicio maneja todas las interacciones con la API de ChatGPT
 * para hacer el chatbot más inteligente y capaz de entender contexto.
 */

import OpenAI from 'openai';
import { chatbotConfig } from '../config/chatbotPrompts';
import type { Area, AreaField } from '../../../types';

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Solo para desarrollo/demo
});

/**
 * Configuración de modelos
 */
const MODELS = {
  fast: 'gpt-4o-mini',          // Rápido y económico
  smart: 'gpt-4o',              // Más inteligente
  default: 'gpt-4o-mini'        // GPT-4o-mini por defecto
};

/**
 * Verificar si OpenAI está configurado
 */
export function isOpenAIEnabled(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

/**
 * Clasificar automáticamente en qué área debe ir el reporte
 *
 * @param mensaje - Descripción del problema del estudiante
 * @param areas - Lista de áreas disponibles
 * @returns Índice del área seleccionada (0-based) o null si no se pudo clasificar
 */
export async function clasificarArea(
  mensaje: string,
  areas: Area[]
): Promise<number | null> {
  try {
    const areasTexto = areas.map((a, i) => `${i}. ${a.name}: ${a.description || 'Sin descripción'}`).join('\n');

    const prompt = `Eres un asistente de clasificación de reportes universitarios.

ÁREAS DISPONIBLES:
${areasTexto}

PROBLEMA DEL ESTUDIANTE:
"${mensaje}"

INSTRUCCIONES:
1. Lee cuidadosamente el problema
2. Identifica a qué área pertenece
3. Responde SOLO con el número del índice (0, 1, 2, etc.)
4. Si no estás seguro, responde "-1"

Número del área:`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content: chatbotConfig.sistemPrompts.rol + '\n' + chatbotConfig.sistemPrompts.objetivo
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const resultado = response.choices[0].message.content?.trim();
    const indice = parseInt(resultado || '-1');

    if (indice >= 0 && indice < areas.length) {
      return indice;
    }

    return null;
  } catch (error) {
    console.error('Error al clasificar área con OpenAI:', error);
    return null;
  }
}

/**
 * Extraer información estructurada del mensaje del estudiante
 *
 * @param mensaje - Descripción completa del problema
 * @returns Objeto con información extraída
 */
export async function extraerInformacion(mensaje: string): Promise<{
  descripcion: string;
  ubicacion: string | null;
  urgencia: 'baja' | 'media' | 'alta';
  categoria: string | null;
}> {
  try {
    const prompt = `Analiza el siguiente reporte de un estudiante y extrae la información clave.

REPORTE:
"${mensaje}"

INSTRUCCIONES:
Extrae:
1. descripcion: Descripción clara del problema (mejorada si es necesario)
2. ubicacion: Pabellón y salón si se menciona (o null)
3. urgencia: baja, media o alta según la gravedad
4. categoria: Tipo de problema (infraestructura, académico, tecnología, etc.)

Responde en formato JSON válido.`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente experto en extraer información estructurada de reportes universitarios.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const resultado = JSON.parse(response.choices[0].message.content || '{}');

    return {
      descripcion: resultado.descripcion || mensaje,
      ubicacion: resultado.ubicacion || null,
      urgencia: resultado.urgencia || 'media',
      categoria: resultado.categoria || null
    };
  } catch (error) {
    console.error('Error al extraer información con OpenAI:', error);
    return {
      descripcion: mensaje,
      ubicacion: null,
      urgencia: 'media',
      categoria: null
    };
  }
}

/**
 * Generar respuesta conversacional inteligente
 *
 * @param conversacionHistorial - Historial de mensajes
 * @param contexto - Contexto actual (alumno, área, etc.)
 * @returns Respuesta generada por ChatGPT
 */
export async function generarRespuesta(
  conversacionHistorial: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  contexto?: {
    alumno?: { nombre: string; codigo: number };
    area?: string;
    paso?: string;
  }
): Promise<string> {
  try {
    const mensajesSistema: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `${chatbotConfig.sistemPrompts.rol}

${chatbotConfig.sistemPrompts.objetivo}

TONO:
${chatbotConfig.sistemPrompts.tono}

RESTRICCIONES:
${chatbotConfig.sistemPrompts.restricciones.map(r => `- ${r}`).join('\n')}

${contexto ? `
CONTEXTO ACTUAL:
${contexto.alumno ? `- Estudiante: ${contexto.alumno.nombre} (${contexto.alumno.codigo})` : ''}
${contexto.area ? `- Área seleccionada: ${contexto.area}` : ''}
${contexto.paso ? `- Paso actual: ${contexto.paso}` : ''}
` : ''}`
      }
    ];

    const response = await openai.chat.completions.create({
      model: MODELS.default,
      messages: [...mensajesSistema, ...conversacionHistorial],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content || 'Lo siento, no pude procesar tu mensaje.';
  } catch (error) {
    console.error('Error al generar respuesta con OpenAI:', error);
    return 'Lo siento, estoy teniendo problemas técnicos. ¿Podrías reformular tu pregunta?';
  }
}

/**
 * Responder a saludos de manera natural y solicitar código
 *
 * @param mensajeUsuario - Saludo o mensaje inicial del usuario
 * @returns Respuesta amigable + solicitud de código
 */
export async function responderSaludo(mensajeUsuario: string): Promise<string> {
  try {
    const prompt = `El usuario te escribió: "${mensajeUsuario}"

Responde de forma BREVE y DIRECTA:
1. Saludo corto (1 línea)
2. Pide el código de estudiante

Ejemplo: "¡Hola! 👋 Bienvenido al Asistente UPEU. ¿Me das tu código de estudiante?"

IMPORTANTE:
- Máximo 2 líneas
- Directo al punto
- Sin presentaciones largas

Respuesta:`;

    const response = await openai.chat.completions.create({
      model: MODELS.default,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente conciso y directo.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 60
    });

    return response.choices[0].message.content?.trim() ||
      '¡Hola! 👋 ¿Cuál es tu código de estudiante?';
  } catch (error) {
    console.error('Error al responder saludo con OpenAI:', error);
    return '¡Hola! 👋 ¿Cuál es tu código de estudiante?';
  }
}

/**
 * Generar respuesta conversacional durante el proceso
 *
 * @param mensajeUsuario - Mensaje del usuario
 * @param pasoActual - En qué paso del proceso está
 * @param contexto - Información adicional
 * @returns Respuesta natural generada
 */
export async function generarRespuestaContextual(
  mensajeUsuario: string,
  pasoActual: string,
  contexto?: any
): Promise<string> {
  try {
    let instruccion = '';

    switch (pasoActual) {
      case 'waiting_area':
        instruccion = `El usuario debe seleccionar un área. Áreas disponibles: ${contexto.areas}
Genera una respuesta amigable explicando que debe elegir el número del área que corresponda a su problema.`;
        break;

      case 'waiting_description':
        instruccion = `El usuario debe describir su problema en el área: ${contexto.areaNombre}
Genera una respuesta amigable solicitando que describa el problema con detalle (qué pasó, cuándo, si es urgente).`;
        break;

      case 'waiting_location':
        instruccion = `El usuario debe indicar la ubicación del problema.
Genera una respuesta amigable solicitando la ubicación específica (pabellón, salón, o lugar del campus).`;
        break;

      default:
        instruccion = 'Genera una respuesta amigable y útil.';
    }

    const prompt = `Usuario escribió: "${mensajeUsuario}"

Contexto: ${instruccion}

Genera una respuesta breve (2-3 líneas) que sea:
- Natural y conversacional
- Amigable pero profesional
- Clara sobre lo que necesitas del usuario

Respuesta:`;

    const response = await openai.chat.completions.create({
      model: MODELS.default,
      messages: [
        {
          role: 'system',
          content: chatbotConfig.sistemPrompts.rol + '\n' + chatbotConfig.sistemPrompts.tono
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 120
    });

    return response.choices[0].message.content?.trim() || 'Por favor, continúa con la información solicitada.';
  } catch (error) {
    console.error('Error al generar respuesta contextual:', error);
    return 'Por favor, continúa proporcionando la información solicitada.';
  }
}

/**
 * Validar y mejorar la descripción del problema
 *
 * @param descripcion - Descripción original
 * @returns Descripción mejorada
 */
export async function mejorarDescripcion(descripcion: string): Promise<string> {
  try {
    const prompt = `Mejora la siguiente descripción de un reporte universitario.

DESCRIPCIÓN ORIGINAL:
"${descripcion}"

INSTRUCCIONES:
1. Corrígela si tiene errores ortográficos
2. Hazla más clara y específica
3. Mantén el significado original
4. Máximo 2-3 oraciones
5. Usa lenguaje profesional pero amigable

Descripción mejorada:`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que mejora descripciones de reportes manteniendo su esencia.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 150
    });

    return response.choices[0].message.content?.trim() || descripcion;
  } catch (error) {
    console.error('Error al mejorar descripción con OpenAI:', error);
    return descripcion;
  }
}

/**
 * Sugerir ubicación basándose en el contexto
 *
 * @param mensaje - Mensaje completo del estudiante
 * @returns Ubicación sugerida o null
 */
export async function sugerirUbicacion(mensaje: string): Promise<string | null> {
  try {
    const prompt = `Extrae SOLO la ubicación mencionada en este mensaje.

MENSAJE:
"${mensaje}"

INSTRUCCIONES:
- Si menciona pabellón y salón, extráelo en formato: "Pabellón X - Salón Y"
- Si solo menciona pabellón, devuelve: "Pabellón X"
- Si no menciona ubicación, responde: "null"
- No inventes información

Ubicación:`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 30
    });

    const ubicacion = response.choices[0].message.content?.trim();

    if (ubicacion === 'null' || !ubicacion) {
      return null;
    }

    return ubicacion;
  } catch (error) {
    console.error('Error al sugerir ubicación con OpenAI:', error);
    return null;
  }
}

/**
 * Detectar si el mensaje es urgente
 *
 * @param mensaje - Mensaje del estudiante
 * @returns true si es urgente, false si no
 */
export async function esUrgente(mensaje: string): Promise<boolean> {
  try {
    const prompt = `Determina si este reporte es URGENTE.

REPORTE:
"${mensaje}"

CRITERIOS DE URGENCIA:
- Riesgo de seguridad (incendio, gas, electricidad)
- Impide el desarrollo de clases
- Daño a personas o propiedad
- Emergencia médica

Responde SOLO: "urgente" o "no urgente"`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 10
    });

    const resultado = response.choices[0].message.content?.toLowerCase();
    return resultado?.includes('urgente') || false;
  } catch (error) {
    console.error('Error al detectar urgencia con OpenAI:', error);
    return false;
  }
}

/**
 * Generar resumen del reporte
 *
 * @param reporte - Datos completos del reporte
 * @returns Resumen corto
 */
export async function generarResumen(reporte: {
  descripcion: string;
  ubicacion: string;
  area: string;
}): Promise<string> {
  try {
    const prompt = `Resume este reporte en UNA línea corta (máximo 10 palabras).

REPORTE:
Área: ${reporte.area}
Ubicación: ${reporte.ubicacion}
Descripción: ${reporte.descripcion}

Resumen de 10 palabras:`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 30
    });

    return response.choices[0].message.content?.trim() || 'Reporte de problema';
  } catch (error) {
    console.error('Error al generar resumen con OpenAI:', error);
    return 'Reporte de problema';
  }
}

/**
 * Detectar área automáticamente basándose en palabras clave del problema
 * y los campos personalizados de cada área
 *
 * @param mensajeProblema - Descripción del problema del usuario
 * @param areas - Lista de áreas disponibles
 * @param areasConCampos - Mapa de campos personalizados por área (opcional)
 * @returns Área detectada o null
 */
export async function detectarAreaPorPalabrasClave(
  mensajeProblema: string,
  areas: Area[],
  areasConCampos?: Map<number, AreaField[]>
): Promise<{ area: Area; confianza: number } | null> {
  try {
    // Preparar información de áreas para el prompt, incluyendo campos personalizados
    const areasInfo = areas.map((a, i) => {
      let info = `${i}. ${a.name}: ${a.description || 'Sin descripción'}`;

      // Si hay campos personalizados para esta área, incluirlos
      if (areasConCampos && areasConCampos.has(a.id)) {
        const campos = areasConCampos.get(a.id)!;
        // Solo incluir campos tipo SELECT con opciones
        const camposSelect = campos.filter(c => c.field_type === 'select' && c.options);

        if (camposSelect.length > 0) {
          info += '\n   Campos SELECT con opciones:';
          camposSelect.forEach(campo => {
            info += `\n   - ${campo.field_label}`;

            // Incluir opciones del select
            try {
              const options = typeof campo.options === 'string'
                ? JSON.parse(campo.options)
                : campo.options;

              if (Array.isArray(options) && options.length > 0) {
                // Filtrar "default" y opciones vacías
                const validOptions = options.filter(opt =>
                  opt &&
                  opt !== 'default' &&
                  opt.trim() !== ''
                );

                if (validOptions.length > 0) {
                  info += ` → OPCIONES: ${validOptions.join(', ')}`;
                }
              }
            } catch (e) {
              // Si hay error al parsear, continuar sin opciones
            }
          });
        }
      }

      return info;
    }).join('\n\n');

    const prompt = `El usuario reportó este problema:
"${mensajeProblema}"

Áreas disponibles con sus campos de formulario:
${areasInfo}

IMPORTANTE - PRIORIDAD DE DETECCIÓN:
1. **PRIORIDAD MÁXIMA**: Busca coincidencias con las OPCIONES de campos tipo SELECT
   - Si encuentras una palabra del problema que coincida EXACTAMENTE con una opción de un campo select, ESA es el área correcta
   - Ejemplo: Si el usuario dice "cable HDMI" y existe un select con opción "cable HDMI", usa ESA área

2. **PRIORIDAD MEDIA**: La descripción del área

3. **PRIORIDAD BAJA**: Los placeholders (son solo ejemplos, NO son criterios de detección)

REGLAS ESTRICTAS:
- Las opciones de campos SELECT tienen PRIORIDAD ABSOLUTA sobre cualquier placeholder
- Si una palabra del problema coincide con una opción de select, ignora los placeholders de otras áreas
- Los placeholders solo son informativos, NO los uses para detectar el área
- Busca coincidencias parciales: si el usuario dice "hdmi" y hay opción "cable HDMI", es una coincidencia

Ejemplos:
- Usuario: "cable hdmi" → Área con select que tiene opción "cable HDMI" (confianza: 95%)
- Usuario: "proyector" → Área con select que tiene opción "proyector" (confianza: 95%)
- NO uses placeholders para decidir, solo las opciones de SELECT

Responde en formato JSON:
{
  "areaIndex": número del área (0, 1, 2, etc.),
  "confianza": porcentaje de confianza (0-100),
  "razon": "explicación mencionando QUÉ OPCIÓN de QUÉ CAMPO SELECT coincidió"
}

Si no estás seguro (confianza < 70%), usa areaIndex: -1`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en clasificar problemas universitarios en áreas específicas. Presta especial atención a los campos del formulario de cada área, ya que indican qué tipo de problemas maneja esa área.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const resultado = JSON.parse(response.choices[0].message.content || '{}');

    if (resultado.areaIndex >= 0 && resultado.areaIndex < areas.length && resultado.confianza >= 70) {
      console.log('🤖 IA detectó área:', areas[resultado.areaIndex].name, `(${resultado.confianza}% confianza)`);
      console.log('📝 Razón:', resultado.razon);

      return {
        area: areas[resultado.areaIndex],
        confianza: resultado.confianza
      };
    }

    return null;
  } catch (error) {
    console.error('Error al detectar área:', error);
    return null;
  }
}

/**
 * Extraer información completa del problema para el formulario
 *
 * @param mensajeProblema - Descripción del problema
 * @param area - Área detectada
 * @returns Información estructurada para el formulario
 */
export async function extraerInformacionCompleta(
  mensajeProblema: string,
  area: Area
): Promise<{
  descripcion: string;
  ubicacion: string | null;
  urgencia: 'baja' | 'media' | 'alta';
  detallesAdicionales: any;
}> {
  try {
    const prompt = `El usuario reportó este problema en el área "${area.name}":
"${mensajeProblema}"

Extrae la siguiente información en formato JSON:
{
  "descripcion": "descripción clara y mejorada del problema",
  "ubicacion": "pabellón/salón específico o null si no se menciona",
  "urgencia": "baja/media/alta según la gravedad",
  "detallesAdicionales": {
    "palabrasClave": ["palabra1", "palabra2"],
    "tipoProblema": "categoría del problema",
    "requiereAtencionInmediata": true/false
  }
}`;

    const response = await openai.chat.completions.create({
      model: MODELS.fast,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const resultado = JSON.parse(response.choices[0].message.content || '{}');

    return {
      descripcion: resultado.descripcion || mensajeProblema,
      ubicacion: resultado.ubicacion || null,
      urgencia: resultado.urgencia || 'media',
      detallesAdicionales: resultado.detallesAdicionales || {}
    };
  } catch (error) {
    console.error('Error al extraer información completa:', error);
    return {
      descripcion: mensajeProblema,
      ubicacion: null,
      urgencia: 'media',
      detallesAdicionales: {}
    };
  }
}

/**
 * Obtener costos estimados de uso
 */
export function obtenerCostosEstimados() {
  return {
    'gpt-3.5-turbo': {
      input: '$0.0005 / 1K tokens',
      output: '$0.0015 / 1K tokens',
      promedio: '~$0.001 por conversación'
    },
    'gpt-4-turbo': {
      input: '$0.01 / 1K tokens',
      output: '$0.03 / 1K tokens',
      promedio: '~$0.02 por conversación'
    }
  };
}
