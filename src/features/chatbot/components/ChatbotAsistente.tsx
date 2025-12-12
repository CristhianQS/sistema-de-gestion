import React, { useState, useEffect, useRef } from 'react';
import type { Area, DataAlumno, AreaField } from '../../../types';
import { chatbotConfig, actualizarConfig } from '../config/chatbotPrompts';
import * as OpenAIService from '../services/openai.service';
import { getAllAreasUnpaginated } from '../../../services/database/areas.service';
import { getAllPabellones, getSalonesByPabellon } from '../../../services/database/pabellones.service';
import { getStudentByCode } from '../../../services/database/students.service';
import { getDocenteByDni } from '../../../services/database/docentes.service';
import type { Docente } from '../../../services/database/docentes.service';
import { createSubmission } from '../../../services/database/submissions.service';
import { loadChatbotConfig } from '../../../services/database/chatbot-config.service';
import { getAllAreaFields } from '../../../services/database/area-fields.service';
import SupabaseImageUploader from '../../../components/SupabaseImageUploader';
import { supabase } from '../../../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  step: 'greeting' | 'waiting_code' | 'waiting_problem' | 'waiting_area' | 'waiting_pabellon' | 'waiting_salon' | 'waiting_description' | 'waiting_images' | 'waiting_location' | 'waiting_confirmation' | 'completed';
  alumno: DataAlumno | null;
  docente: Docente | null;
  isDocente: boolean;
  selectedArea: Area | null;
  description: string;
  location: string;
  selectedPabellon?: any;
  selectedSalon?: any;
  problemaDetectado?: any;
  imageFields?: any[];
  uploadedImages?: Record<string, string>;
}

