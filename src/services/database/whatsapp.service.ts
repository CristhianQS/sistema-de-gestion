import { supabase } from '../../lib/supabase';

export interface WhatsappEvento {
  id: number;
  event_name: string;
  telefono: string | null;
  nombre: string | null;
  mensaje: string | null;
  adjuntos: unknown[];
  recibido_at: string;
  /** Alumno o docente reconocido por el receptor al recibir su código/DNI */
  identificado: { tipo: 'alumno' | 'docente'; nombre: string; detalle: string | null } | null;
}

export class WhatsappTableMissingError extends Error {}

/** Últimos eventos recibidos de BuilderBot (mensajes y estado del bot) */
export async function getWhatsappEventos(limit = 500): Promise<WhatsappEvento[]> {
  const { data, error } = await supabase
    .from('whatsapp_eventos')
    .select('id, event_name, telefono, nombre, mensaje, adjuntos, recibido_at, identificado:payload->identificado')
    .order('recibido_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') throw new WhatsappTableMissingError(error.message);
    throw error;
  }
  return (data ?? []) as unknown as WhatsappEvento[];
}
