import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { ArrowLeft, MessageCircle, Paperclip, RefreshCw } from 'lucide-react';
import { Alert, Button, PageHeader, Spinner } from '../../../components/ui';
import {
  getWhatsappEventos,
  WhatsappTableMissingError,
  type WhatsappEvento,
} from '../../../services/database/whatsapp.service';

interface Conversacion {
  telefono: string;
  nombre: string | null;
  identificado: WhatsappEvento['identificado'];
  mensajes: WhatsappEvento[]; // del más antiguo al más reciente
  ultimo: WhatsappEvento;
}

const BOT_STATUS: Record<string, { label: string; dot: string }> = {
  'status.ready': { label: 'Bot en línea', dot: 'bg-emerald-500' },
  'status.online': { label: 'Bot en línea', dot: 'bg-emerald-500' },
  'status.require_action': { label: 'Bot espera escanear el QR', dot: 'bg-amber-500' },
  'status.disconnect': { label: 'Bot desconectado', dot: 'bg-red-500' },
};

const timeFmt = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' });

function cuando(iso: string) {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? timeFmt.format(d) : dateFmt.format(d);
}

function agrupar(eventos: WhatsappEvento[]): Conversacion[] {
  const porTelefono = new Map<string, WhatsappEvento[]>();
  for (const e of eventos) {
    if (!e.event_name.startsWith('message.') || !e.telefono) continue;
    const lista = porTelefono.get(e.telefono);
    if (lista) lista.push(e);
    else porTelefono.set(e.telefono, [e]);
  }
  // `eventos` viene del más reciente al más antiguo
  return [...porTelefono.entries()].map(([telefono, lista]) => ({
    telefono,
    nombre:
      lista.find((m) => m.identificado)?.identificado?.nombre ??
      lista.find((m) => m.event_name === 'message.incoming' && m.nombre)?.nombre ??
      null,
    identificado: lista.find((m) => m.identificado)?.identificado ?? null,
    ultimo: lista[0],
    mensajes: [...lista].reverse(),
  }));
}

const iniciales = (nombre: string | null, telefono: string) =>
  (nombre ?? telefono)
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

/** Docentes en ámbar (prioridad), igual que en Reportes */
function TipoChip({ id }: { id: WhatsappEvento['identificado'] }) {
  if (!id) return null;
  return id.tipo === 'docente' ? (
    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Docente</span>
  ) : (
    <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">Alumno</span>
  );
}

const MensajesWhatsApp: React.FC = () => {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['whatsapp-eventos'],
    queryFn: () => getWhatsappEventos(),
    refetchInterval: 30_000, // respaldo si Realtime no está activo
  });

  // En vivo: cada evento nuevo de WhatsApp recarga la lista
  const queryClient = useQueryClient();
  useEffect(() => {
    const canal = supabase
      .channel('whatsapp-eventos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'whatsapp_eventos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['whatsapp-eventos'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  const conversaciones = useMemo(() => agrupar(data ?? []), [data]);
  const estadoBot = useMemo(() => data?.find((e) => e.event_name.startsWith('status.')), [data]);
  const activa = conversaciones.find((c) => c.telefono === seleccion) ?? null;
  const status = estadoBot ? BOT_STATUS[estadoBot.event_name] : null;

  const header = (
    <PageHeader
      title="WhatsApp"
      description="Mensajes que llegan al bot de BuilderBot, en tiempo real."
      actions={
        <>
          {status && (
            <span className="glass-light inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              {status.label} · {cuando(estadoBot!.recibido_at)}
            </span>
          )}
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </>
      }
    />
  );

  if (isLoading) return <>{header}<Spinner /></>;

  if (error) {
    return (
      <>
        {header}
        <Alert tone="error">
          {error instanceof WhatsappTableMissingError
            ? 'Falta crear la tabla whatsapp_eventos en Supabase. Ejecuta supabase/migrations/20261106_whatsapp_eventos.sql en el SQL Editor.'
            : 'No se pudieron cargar los mensajes. Intenta de nuevo.'}
        </Alert>
      </>
    );
  }

  if (conversaciones.length === 0) {
    return (
      <>
        {header}
        <div className="glass-light flex flex-col items-center rounded-[28px] px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-white">
            <MessageCircle className="h-6 w-6" />
          </span>
          <p className="mt-4 font-medium text-slate-900">Aún no llegan mensajes</p>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Cuando alguien escriba al bot por WhatsApp aparecerá aquí. Verifica en BuilderBot que el webhook esté guardado
            y que el tiempo de espera sea mayor que 0.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversaciones */}
        <ul
          className={`glass-light max-h-[70vh] divide-y divide-slate-200/70 overflow-y-auto rounded-[28px] ${activa ? 'hidden lg:block' : ''}`}
        >
          {conversaciones.map((c) => (
            <li key={c.telefono}>
              <button
                onClick={() => setSeleccion(c.telefono)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/70 ${
                  c.telefono === seleccion ? 'bg-brand-50' : ''
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                  {iniciales(c.nombre, c.telefono)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium text-slate-900">{c.nombre ?? c.telefono}</span>
                      <TipoChip id={c.identificado} />
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{cuando(c.ultimo.recibido_at)}</span>
                  </span>
                  <span className="block truncate text-sm text-slate-600">{c.ultimo.mensaje || 'Archivo adjunto'}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Conversación seleccionada */}
        {activa ? (
          <section className="glass-light flex max-h-[70vh] flex-col overflow-hidden rounded-[28px]">
            <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-3">
              <button
                onClick={() => setSeleccion(null)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate font-semibold text-slate-900">
                  {activa.nombre ?? 'Sin nombre'}
                  <TipoChip id={activa.identificado} />
                </p>
                {activa.identificado?.detalle ? (
                  <p className="truncate text-xs text-slate-500">{activa.identificado.detalle}</p>
                ) : null}
                <a href={`https://wa.me/${activa.telefono}`} target="_blank" rel="noreferrer" className="text-xs text-brand-700 hover:underline">
                  +{activa.telefono} · abrir en WhatsApp
                </a>
              </div>
            </div>
            <ol className="flex-1 space-y-2 overflow-y-auto bg-slate-50/60 px-5 py-4">
              {activa.mensajes.map((m) => {
                const bot = m.event_name === 'message.outgoing';
                return (
                <li
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 shadow-sm ring-1 ${
                    bot ? 'ml-auto rounded-tr-md bg-brand-50 ring-brand-100' : 'rounded-tl-md bg-white ring-slate-200/70'
                  }`}
                >
                  {bot ? <p className="text-[11px] font-medium text-brand-700">Bot</p> : null}
                  {m.mensaje ? <p className="whitespace-pre-wrap text-sm text-slate-800">{m.mensaje}</p> : null}
                  {m.adjuntos.length > 0 ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Paperclip className="h-3.5 w-3.5" /> {m.adjuntos.length} adjunto(s)
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-right text-[11px] text-slate-400">
                    {dateFmt.format(new Date(m.recibido_at))} · {timeFmt.format(new Date(m.recibido_at))}
                  </p>
                </li>
                );
              })}
            </ol>
          </section>
        ) : (
          <div className="glass-light hidden items-center justify-center rounded-[28px] text-sm text-slate-500 lg:flex">
            Elige una conversación
          </div>
        )}
      </div>
    </>
  );
};

export default MensajesWhatsApp;
