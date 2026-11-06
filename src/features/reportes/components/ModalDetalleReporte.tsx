import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BriefcaseBusiness, Check, Clock, ExternalLink, GraduationCap, MapPin, MessageCircle, Sparkles, Star, X } from 'lucide-react';
import { getFieldsByAreaId } from '../../../services/database/area-fields.service';

type Status = 'pending' | 'in_progress' | 'resolved';

interface Reporte {
  id: number;
  area_id: number;
  alumno_dni: string;
  alumno_codigo: number;
  alumno_nombre: string;
  form_data: Record<string, unknown> | null;
  submitted_at: string;
  status: Status;
  area_nombre?: string;
  es_docente?: boolean;
  docente_dni?: string | null;
  docente_nombre?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reporte: Reporte;
  /** Sin esta función el modal es de solo lectura (no muestra «Cambiar estado») */
  onUpdateStatus?: (reporteId: number, newStatus: string, estimatedTime?: string) => Promise<void>;
  /** Abrir directamente eligiendo el tiempo para pasar a «En proceso» */
  startWithTimePicker?: boolean;
}

const STEPS: { status: Status; label: string }[] = [
  { status: 'pending', label: 'Recibido' },
  { status: 'in_progress', label: 'En proceso' },
  { status: 'resolved', label: 'Resuelto' },
];

const STATUS_PILL: Record<Status, string> = {
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  in_progress: 'bg-brand-50 text-brand-800 ring-brand-200',
  resolved: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

const TIME_OPTIONS = [
  { value: '30min', label: '30 min' },
  { value: '1h', label: '1 hora' },
  { value: '2h', label: '2 horas' },
  { value: '4h', label: '4 horas' },
  { value: '1d', label: '1 día' },
  { value: '2d', label: '2 días' },
  { value: '3d', label: '3 días' },
  { value: '1w', label: '1 semana' },
  { value: '2w', label: '2 semanas' },
];
const timeLabel = (v: string) => TIME_OPTIONS.find((o) => o.value === v)?.label ?? v;

/** Claves internas que no se muestran como «respuestas» */
const HIDDEN_KEYS = new Set([
  'descripcion', 'estimated_time', 'created_by', 'ia_metadata', 'ai_generated', 'ubicacion',
  // WhatsApp: datos internos del canal y la encuesta (se muestran como etiquetas)
  'canal', 'telefono', 'whatsapp_project_id', 'satisfaccion', 'satisfaccion_at',
]);
const isHidden = (key: string) =>
  HIDDEN_KEYS.has(key) || key.startsWith('pabellon_') || key.startsWith('salon_') || key.endsWith('_otros_text');

const IMAGE_RE = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i;
const isUrl = (v: unknown): v is string => typeof v === 'string' && /^https?:\/\//.test(v);
const looksLikeImage = (url: string, fieldType?: string) =>
  fieldType === 'image' || fieldType === 'file' || IMAGE_RE.test(url) || url.includes('/storage/v1/object/');

const humanize = (key: string) => {
  const s = key.replace(/_/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });

/** Pabellón y salón, del formato nuevo (campos sueltos) o del antiguo (`ubicacion`) */
function getUbicacion(fd: Record<string, unknown>) {
  const u = fd.ubicacion;
  const fromObj = u && typeof u === 'object' ? (u as Record<string, unknown>) : null;
  return {
    pabellon: (fd.pabellon_nombre ?? fromObj?.pabellon_nombre) as string | undefined,
    salon: (fd.salon_nombre ?? fromObj?.salon_nombre) as string | undefined,
    texto: typeof u === 'string' ? u : undefined,
  };
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value || <span className="font-normal text-slate-400">—</span>}</dd>
    </div>
  );
}

