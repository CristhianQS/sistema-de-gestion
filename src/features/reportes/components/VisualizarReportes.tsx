import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlarmClock, BriefcaseBusiness, Clock, FileText, GraduationCap, IdCard, MessageCircle, RefreshCw, Search, Sparkles, Star, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { duracionCorta, slaDe } from '../sla';
import { getReportesConArea, updateReporteStatus } from '../services/reportes.service';
import ModalDetalleReporte from './ModalDetalleReporte';
import ReviewIndicator from './ReviewIndicator';
import { markAsReviewed } from '../../../services/database/submissions.service';
import { useAuth } from '../../auth/context/AuthContext';
import { useModuleAccess } from '../../auth/ModuleAccessContext';
import { Button, PageHeader, Spinner } from '../../../components/ui';

interface Reporte {
  id: number;
  area_id: number;
  alumno_id: number;
  alumno_dni: string;
  alumno_codigo: number;
  alumno_nombre: string;
  form_data: { descripcion?: string; estimated_time?: string; ai_generated?: boolean; [key: string]: unknown };
  submitted_at: string;
  status: 'pending' | 'in_progress' | 'resolved';
  area_nombre?: string;
  reviewed?: boolean;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  // Campos para reportes de docentes
  es_docente?: boolean;
  docente_dni?: string | null;
  docente_nombre?: string | null;
  docente_id?: number | null;
  prioridad?: 'normal' | 'alta' | 'urgente';
}

interface Props {
  /** Áreas visibles; null = todas (super admin) */
  areaIds: number[] | null;
}

type Status = Reporte['status'];
type Filter = 'all' | 'docentes' | 'alumnos' | 'vencidos' | Status;

/** Orden dentro de cada grupo: pendientes primero, luego en proceso, luego resueltos; los más recientes arriba */
const STATUS_ORDER: Record<Status, number> = { pending: 0, in_progress: 1, resolved: 2 };
const byPriority = (a: { status: Status; submitted_at: string }, b: { status: Status; submitted_at: string }) =>
  (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) || b.submitted_at.localeCompare(a.submitted_at);

