/**
 * Configuración de Prompts del Chatbot
 *
 * Este archivo contiene todos los mensajes y prompts que el chatbot usa.
 * Puedes modificar estos textos para personalizar el comportamiento del asistente.
 */

export interface ChatbotConfig {
  // Mensajes de bienvenida y estado
  mensajes: {
    bienvenida: string;
    esperandoCodigo: string;
    codigoInvalido: string;
    codigoNoEncontrado: string;
    saludoAlumno: (nombre: string) => string;
    listaAreas: (areas: string) => string;
  };

  // Mensajes de solicitud de información
  solicitudes: {
    seleccionArea: string;
    areaInvalida: (max: number) => string;
    descripcionProblema: (areaNombre: string) => string;
    descripcionMuyCorta: string;
    ubicacion: string;
    ubicacionInvalida: string;
  };

  // Mensajes de confirmación y éxito
  confirmaciones: {
    creandoReporte: string;
    reporteCreado: (ticketId: number, areaNombre: string) => string;
    errorCrearReporte: (error: string) => string;
  };

  // Configuración de validación
  validacion: {
    longitudMinimaDescripcion: number;
    longitudMinimaUbicacion: number;
    permitirSoloNumerosCodigo: boolean;
  };

  // Instrucciones del sistema (para IA futura)
  sistemPrompts: {
    rol: string;
    objetivo: string;
    tono: string;
    restricciones: string[];
  };
}

export const chatbotConfig: ChatbotConfig = {
  // =====================================================
  // MENSAJES DE BIENVENIDA Y ESTADO
  // =====================================================
  mensajes: {
    bienvenida: `¡Bienvenido al chatbot de asuntos académicos! 👋

Por favor, ingresa tu código de estudiante para comenzar.`,

    esperandoCodigo: 'Por favor, ingresa tu código de estudiante.',

    codigoInvalido: '❌ Por favor, ingresa solo números para el código de estudiante.',

    codigoNoEncontrado: `❌ No encontré tu código de estudiante.

Por favor, verifica que sea correcto e intenta nuevamente.

Si el problema persiste, contacta con la oficina de registro.`,

    saludoAlumno: (nombre: string) => `¡Hola ${nombre}! 👋

¿En qué puedo ayudarte hoy?`,

    listaAreas: (areas: string) => `Tenemos las siguientes áreas disponibles:

${areas}

Por favor, escribe el número del área donde necesitas reportar un problema.`
  },

  // =====================================================
  // SOLICITUDES DE INFORMACIÓN
  // =====================================================
  solicitudes: {
    seleccionArea: 'Selecciona el número del área (1, 2, 3, etc.)',

    areaInvalida: (max: number) => `❌ Por favor, ingresa un número válido entre 1 y ${max}.`,

    descripcionProblema: (areaNombre: string) => `Perfecto, has seleccionado: **${areaNombre}**

Ahora, por favor describe el problema con el mayor detalle posible:

• ¿Qué está sucediendo?
• ¿Cuándo ocurrió?
• ¿Es urgente?

Entre más detalles proporciones, mejor podremos ayudarte.`,

    descripcionMuyCorta: `❌ La descripción es muy breve.

Por favor, proporciona más detalles sobre el problema (mínimo 10 caracteres).`,

    ubicacion: `Gracias por la descripción detallada.

Ahora necesito saber la ubicación exacta del problema:

• Pabellón y número de salón (ejemplo: B-201)
• O cualquier otra ubicación específica del campus

Esto nos ayudará a atender tu reporte más rápidamente.`,

    ubicacionInvalida: '❌ Por favor, proporciona una ubicación válida (mínimo 3 caracteres).'
  },

  // =====================================================
  // CONFIRMACIONES Y RESULTADOS
  // =====================================================
  confirmaciones: {
    creandoReporte: `Perfecto, tengo toda la información necesaria.

Estoy creando tu reporte... ⏳`,

    reporteCreado: (ticketId: number, areaNombre: string) => `✅ ¡Tu reporte ha sido registrado exitosamente!

📋 **Detalles del Reporte:**
• **Número de Ticket:** #${ticketId}
• **Área:** ${areaNombre}
• **Estado:** Pendiente

🔔 Recibirás una notificación cuando tu reporte sea atendido.

🤖 *Este reporte fue creado por el asistente automático.*

---

¿Necesitas crear otro reporte?
Escribe tu código de estudiante nuevamente para comenzar.`,

    errorCrearReporte: (error: string) => `❌ Lo siento, ocurrió un error al crear el reporte:

${error}

Por favor, intenta nuevamente o contacta con soporte técnico si el problema persiste.`
  },

  // =====================================================
  // CONFIGURACIÓN DE VALIDACIÓN
  // =====================================================
  validacion: {
    longitudMinimaDescripcion: 10,
    longitudMinimaUbicacion: 3,
    permitirSoloNumerosCodigo: true
  },

  // =====================================================
  // PROMPTS DEL SISTEMA (Para IA Futura - OpenAI)
  // =====================================================
  sistemPrompts: {
    rol: `Eres un asistente virtual de una universidad peruana llamado "Asistente UPEU".
Tu función es ayudar a los estudiantes a crear reportes de problemas académicos o de infraestructura.`,

    objetivo: `Tu objetivo es:
1. Recopilar información del estudiante de manera amigable
2. Ayudarles a crear reportes claros y completos
3. Proporcionar confirmación y número de seguimiento
4. Ser empático y profesional en todo momento`,

    tono: `Mantén un tono:
• Amigable pero profesional
• Claro y conciso
• Empático con las preocupaciones del estudiante
• Positivo y orientado a soluciones`,

    restricciones: [
      'No proporciones información personal de otros estudiantes',
      'No prometas tiempos de resolución específicos',
      'No tomes decisiones administrativas',
      'Deriva a personal humano si el problema es muy complejo',
      'Siempre valida la información del estudiante',
      'No uses lenguaje informal o jerga excesiva'
    ]
  }
};

/**
 * Función helper para obtener un mensaje configurado
 */
export function getMensaje(clave: string, ...args: any[]): string {
  const path = clave.split('.');
  let valor: any = chatbotConfig;

  for (const key of path) {
    valor = valor[key];
    if (valor === undefined) {
      console.error(`Mensaje no encontrado: ${clave}`);
      return `[Mensaje no configurado: ${clave}]`;
    }
  }

  if (typeof valor === 'function') {
    return valor(...args);
  }

  return valor;
}

/**
 * Función para actualizar la configuración en tiempo real
 * (útil para futura integración con panel de admin)
 */
export function actualizarConfig(nuevaConfig: Partial<ChatbotConfig>): void {
  Object.assign(chatbotConfig, nuevaConfig);
}