const ChatbotAsistente: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 'greeting',
    alumno: null,
    docente: null,
    isDocente: false,
    selectedArea: null,
    description: '',
    location: ''
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [pabellones, setPabellones] = useState<any[]>([]);
  const [salones, setSalones] = useState<any[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [imageFields, setImageFields] = useState<any[]>([]);
  const [currentImageFieldIndex, setCurrentImageFieldIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAreas();
    loadPabellones();
    loadCustomConfig();
    // Verificar si OpenAI está configurado
    setAiEnabled(OpenAIService.isOpenAIEnabled());
  }, []);

  const loadCustomConfig = async () => {
    try {
      const configGuardada = await loadChatbotConfig();
      if (configGuardada) {
        // Merge con la configuración actual para preservar las funciones
        const configMerged = {
          ...chatbotConfig,
          mensajes: {
            ...chatbotConfig.mensajes,
            ...configGuardada.mensajes
          },
          solicitudes: {
            ...chatbotConfig.solicitudes,
            ...configGuardada.solicitudes
          },
          confirmaciones: {
            ...chatbotConfig.confirmaciones,
            ...configGuardada.confirmaciones
          },
          validacion: configGuardada.validacion || chatbotConfig.validacion,
          sistemPrompts: configGuardada.sistemPrompts || chatbotConfig.sistemPrompts
        };
        actualizarConfig(configMerged);
        console.log('✅ Chatbot usando configuración personalizada');
      }
    } catch (error) {
      console.error('Error al cargar configuración personalizada:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje de bienvenida más simple, esperando que el usuario salude primero
      addBotMessage('¡Hola! 👋 Bienvenido al Asistente Virtual de UPEU. ¿En qué puedo ayudarte hoy?');
    }
  }, [isOpen]);

  const loadAreas = async () => {
    try {
      const data = await getAllAreasUnpaginated();
      setAreas(data);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
    }
  };

  const loadPabellones = async () => {
    try {
      const data = await getAllPabellones();
      setPabellones(data);
    } catch (error) {
      console.error('Error al cargar pabellones:', error);
    }
  };


  const loadAreaFields = async (areaId: number) => {
    try {
      const { data, error } = await supabase
        .from('area_fields')
        .select('*')
        .eq('area_id', areaId)
        .eq('field_type', 'image')
        .order('order_index', { ascending: true });

      if (!error && data) {
        setImageFields(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error al cargar campos de imagen:', error);
      return [];
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: 'user' | 'bot', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = (content: string, delay = 500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage('bot', content);
    }, delay);
  };

  const buscarAlumnoPorCodigo = async (codigo: string): Promise<DataAlumno | null> => {
    try {
      const codigoNumero = parseInt(codigo);
      if (isNaN(codigoNumero)) {
        return null;
      }

      const alumno = await getStudentByCode(codigoNumero.toString());
      return alumno;
    } catch (error) {
      console.error('Error al buscar alumno:', error);
      return null;
    }
  };

  const crearReporte = async () => {
    const { alumno, docente, isDocente, selectedArea, description, location, problemaDetectado, selectedPabellon, selectedSalon } = conversationState;

    // Validar que tengamos datos suficientes
    if ((!alumno && !docente) || !selectedArea) {
      addBotMessage('Error: Faltan datos para crear el reporte.');
      return;
    }

    try {
      // Preparar datos según si es docente o estudiante
      const reporteData = {
        area_id: selectedArea.id,
        alumno_id: isDocente ? null : (alumno?.id || null),
        alumno_dni: isDocente ? (docente?.dni || '') : (alumno?.dni || ''),
        alumno_codigo: isDocente ? 0 : (alumno?.codigo || 0),
        alumno_nombre: isDocente ? `${docente?.nombres} ${docente?.apellidos}` : (alumno?.estudiante || ''),
        es_docente: isDocente,
        submitted_at: new Date().toISOString(),
        form_data: {
          descripcion: description,
          ubicacion: location,
          ...conversationState.uploadedImages,
          pabellon_id: selectedPabellon?.id,
          pabellon_nombre: selectedPabellon?.nombre,
          salon_id: selectedSalon?.id,
          salon_nombre: selectedSalon?.nombre,
          created_by: 'ia_chatbot',
          ia_metadata: {
            timestamp: new Date().toISOString(),
            confidence: problemaDetectado?.confianza || 100,
            model: aiEnabled ? 'gpt-4o-mini' : 'chatbot_rules',
            type: 'asistente_automatico',
            ia_enabled: aiEnabled,
            urgencia: problemaDetectado?.urgencia || 'media',
            detalles_adicionales: problemaDetectado?.detallesAdicionales || {},
            mensaje_original: problemaDetectado?.mensajeOriginal || description,
            deteccion_automatica: !!problemaDetectado,
            es_docente: isDocente
          }
        },
        status: 'pending' as const
      };

      const data = await createSubmission(reporteData);

      const tipoUsuario = isDocente ? 'docente' : 'estudiante';
      addBotMessage(
        `✅ ¡Reporte #${data.id} creado exitosamente!\n\n` +
        `📋 **Área:** ${selectedArea.name}\n` +
        `👤 **Tipo:** ${tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1)}\n\n` +
        `Gracias por tu reporte. Nuestro equipo lo atenderá pronto. 🚀`
      );

      // Resetear conversación
      setConversationState({
        step: 'waiting_code',
        alumno: null,
        docente: null,
        isDocente: false,
        selectedArea: null,
        description: '',
        location: ''
      });
    } catch (error: any) {
      console.error('Error al crear reporte:', error);
      addBotMessage(chatbotConfig.confirmaciones.errorCrearReporte(error.message));
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');

    // Procesar según el estado de la conversación
    switch (conversationState.step) {
      case 'greeting':
      case 'waiting_code':
        await handleCodigoEstudiante(userMessage);
        break;

      case 'waiting_problem':
        await handleProblema(userMessage);
        break;

      case 'waiting_pabellon':
        await handlePabellon(userMessage);
        break;

      case 'waiting_salon':
        await handleSalon(userMessage);
        break;

      case 'waiting_area':
        await handleSeleccionArea(userMessage);
        break;

      case 'waiting_description':
        await handleDescripcion(userMessage);
        break;

      case 'waiting_location':
        await handleUbicacion(userMessage);
        break;

      case 'waiting_confirmation':
        await handleConfirmacion(userMessage);
        break;

      default:
        addBotMessage(chatbotConfig.mensajes.esperandoCodigo);
        setConversationState({ ...conversationState, step: 'waiting_code' });
    }
  };

  const handleCodigoEstudiante = async (mensaje: string) => {
    // Si parece un saludo (no es un número), usar IA para responder
    if (!/^\d+$/.test(mensaje.trim())) {
      // Es un saludo o texto libre
      if (aiEnabled) {
        setIsTyping(true);
        try {
          const respuesta = await OpenAIService.responderSaludo(mensaje);
          setIsTyping(false);
          addBotMessage(respuesta);
          // Mantener en el mismo estado esperando el código
          return;
        } catch (error) {
          console.error('Error al responder saludo:', error);
          setIsTyping(false);
        }
      }

      // Si no hay IA o hubo error, usar mensaje estándar
      addBotMessage('¡Hola! 😊 Para poder ayudarte, necesito que me proporciones tu código de estudiante o DNI (si eres docente).');
      return;
    }

    // Es un código numérico - determinar si es DNI (8 dígitos) o código de estudiante
    const codigo = mensaje.trim();
    setIsTyping(true);

    // Si tiene 8 dígitos, intentar buscar como docente primero
    if (codigo.length === 8) {
      try {
        const docente = await getDocenteByDni(codigo);
        setIsTyping(false);

        if (docente) {
          // Es un docente
          setConversationState({
            ...conversationState,
            step: 'waiting_problem',
            docente,
            isDocente: true
          });

          addBotMessage(`¡Hola Docente ${docente.nombres} ${docente.apellidos}! 👨‍🏫 ¿En qué puedo ayudarte hoy?`);
          return;
        }
      } catch (error) {
        console.error('Error al buscar docente:', error);
      }
    }

    // Si no es docente o tiene más/menos de 8 dígitos, buscar como estudiante
    const alumno = await buscarAlumnoPorCodigo(codigo);
    setIsTyping(false);

    if (!alumno) {
      if (aiEnabled) {
        addBotMessage(`No encontré el código/DNI ${codigo}. ¿Podrías verificarlo?`);
      } else {
        addBotMessage('No encontré ese código de estudiante o DNI. Por favor, verifica e intenta nuevamente.');
      }
      return;
    }

    // Es un estudiante
    setConversationState({
      ...conversationState,
      step: 'waiting_problem',
      alumno,
      isDocente: false
    });

    addBotMessage(`¡Hola ${alumno.estudiante}! 😊 ¿Tienes algún inconveniente?`);
  };

  const handleProblema = async (problema: string) => {
    if (!aiEnabled) {
      // Si no hay IA, mostrar lista de áreas
      setConversationState({
        ...conversationState,
        step: 'waiting_area'
      });

      const areasTexto = areas.map((area, index) =>
        `${index + 1}. ${area.name}`
      ).join('\n');

      addBotMessage(`Entiendo. ¿En qué área necesitas ayuda?\n\n${areasTexto}\n\nEscribe el número del área.`);
      return;
    }

    // Usar IA para detectar el área automáticamente
    setIsTyping(true);
    addBotMessage('Déjame analizar tu problema... 🤔');

    try {
      // Cargar todos los campos de las áreas para ayudar a la detección
      let areaFieldsMap: Map<number, AreaField[]> | undefined;
      try {
        areaFieldsMap = await getAllAreaFields();

        // Expandir las opciones de campos SELECT que usan selection_options
        for (const [areaId, fields] of areaFieldsMap) {
          for (const field of fields) {
            if (field.field_type === 'select' && field.options) {
              // Verificar si NO es un JSON array (es un nombre de grupo)
              try {
                const parsed = JSON.parse(field.options);
                if (!Array.isArray(parsed)) {
                  // Es un string, no JSON, cargar opciones de selection_options
                  const { data: selectionOpts } = await supabase
                    .from('selection_options')
                    .select('option_value, option_label')
                    .eq('area_id', areaId)
                    .eq('group_name', field.options)
                    .order('order_index');

                  if (selectionOpts && selectionOpts.length > 0) {
                    // Reemplazar con JSON array de opciones
                    const optionsArray = selectionOpts.map(opt => opt.option_label);
                    field.options = JSON.stringify(optionsArray);
                  }
                }
              } catch (e) {
                // No es JSON, es un nombre de grupo, cargar opciones
                const { data: selectionOpts } = await supabase
                  .from('selection_options')
                  .select('option_value, option_label')
                  .eq('area_id', areaId)
                  .eq('group_name', field.options)
                  .order('order_index');

                if (selectionOpts && selectionOpts.length > 0) {
                  // Reemplazar con JSON array de opciones
                  const optionsArray = selectionOpts.map(opt => opt.option_label);
                  field.options = JSON.stringify(optionsArray);
                }
              }
            }
          }
        }

        console.log('✅ Campos de áreas cargados para detección:', areaFieldsMap.size, 'áreas');
      } catch (error) {
        console.warn('⚠️ No se pudieron cargar campos de áreas, usando solo descripción:', error);
        areaFieldsMap = undefined;
      }

      // Detectar área por palabras clave usando los campos personalizados
      const areaDetectada = await OpenAIService.detectarAreaPorPalabrasClave(problema, areas, areaFieldsMap);

      if (areaDetectada) {
        // Extraer información completa
        const informacion = await OpenAIService.extraerInformacionCompleta(problema, areaDetectada.area);

        // Cargar campos de imagen del área
        const camposImagen = await loadAreaFields(areaDetectada.area.id);

        setIsTyping(false);

        // Ahora pedir pabellón
        setConversationState({
          ...conversationState,
          step: 'waiting_pabellon',
          selectedArea: areaDetectada.area,
          description: informacion.descripcion,
          problemaDetectado: {
            ...informacion,
            confianza: areaDetectada.confianza,
            mensajeOriginal: problema
          },
          imageFields: camposImagen,
          uploadedImages: {}
        });

        // Mostrar pabellones disponibles
        const pabellonesTexto = pabellones.map((pab, index) =>
          `${index + 1}. ${pab.nombre}`
        ).join('\n');

        addBotMessage(
          `✅ Entiendo. Detecto que es un problema de **${areaDetectada.area.name}**.\n\n` +
          `📝 ${informacion.descripcion}\n\n` +
          `📍 Ahora, ¿en qué pabellón se encuentra el problema?\n\n` +
          `${pabellonesTexto}\n\n` +
          `💡 **Escribe el NÚMERO de tu opción** (ejemplo: "1" para ${pabellones[0].nombre})`
        );
      } else {
        // No se pudo detectar con confianza
        setIsTyping(false);

        // Reiniciar el estado
        setConversationState({
          ...conversationState,
          step: 'waiting_problem',
          description: ''
        });

        addBotMessage(
          `❌ Lo siento, no logro entender completamente tu inconveniente.\n\n` +
          `📞 Te recomiendo contactar directamente con nuestra **Mesa de Ayuda**:\n\n` +
          `📱 **WhatsApp:** 951292515\n\n` +
          `💡 También puedes intentar describirme tu problema de otra manera, mencionando:\n` +
          `   - El equipo o lugar específico (proyector, silla, salón, etc.)\n` +
          `   - Qué está fallando exactamente\n\n` +
          `¿Quieres intentarlo de nuevo o prefieres contactar a la Mesa de Ayuda?`
        );
      }
    } catch (error) {
      console.error('Error al detectar área:', error);
      setIsTyping(false);

      // Reiniciar el estado
      setConversationState({
        ...conversationState,
        step: 'waiting_problem',
        description: ''
      });

      addBotMessage(
        `❌ Lo siento, no logro entender completamente tu inconveniente.\n\n` +
        `📞 Te recomiendo contactar directamente con nuestra **Mesa de Ayuda**:\n\n` +
        `📱 **WhatsApp:** 951292515\n\n` +
        `💡 También puedes intentar describirme tu problema de otra manera, mencionando:\n` +
        `   - El equipo o lugar específico (proyector, silla, salón, etc.)\n` +
        `   - Qué está fallando exactamente\n\n` +
        `¿Quieres intentarlo de nuevo o prefieres contactar a la Mesa de Ayuda?`
      );
    }
  };

  const handlePabellon = async (respuesta: string) => {
    const numeroPabellon = parseInt(respuesta.trim());

    if (isNaN(numeroPabellon) || numeroPabellon < 1 || numeroPabellon > pabellones.length) {
      addBotMessage(
        `⚠️ Por favor, escribe el **NÚMERO** de la opción (del 1 al ${pabellones.length}).\n\n` +
        `❌ No escribas el nombre completo\n` +
        `✅ Solo el número: 1, 2, 3, etc.`
      );
      return;
    }

    const pabellonSeleccionado = pabellones[numeroPabellon - 1];

    // Cargar salones del pabellón
    setIsTyping(true);
    try {
      const salonesDelPabellon = await getSalonesByPabellon(pabellonSeleccionado.id);
      setSalones(salonesDelPabellon);

      setIsTyping(false);

      if (salonesDelPabellon.length === 0) {
        addBotMessage(
          `Pabellón **${pabellonSeleccionado.nombre}** seleccionado.\n\n` +
          `No hay salones registrados para este pabellón. Por favor, vuelve a intentarlo o contacta con soporte.`
        );
        return;
      }

      setConversationState({
        ...conversationState,
        step: 'waiting_salon',
        selectedPabellon: pabellonSeleccionado
      });

      // Mostrar salones disponibles
      const salonesTexto = salonesDelPabellon.map((salon, index) =>
        `${index + 1}. ${salon.nombre}`
      ).join('\n');

      addBotMessage(
        `✅ Perfecto, **${pabellonSeleccionado.nombre}**.\n\n` +
        `🚪 ¿En qué salón específicamente?\n\n${salonesTexto}\n\n` +
        `💡 **Escribe el NÚMERO** (ejemplo: "1" para ${salonesDelPabellon[0].nombre})`
      );
    } catch (error) {
      console.error('Error al cargar salones:', error);
      setIsTyping(false);
      addBotMessage('Ocurrió un error al cargar los salones. Por favor, intenta nuevamente.');
    }
  };

  const handleSalon = async (respuesta: string) => {
    const numeroSalon = parseInt(respuesta.trim());

    if (isNaN(numeroSalon) || numeroSalon < 1 || numeroSalon > salones.length) {
      addBotMessage(
        `⚠️ Por favor, escribe el **NÚMERO** del salón (del 1 al ${salones.length}).\n\n` +
        `❌ No escribas el nombre completo\n` +
        `✅ Solo el número: 1, 2, 3, etc.`
      );
      return;
    }

    const salonSeleccionado = salones[numeroSalon - 1];

    // Verificar si hay campos de imagen
    if (conversationState.imageFields && conversationState.imageFields.length > 0) {
      setConversationState({
        ...conversationState,
        step: 'waiting_images',
        selectedSalon: salonSeleccionado,
        location: `${conversationState.selectedPabellon?.nombre} - ${salonSeleccionado.nombre}`
      });

      // Resetear índice de campo actual
      setCurrentImageFieldIndex(0);

      const primerCampo = conversationState.imageFields[0];
      addBotMessage(
        `Salón **${salonSeleccionado.nombre}** seleccionado.\n\n` +
        `Por favor, sube una imagen para: **${primerCampo.field_label}**\n\n` +
        `${primerCampo.is_required ? '⚠️ Este campo es obligatorio' : 'Opcional: Puedes omitir este campo si no tienes una imagen'}`
      );
      return;
    }

    setConversationState({
      ...conversationState,
      step: 'waiting_confirmation',
      selectedSalon: salonSeleccionado,
      location: `${conversationState.selectedPabellon?.nombre} - ${salonSeleccionado.nombre}`
    });

    // Mostrar resumen completo y pedir confirmación
    const { selectedArea, description, selectedPabellon, problemaDetectado } = conversationState;

    let mensaje = `Perfecto, aquí está el resumen de tu reporte:\n\n`;
    mensaje += `🏢 **Área:** ${selectedArea?.name}\n`;
    mensaje += `📝 **Descripción:** ${description}\n`;
    mensaje += `📍 **Ubicación:** ${selectedPabellon?.nombre} - ${salonSeleccionado.nombre}\n`;
    mensaje += `⚡ **Urgencia:** ${problemaDetectado?.urgencia?.toUpperCase() || 'MEDIA'}\n\n`;
    mensaje += `¿Deseas registrar este reporte?\n`;
    mensaje += `• Responde "Sí" para confirmar\n`;
    mensaje += `• Responde "No" para cancelar`;

    addBotMessage(mensaje);
  };

  const handleConfirmacion = async (respuesta: string) => {
    const respuestaLower = respuesta.toLowerCase().trim();

    if (respuestaLower === 'si' || respuestaLower === 'sí' || respuestaLower === 'yes' || respuestaLower === 's') {
      // Confirmar y crear reporte
      addBotMessage('¡Perfecto! Registrando tu reporte... ⏳');

      setConversationState({
        ...conversationState,
        step: 'completed'
      });

      await crearReporte();
    } else if (respuestaLower === 'no' || respuestaLower === 'n') {
      // Reiniciar proceso
      setConversationState({
        ...conversationState,
        step: 'waiting_problem',
        selectedArea: null,
        description: '',
        location: '',
        problemaDetectado: undefined,
        uploadedImages: {}
      });

      addBotMessage('Entendido. Por favor, descríbeme nuevamente tu problema con más detalles.');
    } else {
      addBotMessage('Por favor, responde "Sí" para confirmar o "No" para corregir.');
    }
  };

  const handleSeleccionArea = async (respuesta: string) => {
    const numeroArea = parseInt(respuesta);

    if (isNaN(numeroArea) || numeroArea < 1 || numeroArea > areas.length) {
      if (aiEnabled) {
        addBotMessage(`Por favor, elige un número entre 1 y ${areas.length} de la lista de áreas. 😊`);
      } else {
        addBotMessage(chatbotConfig.solicitudes.areaInvalida(areas.length));
      }
      return;
    }

    const areaSeleccionada = areas[numeroArea - 1];

    // Cargar campos de imagen del área
    const camposImagen = await loadAreaFields(areaSeleccionada.id);

    setConversationState({
      ...conversationState,
      step: 'waiting_description',
      selectedArea: areaSeleccionada,
      imageFields: camposImagen,
      uploadedImages: {}
    });

    if (aiEnabled) {
      setIsTyping(true);
      try {
        const respuestaIA = await OpenAIService.generarRespuestaContextual(
          `Seleccioné el área ${areaSeleccionada.name}`,
          'waiting_description',
          { areaNombre: areaSeleccionada.name }
        );
        setIsTyping(false);
        addBotMessage(`Excelente elección: **${areaSeleccionada.name}** ✅\n\n${respuestaIA}`);
      } catch (error) {
        setIsTyping(false);
        addBotMessage(chatbotConfig.solicitudes.descripcionProblema(areaSeleccionada.name));
      }
    } else {
      addBotMessage(chatbotConfig.solicitudes.descripcionProblema(areaSeleccionada.name));
    }
  };

  const handleDescripcion = async (descripcion: string) => {
    if (descripcion.length < chatbotConfig.validacion.longitudMinimaDescripcion) {
      addBotMessage(chatbotConfig.solicitudes.descripcionMuyCorta);
      return;
    }

    // Si OpenAI está habilitado, intentar extraer ubicación automáticamente
    if (aiEnabled) {
      setIsTyping(true);
      try {
        const ubicacionSugerida = await OpenAIService.sugerirUbicacion(descripcion);
        const descripcionMejorada = await OpenAIService.mejorarDescripcion(descripcion);

        setIsTyping(false);

        // Si encontró ubicación en el mensaje, usarla directamente
        if (ubicacionSugerida) {
          setConversationState({
            ...conversationState,
            step: 'completed',
            description: descripcionMejorada || descripcion,
            location: ubicacionSugerida
          });

          addBotMessage(
            `Perfecto, tengo toda la información:\n\n` +
            `📝 Problema: ${descripcionMejorada || descripcion}\n` +
            `📍 Ubicación detectada: ${ubicacionSugerida}\n\n` +
            `Creando tu reporte...`
          );

          await crearReporte();
          return;
        }

        // Si no encontró ubicación, verificar si hay imágenes
        const hasImages = conversationState.imageFields && conversationState.imageFields.length > 0;

        if (hasImages) {
          setConversationState({
            ...conversationState,
            step: 'waiting_images',
            description: descripcionMejorada || descripcion
          });

          setCurrentImageFieldIndex(0);
          const primerCampo = conversationState.imageFields![0];
          addBotMessage(
            `Perfecto. Ahora, por favor sube una imagen para: **${primerCampo.field_label}**\n\n` +
            `${primerCampo.is_required ? '⚠️ Este campo es obligatorio' : 'Opcional: Puedes omitir este campo si no tienes una imagen'}`
          );
        } else {
          setConversationState({
            ...conversationState,
            step: 'waiting_location',
            description: descripcionMejorada || descripcion
          });

          addBotMessage(chatbotConfig.solicitudes.ubicacion);
        }
      } catch (error) {
        console.error('Error con OpenAI:', error);
        setIsTyping(false);
        // Continuar con flujo normal, verificar si hay imágenes
        const hasImages = conversationState.imageFields && conversationState.imageFields.length > 0;

        if (hasImages) {
          setConversationState({
            ...conversationState,
            step: 'waiting_images',
            description: descripcion
          });

          setCurrentImageFieldIndex(0);
          const primerCampo = conversationState.imageFields![0];
          addBotMessage(
            `Perfecto. Ahora, por favor sube una imagen para: **${primerCampo.field_label}**\n\n` +
            `${primerCampo.is_required ? '⚠️ Este campo es obligatorio' : 'Opcional: Puedes omitir este campo si no tienes una imagen'}`
          );
        } else {
          setConversationState({
            ...conversationState,
            step: 'waiting_location',
            description: descripcion
          });

          addBotMessage(chatbotConfig.solicitudes.ubicacion);
        }
      }
    } else {
      // Flujo sin IA, verificar si hay imágenes
      const hasImages = conversationState.imageFields && conversationState.imageFields.length > 0;

      if (hasImages) {
        setConversationState({
          ...conversationState,
          step: 'waiting_images',
          description: descripcion
        });

        setCurrentImageFieldIndex(0);
        const primerCampo = conversationState.imageFields![0];
        addBotMessage(
          `Perfecto. Ahora, por favor sube una imagen para: **${primerCampo.field_label}**\n\n` +
          `${primerCampo.is_required ? '⚠️ Este campo es obligatorio' : 'Opcional: Puedes omitir este campo si no tienes una imagen'}`
        );
      } else {
        setConversationState({
          ...conversationState,
          step: 'waiting_location',
          description: descripcion
        });

        addBotMessage(chatbotConfig.solicitudes.ubicacion);
      }
    }
  };

  const handleUbicacion = async (ubicacion: string) => {
    if (ubicacion.length < chatbotConfig.validacion.longitudMinimaUbicacion) {
      if (aiEnabled) {
        addBotMessage('Por favor, proporciona una ubicación más específica (pabellón, salón, o área del campus). 📍');
      } else {
        addBotMessage(chatbotConfig.solicitudes.ubicacionInvalida);
      }
      return;
    }

    setConversationState({
      ...conversationState,
      step: 'completed',
      location: ubicacion
    });

    if (aiEnabled) {
      addBotMessage(`¡Perfecto! Ya tengo toda la información. 📝\n\nEstoy registrando tu reporte ahora mismo... ⏳`);
    } else {
      addBotMessage(chatbotConfig.confirmaciones.creandoReporte);
    }

    // Crear el reporte
    await crearReporte();
  };

  const handleImageUpload = (url: string) => {
    if (!imageFields || imageFields.length === 0) return;

    const currentField = imageFields[currentImageFieldIndex];

    const newUploadedImages = {
      ...conversationState.uploadedImages,
      [currentField.field_name]: url
    };

    if (currentImageFieldIndex < imageFields.length - 1) {
      // Hay más campos de imagen
      setCurrentImageFieldIndex(currentImageFieldIndex + 1);
      const nextField = imageFields[currentImageFieldIndex + 1];

      setConversationState({
        ...conversationState,
        uploadedImages: newUploadedImages
      });

      addBotMessage(
        `✅ Imagen recibida.\n\n` +
        `Ahora sube una imagen para: **${nextField.field_label}**\n\n` +
        `${nextField.is_required ? '⚠️ Este campo es obligatorio' : 'Opcional: Puedes omitir este campo si no tienes una imagen'}`
      );
    } else {
      // Ya terminamos con las imágenes
      const { selectedSalon, selectedPabellon } = conversationState;

      // Si tenemos pabellón y salón, ir a confirmación
      // Si no, ir a solicitar ubicación
      if (selectedSalon && selectedPabellon) {
        setConversationState({
          ...conversationState,
          uploadedImages: newUploadedImages,
          step: 'waiting_confirmation'
        });

        const { selectedArea, description, problemaDetectado } = conversationState;

        let mensaje = `✅ Todas las imágenes recibidas.\n\nPerfecto, aquí está el resumen de tu reporte:\n\n`;
        mensaje += `🏢 **Área:** ${selectedArea?.name}\n`;
        mensaje += `📝 **Descripción:** ${description}\n`;
        mensaje += `📍 **Ubicación:** ${selectedPabellon.nombre} - ${selectedSalon.nombre}\n`;
        mensaje += `⚡ **Urgencia:** ${problemaDetectado?.urgencia?.toUpperCase() || 'MEDIA'}\n\n`;
        mensaje += `¿Deseas registrar este reporte?\n`;
        mensaje += `• Responde "Sí" para confirmar\n`;
        mensaje += `• Responde "No" para cancelar`;

        addBotMessage(mensaje);
      } else {
        setConversationState({
          ...conversationState,
          uploadedImages: newUploadedImages,
          step: 'waiting_location'
        });

        addBotMessage(
          `✅ Todas las imágenes recibidas.\n\n` +
          chatbotConfig.solicitudes.ubicacion
        );
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          title="Abrir chatbot"
        >
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 top-[5vh] z-50 w-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header verde delgado */}
          <div className="h-2 bg-gradient-to-r from-green-600 to-green-500"></div>

          {/* Encabezado */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Asistente Académico</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  En línea
                  {aiEnabled && (
                    <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      🤖 IA
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 rounded-lg rounded-tl-none shadow-md border border-gray-200 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input o Uploader */}
          <div className="p-4 bg-white border-t border-gray-200">
            {conversationState.step === 'waiting_images' && imageFields.length > 0 ? (
              <div className="space-y-2">
                <SupabaseImageUploader
                  currentImageUrl=""
                  onImageUploaded={handleImageUpload}
                  onImageRemoved={() => {}}
                  folder="chatbot-reportes"
                  label=""
                  required={imageFields[currentImageFieldIndex]?.is_required}
                  maxSizeMB={5}
                />
                {!imageFields[currentImageFieldIndex]?.is_required && (
                  <button
                    onClick={() => handleImageUpload('')}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
                  >
                    Omitir este campo
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotAsistente;