/** Color semántico por estado (ámbar / azul / verde), discreto */
const STATUS: Record<Status, { label: string; step: number; dot: string; pill: string; bar: string }> = {
  pending: {
    label: 'Recibido',
    step: 1,
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-800 ring-amber-200',
    bar: 'bg-amber-400',
  },
  in_progress: {
    label: 'En proceso',
    step: 2,
    dot: 'bg-brand-600',
    pill: 'bg-brand-50 text-brand-800 ring-brand-200',
    bar: 'bg-brand-600',
  },
  resolved: {
    label: 'Resuelto',
    step: 3,
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    bar: 'bg-emerald-500',
  },
};

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
/** «hace 3 horas», «ayer»… (la fecha completa va en el tooltip) */
function relativeDate(iso: string) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'hace un momento';
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Tres pasos: recibido → en proceso → resuelto */
function Steps({ status }: { status: Status }) {
  const { step, bar } = STATUS[status];
  return (
    <div className="flex items-center gap-1" aria-label={`Paso ${step} de 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`h-1.5 w-6 rounded-full ${n <= step ? bar : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}

const VisualizarReportes: React.FC<Props> = ({ areaIds }) => {
  const { user } = useAuth();
  const { canEdit } = useModuleAccess();
  // Se guarda el id (no una copia): así el modal ve el estado actualizado tras guardar
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openWithTimePicker, setOpenWithTimePicker] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);

  // React Query: caché compartida y recarga en segundo plano. Realtime invalida la
  // consulta cuando cambia un reporte; si Realtime no está activo, recarga cada minuto.
  const queryClient = useQueryClient();
  const {
    data: reportes = [],
    isLoading: loading,
    isFetching: refreshing,
    refetch,
  } = useQuery({
    queryKey: ['reportes', areaIds],
    queryFn: () => getReportesConArea<Reporte>(areaIds),
    refetchInterval: 60_000,
  });
  const loadReportes = async () => {
    await refetch();
  };

  useEffect(() => {
    const canal = supabase
      .channel('reportes-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'area_submissions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['reportes'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  // Reloj para el SLA: recalcula vencimientos cada minuto
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const reviewerEmail = user?.email || 'admin@upeu.edu.pe';

  const handleMarkAsReviewed = async (reporteId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markAsReviewed(reporteId, reviewerEmail);
      await loadReportes();
    } catch (error) {
      console.error('Error al marcar como revisado:', error);
    }
  };

  /** Lanza el error para que el modal pueda mostrarlo */
  const handleUpdateStatus = async (reporteId: number, newStatus: string, estimatedTime?: string) => {
    await updateReporteStatus(reporteId, newStatus, estimatedTime);
    // Cambiar el estado también lo marca como revisado
    await markAsReviewed(reporteId, reviewerEmail);
    await loadReportes();
  };

  const openDetail = (id: number, withTimePicker = false) => {
    setOpenWithTimePicker(withTimePicker);
    setSelectedId(id);
  };

  const handleStatusSelect = (reporte: Reporte, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === 'in_progress') {
      // Pedir el tiempo estimado en el modal (no con prompt del navegador)
      e.target.value = reporte.status;
      openDetail(reporte.id, true);
      return;
    }
    handleUpdateStatus(reporte.id, newStatus).catch((error) => console.error('Error al actualizar estado:', error));
  };

  const stats = useMemo(() => {
    const s = { all: reportes.length, docentes: 0, alumnos: 0, pending: 0, in_progress: 0, resolved: 0, vencidos: 0 };
    for (const r of reportes) {
      if (slaDe(r, ahora)?.vencido) s.vencidos++;
      if (r.es_docente) s.docentes++;
      else s.alumnos++;
      if (r.status in s) s[r.status]++;
    }
    return s;
  }, [reportes, ahora]);

  const filteredReportes = useMemo(() => {
    const q = normalize(deferredSearch.trim());
    return reportes.filter((r) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'docentes'
            ? r.es_docente === true
            : filter === 'alumnos'
              ? !r.es_docente
              : filter === 'vencidos'
                ? !!slaDe(r, ahora)?.vencido
                : r.status === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      return normalize(
        [r.alumno_nombre, r.alumno_dni, String(r.alumno_codigo), r.area_nombre, r.docente_nombre].filter(Boolean).join(' ')
      ).includes(q);
    });
  }, [reportes, filter, deferredSearch, ahora]);

  // Docentes primero (prioridad); no se usa la columna `prioridad` porque es texto y no siempre viene
  const groups = useMemo(() => {
    const docentes = filteredReportes.filter((r) => r.es_docente).sort(byPriority);
    const alumnos = filteredReportes.filter((r) => !r.es_docente).sort(byPriority);
    return [
      { key: 'docentes', title: 'Docentes · atención prioritaria', icon: BriefcaseBusiness, items: docentes },
      { key: 'alumnos', title: 'Alumnos', icon: GraduationCap, items: alumnos },
    ].filter((g) => g.items.length > 0);
  }, [filteredReportes]);

  const tabs: { key: Filter; label: string; count: number; dot?: string; icon?: typeof GraduationCap }[] = [
    { key: 'all', label: 'Todos', count: stats.all },
    { key: 'pending', label: 'Recibidos', count: stats.pending, dot: STATUS.pending.dot },
    { key: 'in_progress', label: 'En proceso', count: stats.in_progress, dot: STATUS.in_progress.dot },
    { key: 'resolved', label: 'Resueltos', count: stats.resolved, dot: STATUS.resolved.dot },
    { key: 'vencidos', label: 'Vencidos', count: stats.vencidos, icon: AlarmClock },
    { key: 'docentes', label: 'Docentes', count: stats.docentes, icon: BriefcaseBusiness },
    { key: 'alumnos', label: 'Alumnos', count: stats.alumnos, icon: GraduationCap },
  ];

  const selectedReporte = selectedId == null ? null : reportes.find((r) => r.id === selectedId) ?? null;

  if (loading) return <Spinner />;

  const pct = (n: number) => (stats.all ? (n / stats.all) * 100 : 0);
  const resolvedPct = Math.round(pct(stats.resolved));

  return (
    <div>
      <PageHeader
        title="Reportes"
        description={
          areaIds === null
            ? 'Reportes de alumnos y docentes de todas las áreas.'
            : 'Reportes de alumnos y docentes de tus áreas asignadas.'
        }
        actions={
          <Button variant="secondary" onClick={() => loadReportes()} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        }
      />

      {/* Resumen + filtros en un solo bloque */}
      <section className="glass-light mb-4 rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold tracking-tight text-slate-900">{stats.all}</span>
              <span className="text-sm text-slate-600">reportes · {resolvedPct}% resueltos</span>
            </div>
            {/* Distribución por estado */}
            <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-200 lg:w-96" aria-hidden="true">
              <span className={STATUS.pending.bar} style={{ width: `${pct(stats.pending)}%` }} />
              <span className={STATUS.in_progress.bar} style={{ width: `${pct(stats.in_progress)}%` }} />
              <span className={STATUS.resolved.bar} style={{ width: `${pct(stats.resolved)}%` }} />
            </div>
          </div>

          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Buscar reportes</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, DNI, código o área"
              className="w-full rounded-full border border-slate-200 bg-white/80 py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Borrar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
        </div>

        {/* Pestañas = estadísticas: cada una filtra y muestra su conteo */}
        <div className="-mx-1 mt-4 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filtrar reportes">
          {tabs.map((t) => {
            const active = filter === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-brand-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                {t.dot ? <span className={`h-2 w-2 rounded-full ${t.dot}`} /> : null}
                {t.icon ? <t.icon className="h-4 w-4" /> : null}
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lista */}
      {filteredReportes.length === 0 ? (
        <div className="glass-light rounded-[28px] px-6 py-14 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-900">
            {searchTerm || filter !== 'all' ? 'Ningún reporte coincide con el filtro.' : 'Aún no hay reportes.'}
          </p>
          {searchTerm || filter !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="mt-3 rounded-full bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Quitar filtros
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
        <section key={g.key} aria-labelledby={`grupo-${g.key}`}>
          <h2 id={`grupo-${g.key}`} className={`mb-2 flex items-center gap-2 px-2 text-sm font-semibold ${g.key === 'docentes' ? 'text-amber-900' : 'text-slate-700'}`}>
            <g.icon className="h-4 w-4" /> {g.title}
            <span className="font-normal text-slate-500">{g.items.length}</span>
          </h2>
        <ul className={`glass-light divide-y divide-slate-200/70 overflow-hidden rounded-[28px] ${g.key === 'docentes' ? 'ring-1 ring-amber-300/70' : ''}`}>
          {g.items.map((reporte) => {
            const s = STATUS[reporte.status] ?? STATUS.pending;
            const Avatar = reporte.es_docente ? BriefcaseBusiness : GraduationCap;
            const sla = slaDe(reporte, ahora);
            const fd = reporte.form_data ?? {};
            return (
              <li key={reporte.id} className={reporte.es_docente ? 'relative bg-amber-50/60 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-amber-400' : ''}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetail(reporte.id)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      openDetail(reporte.id);
                    }
                  }}
                  className="group flex cursor-pointer gap-3 px-4 py-4 transition-colors hover:bg-white/70 focus-visible:bg-white focus-visible:outline-none sm:gap-4 sm:px-5"
                >
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${reporte.es_docente ? 'bg-amber-400 text-amber-950' : 'bg-slate-100 text-slate-600'}`}
                    title={reporte.es_docente ? 'Docente' : 'Alumno'}
                  >
                    <Avatar className="h-5 w-5" />
                    <span className="sr-only">{reporte.es_docente ? 'Docente' : 'Alumno'}</span>
                  </span>
                  <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      {reporte.es_docente ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                          Docente · prioridad
                        </span>
                      ) : null}
                      {reporte.form_data?.ai_generated ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                          <Sparkles className="h-3 w-3" /> Asistente
                        </span>
                      ) : null}
                      <span className="rounded-full bg-brand-900/5 px-2.5 py-0.5 text-xs font-medium text-brand-900">
                        {reporte.area_nombre}
                      </span>
                      {fd.canal === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800">
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </span>
                      ) : null}
                      {sla?.vencido ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200"
                          title={`Tiempo objetivo: ${sla.limiteHoras} h`}
                        >
                          <AlarmClock className="h-3 w-3" /> Vencido hace {duracionCorta(sla.restanteMs)}
                        </span>
                      ) : sla?.porVencer ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                          title={`Tiempo objetivo: ${sla.limiteHoras} h`}
                        >
                          <AlarmClock className="h-3 w-3" /> Vence en {duracionCorta(sla.restanteMs)}
                        </span>
                      ) : null}
                      {typeof fd.satisfaccion === 'number' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800" title="Calificación del usuario">
                          <Star className="h-3 w-3 fill-current" /> {fd.satisfaccion}/5
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <h3 className="truncate font-semibold text-slate-900">
                        {reporte.es_docente && reporte.docente_nombre ? reporte.docente_nombre : reporte.alumno_nombre}
                      </h3>
                      <button
                        onClick={(e) => (canEdit ? handleMarkAsReviewed(reporte.id, e) : e.stopPropagation())}
                        disabled={!canEdit}
                        className="shrink-0"
                        title={canEdit ? 'Marcar como revisado' : undefined}
                      >
                        <ReviewIndicator
                          reviewed={reporte.reviewed || false}
                          reviewedAt={reporte.reviewed_at}
                          reviewedBy={reporte.reviewed_by}
                          size="sm"
                        />
                      </button>
                    </div>

                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <IdCard className="h-3.5 w-3.5" /> DNI {reporte.es_docente && reporte.docente_dni ? reporte.docente_dni : reporte.alumno_dni}
                      </span>
                      {!reporte.es_docente ? <span>Código {reporte.alumno_codigo}</span> : null}
                      <span title={fullDate(reporte.submitted_at)}>{relativeDate(reporte.submitted_at)}</span>
                    </div>

                    {reporte.form_data?.descripcion ? (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">{reporte.form_data.descripcion}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                    <div className="flex items-center gap-3">
                      {reporte.form_data?.estimated_time && reporte.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="h-3.5 w-3.5" /> {reporte.form_data.estimated_time}
                        </span>
                      ) : null}
                      <Steps status={reporte.status} />
                    </div>
                    {canEdit ? (
                      <select
                        value={reporte.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusSelect(reporte, e)}
                        aria-label={`Cambiar estado del reporte de ${reporte.alumno_nombre}`}
                        className="cursor-pointer rounded-full border border-slate-200 bg-white/90 py-1.5 pl-3 pr-8 text-sm text-slate-800 hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                      >
                        <option value="pending">Recibido</option>
                        <option value="in_progress">En proceso</option>
                        <option value="resolved">Resuelto</option>
                      </select>
                    ) : null}
                  </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        </section>
          ))}
        </div>
      )}

      <p className="mt-3 px-2 text-xs text-slate-500">
        Mostrando {filteredReportes.length} de {stats.all} reportes
      </p>

      {selectedReporte ? (
        <ModalDetalleReporte
          key={`${selectedReporte.id}-${openWithTimePicker}`}
          isOpen
          onClose={() => setSelectedId(null)}
          reporte={selectedReporte}
          startWithTimePicker={openWithTimePicker}
          onUpdateStatus={canEdit ? handleUpdateStatus : undefined}
        />
      ) : null}
    </div>
  );
};

export default VisualizarReportes;
