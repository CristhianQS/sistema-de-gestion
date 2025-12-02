import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Area, DataAlumno } from '../types';
import { chatbotConfig, getMensaje } from '../config/chatbotPrompts';
import * as OpenAIService from '../services/openai.service';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  step: 'greeting' | 'waiting_code' | 'waiting_problem' | 'waiting_area' | 'waiting_description' | 'waiting_location' | 'waiting_confirmation' | 'completed';
  alumno: DataAlumno | null;
  selectedArea: Area | null;
  description: string;
  location: string;
  problemaDetectado?: any;
}

const ChatbotAsistente: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    step: 'greeting',
    alumno: null,
    selectedArea: null,
    description: '',
    location: ''
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAreas();
    // Verificar si OpenAI está configurado
    setAiEnabled(OpenAIService.isOpenAIEnabled());
  }, []);

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
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error al cargar áreas:', error);
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

      const { data, error } = await supabase
        .from('data_alumnos')
        .select('*')
        .eq('codigo', codigoNumero)
        .single();

      if (error) {
        console.error('Error al buscar alumno:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const crearReporte = async () => {
    const { alumno, selectedArea, description, location, problemaDetectado } = conversationState;

    if (!alumno || !selectedArea) {
      addBotMessage('Error: Faltan datos para crear el reporte.');
      return;
    }

    try {
      const reporteData = {
        area_id: selectedArea.id,
        alumno_id: alumno.id,
        alumno_dni: alumno.dni || '',
        alumno_codigo: alumno.codigo || 0,
        alumno_nombre: alumno.estudiante || '',
        form_data: {
          descripcion: description,
          ubicacion: location,
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
            deteccion_automatica: !!problemaDetectado
          }
        },
        status: 'pending',
        created_by: 'ia_chatbot'
      };

      const { data, error } = await supabase
        .from('area_submissions')
        .insert([reporteData])
        .select()
        .single();

      if (error) throw error;

      addBotMessage(chatbotConfig.confirmaciones.reporteCreado(data.id, selectedArea.name));

      // Resetear conversación
      setConversationState({
        step: 'waiting_code',
        alumno: null,
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
      addBotMessage('¡Hola! 😊 Para poder ayudarte, necesito que me proporciones tu código de estudiante.');
      return;
    }

    // Es un código numérico - procesarlo
    setIsTyping(true);
    const alumno = await buscarAlumnoPorCodigo(mensaje);
    setIsTyping(false);

    if (!alumno) {
      if (aiEnabled) {
        addBotMessage(`No encontré el código ${mensaje}. ¿Podrías verificarlo?`);
      } else {
        addBotMessage(chatbotConfig.mensajes.codigoNoEncontrado);
      }
      return;
    }

    // Cambiar al paso de esperar problema
    setConversationState({
      ...conversationState,
      step: 'waiting_problem',
      alumno
    });

    // Saludo corto y pregunta directa
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
      // Detectar área por palabras clave
      const areaDetectada = await OpenAIService.detectarAreaPorPalabrasClave(problema, areas);

      if (areaDetectada) {
        // Extraer información completa
        const informacion = await OpenAIService.extraerInformacionCompleta(problema, areaDetectada.area);

        setIsTyping(false);

        setConversationState({
          ...conversationState,
          step: 'waiting_confirmation',
          selectedArea: areaDetectada.area,
          description: informacion.descripcion,
          location: informacion.ubicacion || '',
          problemaDetectado: {
            ...informacion,
            confianza: areaDetectada.confianza,
            mensajeOriginal: problema
          }
        });

        // Mostrar resumen y pedir confirmación
        let mensaje = `Entiendo. Detecto que es un problema de **${areaDetectada.area.name}**.\n\n`;
        mensaje += `📝 **Descripción:** ${informacion.descripcion}\n`;

        if (informacion.ubicacion) {
          mensaje += `📍 **Ubicación:** ${informacion.ubicacion}\n`;
        } else {
          mensaje += `📍 **Ubicación:** No especificada\n`;
        }

        mensaje += `⚡ **Urgencia:** ${informacion.urgencia.toUpperCase()}\n\n`;
        mensaje += `¿Es correcta esta información? Responde:\n`;
        mensaje += `• "Sí" para registrar el reporte\n`;
        mensaje += `• "No" para corregir algo`;

        addBotMessage(mensaje);
      } else {
        // No se pudo detectar con confianza
        setIsTyping(false);

        setConversationState({
          ...conversationState,
          step: 'waiting_area',
          description: problema
        });

        const areasTexto = areas.map((area, index) =>
          `${index + 1}. ${area.name}`
        ).join('\n');

        addBotMessage(`Entiendo tu problema, pero necesito que me ayudes seleccionando el área correcta:\n\n${areasTexto}\n\nEscribe el número del área.`);
      }
    } catch (error) {
      console.error('Error al detectar área:', error);
      setIsTyping(false);

      // Fallback: mostrar lista de áreas
      setConversationState({
        ...conversationState,
        step: 'waiting_area',
        description: problema
      });

      const areasTexto = areas.map((area, index) =>
        `${index + 1}. ${area.name}`
      ).join('\n');

      addBotMessage(`Entiendo. ¿En qué área necesitas ayuda?\n\n${areasTexto}\n\nEscribe el número del área.`);
    }
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
        problemaDetectado: undefined
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

    setConversationState({
      ...conversationState,
      step: 'waiting_description',
      selectedArea: areaSeleccionada
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

        // Si no encontró ubicación, solicitarla
        setConversationState({
          ...conversationState,
          step: 'waiting_location',
          description: descripcionMejorada || descripcion
        });

        addBotMessage(chatbotConfig.solicitudes.ubicacion);
      } catch (error) {
        console.error('Error con OpenAI:', error);
        setIsTyping(false);
        // Continuar con flujo normal
        setConversationState({
          ...conversationState,
          step: 'waiting_location',
          description: descripcion
        });

        addBotMessage(chatbotConfig.solicitudes.ubicacion);
      }
    } else {
      // Flujo sin IA
      setConversationState({
        ...conversationState,
        step: 'waiting_location',
        description: descripcion
      });

      addBotMessage(chatbotConfig.solicitudes.ubicacion);
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
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
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
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
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

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
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
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotAsistente;
