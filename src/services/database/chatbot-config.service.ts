import { supabase } from '../../lib/supabase';
import type { ChatbotConfig } from '../../features/chatbot/config/chatbotPrompts';

/**
 * Servicio para gestionar la configuración del chatbot en la base de datos
 * Permite guardar y cargar la configuración de forma permanente
 */

const CONFIG_KEY = 'chatbot_main_config';

/**
 * Guardar configuración del chatbot en la base de datos
 */
export async function saveChatbotConfig(config: ChatbotConfig): Promise<void> {
  try {
    // Convertir funciones a strings para poder guardarlas
    const configToSave = {
      mensajes: {
        ...config.mensajes,
        // Guardar solo los valores que no son funciones
        bienvenida: config.mensajes.bienvenida,
        esperandoCodigo: config.mensajes.esperandoCodigo,
        codigoInvalido: config.mensajes.codigoInvalido,
        codigoNoEncontrado: config.mensajes.codigoNoEncontrado
      },
      solicitudes: {
        seleccionArea: config.solicitudes.seleccionArea,
        descripcionMuyCorta: config.solicitudes.descripcionMuyCorta,
        ubicacion: config.solicitudes.ubicacion,
        ubicacionInvalida: config.solicitudes.ubicacionInvalida
      },
      confirmaciones: {
        creandoReporte: config.confirmaciones.creandoReporte
      },
      validacion: config.validacion,
      sistemPrompts: config.sistemPrompts
    };

    // Verificar si ya existe una configuración
    const { data: existing } = await supabase
      .from('chatbot_config')
      .select('id')
      .eq('config_key', CONFIG_KEY)
      .single();

    if (existing) {
      // Actualizar configuración existente
      const { error } = await supabase
        .from('chatbot_config')
        .update({
          config_data: configToSave,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', CONFIG_KEY);

      if (error) throw error;
    } else {
      // Crear nueva configuración
      const { error } = await supabase
        .from('chatbot_config')
        .insert([
          {
            config_key: CONFIG_KEY,
            config_data: configToSave,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    }

    console.log('✅ Configuración del chatbot guardada exitosamente');
  } catch (error) {
    console.error('Error al guardar configuración del chatbot:', error);
    throw error;
  }
}

/**
 * Cargar configuración del chatbot desde la base de datos
 */
export async function loadChatbotConfig(): Promise<Partial<ChatbotConfig> | null> {
  try {
    const { data, error } = await supabase
      .from('chatbot_config')
      .select('config_data')
      .eq('config_key', CONFIG_KEY)
      .single();

    if (error) {
      // PGRST116 = No se encontró el registro
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No hay configuración guardada, usando valores por defecto');
        return null;
      }

      // 42P01 = La tabla no existe
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('⚠️ La tabla chatbot_config no existe. Ejecuta el script SQL en Supabase.');
        console.warn('📄 Archivo: sql/create_chatbot_config_table.sql');
        return null;
      }

      // Otro error
      console.warn('⚠️ Error al cargar configuración, usando valores por defecto:', error.message);
      return null;
    }

    console.log('✅ Configuración del chatbot cargada desde la base de datos');
    return data.config_data;
  } catch (error: any) {
    console.warn('⚠️ No se pudo cargar configuración personalizada, usando valores por defecto');
    return null;
  }
}

/**
 * Eliminar configuración guardada (restaurar a valores por defecto)
 */
export async function deleteChatbotConfig(): Promise<void> {
  try {
    const { error } = await supabase
      .from('chatbot_config')
      .delete()
      .eq('config_key', CONFIG_KEY);

    if (error) throw error;

    console.log('✅ Configuración del chatbot eliminada, usando valores por defecto');
  } catch (error) {
    console.error('Error al eliminar configuración del chatbot:', error);
    throw error;
  }
}