const ModalDetalleReporte: React.FC<Props> = ({ isOpen, onClose, reporte, onUpdateStatus, startWithTimePicker }) => {
  const [updating, setUpdating] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(!!startWithTimePicker);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  // Etiquetas reales de los campos del formulario del área
  const { data: fields } = useQuery({
    queryKey: ['area-fields', reporte.area_id],
    queryFn: () => getFieldsByAreaId(reporte.area_id),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const fd = useMemo(() => reporte.form_data ?? {}, [reporte.form_data]);

  const answers = useMemo(() => {
    const byName = new Map((fields ?? []).map((f) => [f.field_name, f]));
    return Object.entries(fd)
      .filter(([key, value]) => !isHidden(key) && value !== null && value !== '')
      .map(([key, value]) => {
        const field = byName.get(key);
        const otros = fd[`${key}_otros_text`];
        let text = typeof value === 'object' ? null : String(value);
        if (text === 'otros' && typeof otros === 'string' && otros) text = `Otros: ${otros}`;
        return {
          key,
          label: field ? capitalize(field.field_label) : humanize(key),
          url: isUrl(value) ? value : null,
          image: isUrl(value) && looksLikeImage(value, field?.field_type),
          text,
        };
      })
      .filter((a) => a.url || a.text);
  }, [fd, fields]);

  if (!isOpen) return null;

  const ubic = getUbicacion(fd);
  const descripcion = typeof fd.descripcion === 'string' ? fd.descripcion : '';
  const estimated = typeof fd.estimated_time === 'string' ? fd.estimated_time : '';
  const viaAsistente = fd.created_by === 'ia_chatbot' || fd.ai_generated === true;
  const viaWhatsApp = fd.canal === 'whatsapp';
  const telefono = typeof fd.telefono === 'string' ? fd.telefono : '';
  const satisfaccion = typeof fd.satisfaccion === 'number' ? fd.satisfaccion : null;
  const currentStep = STEPS.findIndex((s) => s.status === reporte.status);
  const nombre = reporte.es_docente && reporte.docente_nombre ? reporte.docente_nombre : reporte.alumno_nombre;
  const dni = reporte.es_docente && reporte.docente_dni ? reporte.docente_dni : reporte.alumno_dni;

  const changeStatus = async (status: Status, time?: string) => {
    if (!onUpdateStatus) return;
    setUpdating(true);
    setError('');
    try {
      await onUpdateStatus(reporte.id, status, time);
      setShowTimePicker(false);
      setSelectedTime('');
    } catch {
      setError('No se pudo cambiar el estado. Inténtalo de nuevo.');
    } finally {
      setUpdating(false);
    }
  };

  const images = answers.filter((a) => a.image);
  const others = answers.filter((a) => !a.image);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        onClick={(e) => e.stopPropagation()}
        className="glass-light flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] !bg-white/95 sm:rounded-[28px]"
      >
        {/* Encabezado */}
        <header className="flex items-start gap-4 border-b border-slate-200/70 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset ${STATUS_PILL[reporte.status]}`}>
                {STEPS[currentStep]?.label ?? reporte.status}
              </span>
              <span className="rounded-full bg-brand-900/5 px-2.5 py-0.5 font-medium text-brand-900">{reporte.area_nombre}</span>
              {reporte.es_docente ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-900">
                  <BriefcaseBusiness className="h-3.5 w-3.5" /> Docente · prioridad
                </span>
              ) : null}
              {viaAsistente ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                  <Sparkles className="h-3 w-3" /> Enviado con el asistente
                </span>
              ) : null}
              {viaWhatsApp ? (
                <a
                  href={telefono ? `https://wa.me/${telefono}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-800 hover:underline"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp{telefono ? ` · +${telefono}` : ''}
                </a>
              ) : null}
              {satisfaccion ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-amber-800" title="Calificación del usuario">
                  <Star className="h-3 w-3 fill-current" /> {satisfaccion}/5
                </span>
              ) : null}
              <span className="text-slate-400">#{reporte.id}</span>
            </div>
            <h2 id="detalle-titulo" className="mt-2 truncate font-display text-2xl font-bold tracking-tight text-slate-900">
              {nombre}
            </h2>
            <p className="text-sm text-slate-500">{capitalize(fullDate(reporte.submitted_at))}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Progreso */}
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => {
              const done = i <= currentStep;
              const current = i === currentStep;
              return (
                <li key={s.status}>
                  <div className={`h-1.5 rounded-full ${done ? 'bg-brand-900' : 'bg-slate-200'}`} />
                  <div className="mt-2 flex items-center gap-1.5 text-sm">
                    {done && !current ? <Check className="h-4 w-4 text-brand-900" /> : null}
                    <span className={current ? 'font-semibold text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'}>
                      {s.label}
                    </span>
                  </div>
                  {s.status === 'in_progress' && estimated && reporte.status === 'in_progress' ? (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> Estimado: {timeLabel(estimated)}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>

          {/* Descripción */}
          {descripcion ? (
            <section>
              <h3 className="text-xs font-medium text-slate-500">Descripción</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-800">{descripcion}</p>
            </section>
          ) : null}

          {/* Persona y ubicación */}
          <div className="grid gap-3 sm:grid-cols-2">
            <section className="rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                {reporte.es_docente ? <BriefcaseBusiness className="h-4 w-4 text-amber-700" /> : <GraduationCap className="h-4 w-4 text-brand-700" />} {reporte.es_docente ? 'Docente' : 'Estudiante'}
              </h3>
              <dl className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Nombre" value={nombre} />
                </div>
                <Field label="DNI" value={dni} />
                {!reporte.es_docente ? <Field label="Código" value={reporte.alumno_codigo} /> : null}
              </dl>
            </section>
            <section className="rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-brand-700" /> Ubicación
              </h3>
              {ubic.pabellon || ubic.salon ? (
                <dl className="grid grid-cols-2 gap-3">
                  <Field label="Pabellón" value={ubic.pabellon} />
                  <Field label="Salón" value={ubic.salon} />
                </dl>
              ) : (
                <p className="text-sm text-slate-700">{ubic.texto || <span className="text-slate-400">No indicada</span>}</p>
              )}
            </section>
          </div>

          {/* Respuestas del formulario */}
          {others.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-medium text-slate-500">Respuestas del formulario</h3>
              <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70">
                {others.map((a) => (
                  <div key={a.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                    <dt className="text-sm text-slate-500">{a.label}</dt>
                    <dd className="break-words text-sm text-slate-900">
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 underline-offset-2 hover:underline">
                          Abrir enlace <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        a.text
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* Evidencias */}
          {images.length > 0 ? (
            <section>
              <h3 className="mb-2 text-xs font-medium text-slate-500">Evidencias</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((a) => (
                  <a
                    key={a.key}
                    href={a.url!}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                    title={`${a.label} (abrir en otra pestaña)`}
                  >
                    <img
                      src={a.url!}
                      alt={a.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="glass-photo absolute inset-x-0 bottom-0 truncate px-3 py-1.5 text-xs text-white">{a.label}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Cambiar estado */}
        {onUpdateStatus ? (
          <footer className="border-t border-slate-200/70 bg-white/70 px-5 py-4 sm:px-6">
            {error ? <p className="mb-2 text-sm text-red-700">{error}</p> : null}
            {showTimePicker ? (
              <div>
                <p className="text-sm font-medium text-slate-900">¿En cuánto tiempo estará resuelto?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TIME_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setSelectedTime(o.value)}
                      aria-pressed={selectedTime === o.value}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        selectedTime === o.value ? 'bg-brand-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowTimePicker(false);
                      setSelectedTime('');
                    }}
                    disabled={updating}
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => changeStatus('in_progress', selectedTime)}
                    disabled={!selectedTime || updating}
                    className="rounded-full bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
                  >
                    {updating ? 'Guardando…' : 'Pasar a En proceso'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-600">Cambiar estado</span>
                <div className="inline-flex rounded-full bg-slate-100 p-1" role="radiogroup" aria-label="Estado del reporte">
                  {STEPS.map((s) => {
                    const active = reporte.status === s.status;
                    return (
                      <button
                        key={s.status}
                        role="radio"
                        aria-checked={active}
                        disabled={updating || active}
                        onClick={() => (s.status === 'in_progress' ? setShowTimePicker(true) : changeStatus(s.status))}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                          active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
};

export default ModalDetalleReporte;
