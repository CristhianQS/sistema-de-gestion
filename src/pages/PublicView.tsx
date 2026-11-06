import React, { Suspense, lazy, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ClipboardList, LogIn, MapPin, MessageCircle, Search, X } from 'lucide-react';
import { getSalonById } from '../services/database/pabellones.service';

// Los modales y el chatbot se descargan recién cuando hacen falta: la portada
// carga solo lo necesario para mostrarse.
const ModalLogin = lazy(() => import('../features/auth/components/ModalLogin'));
const ModalVerificarAlumno = lazy(() => import('../features/alumnos/components/ModalVerificarAlumno'));
const ModalFormularioArea = lazy(() => import('../features/areas/components/ModalFormularioArea'));
const StudentReportsModal = lazy(() => import('../features/alumnos/components/StudentReportsModal'));
const ChatbotAsistente = lazy(() => import('../features/chatbot/components/ChatbotAsistente'));
import { useAuth } from '../features/auth/context/AuthContext';
import type { Area, DataAlumno } from '../lib/supabase';
import type { Docente } from '../services/database/docentes.service';
import { getAllAreasUnpaginated } from '../services/database/areas.service';
import { IMAGE_CONFIG } from '../constants';
import BrandLogo from '../components/BrandLogo';

// Usuario verificado (alumno o docente)
interface VerifiedUser {
  data: DataAlumno | Docente;
  tipo: 'alumno' | 'docente';
}

const STEPS = [
  { title: 'Elige el área', text: 'La que se encarga del problema.' },
  { title: 'Verifícate', text: 'Con tu DNI o código.' },
  { title: 'Envía', text: 'Describe qué pasó y dónde.' },
];

/** Quita tildes y pasa a minúsculas para que la búsqueda sea tolerante */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const CardSkeleton = ({ wide }: { wide?: boolean }) => (
  <li className={`h-56 animate-pulse rounded-[28px] bg-white/70 ${wide ? 'sm:col-span-2' : ''}`} />
);

const PublicView: React.FC = () => {
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalVerificarOpen, setIsModalVerificarOpen] = useState(false);
  const [isModalFormularioOpen, setIsModalFormularioOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [reportCode, setReportCode] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { user } = useAuth();
  const navigate = useNavigate();

  // QR del salón: /?salon=ID abre la portada con la ubicación ya elegida
  const [salonQrId, setSalonQrId] = useState<number | null>(() => {
    const id = Number(new URLSearchParams(window.location.search).get('salon'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });
  const { data: salonQr } = useQuery({
    queryKey: ['salon', salonQrId],
    queryFn: () => getSalonById(salonQrId!),
    enabled: salonQrId != null,
    staleTime: 10 * 60 * 1000,
  });
  const quitarSalonQr = () => {
    setSalonQrId(null);
    window.history.replaceState(null, '', window.location.pathname);
  };
  const ubicacionInicial =
    salonQrId != null && salonQr?.pabellon
      ? {
          pabellon: { id: salonQr.pabellon.id, nombre: salonQr.pabellon.nombre, descripcion: null, imagen_url: null },
          salon: { id: salonQr.id, pabellon_id: salonQr.pabellon_id, nombre: salonQr.nombre, capacidad: null, descripcion: null },
        }
      : null;

  useEffect(() => {
    getAllAreasUnpaginated()
      .then(setAreas)
      .catch((error) => {
        console.error('Error al cargar áreas:', error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Con sesión iniciada, ir al panel (cada usuario ve solo sus módulos)
  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
  }, [user, navigate]);

  const filteredAreas = useMemo(() => {
    const q = normalize(deferredSearch.trim());
    if (!q) return areas;
    return areas.filter((a) => normalize(`${a.name} ${a.description ?? ''}`).includes(q));
  }, [areas, deferredSearch]);

  const handleAreaClick = (area: Area) => {
    setSelectedArea(area);
    setIsModalVerificarOpen(true);
  };

  const handleUserVerified = (verified: VerifiedUser) => {
    setVerifiedUser(verified);
    setIsModalVerificarOpen(false);
    setIsModalFormularioOpen(true);
  };

  const handleCloseFormulario = () => {
    setIsModalFormularioOpen(false);
    setSelectedArea(null);
    setVerifiedUser(null);
  };

  const openReports = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsReportsModalOpen(true);
  };

  // En escritorio va en la portada; en móvil, después de las áreas (lo principal primero)
  const bento = (
    <div className="grid grid-cols-2 gap-3">
              <form onSubmit={openReports} className="glass-dark col-span-2 rounded-[28px] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">Sigue tu reporte</h2>
                  <ClipboardList className="h-5 w-5 text-brand-200" />
                </div>
                <p className="mt-1 text-sm text-brand-100">Recibido, en proceso o resuelto: míralo con tu código de estudiante.</p>
                <div className="mt-4 flex gap-2">
                  <label className="flex-1">
                    <span className="sr-only">Código de estudiante</span>
                    <input
                      inputMode="numeric"
                      value={reportCode}
                      onChange={(e) => setReportCode(e.target.value)}
                      placeholder="Ej: 2020123456"
                      className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-brand-200/80 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 transition-transform hover:scale-[1.03]"
                  >
                    Consultar
                  </button>
                </div>
              </form>
  
              <div className="glass-dark col-span-2 rounded-[28px] p-5 sm:col-span-1">
                <h2 className="text-sm font-semibold text-white">Cómo funciona</h2>
                <ol className="mt-3 space-y-2.5">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-900">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-tight">
                        <span className="block font-medium text-white">{s.title}</span>
                        <span className="text-brand-200">{s.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
  
              <div className="glass-dark col-span-2 flex flex-col justify-between rounded-[28px] p-5 sm:col-span-1">
                <MessageCircle className="h-6 w-6 text-brand-200" />
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-white">¿Dudas con el área?</h2>
                  <p className="mt-1 text-sm text-brand-200">El asistente (abajo a la derecha) te ayuda a elegirla.</p>
                </div>
              </div>
            </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-campus-soft">
      {/* ===================== Portada ===================== */}
      <div className="bg-campus-glow pb-16 text-white sm:pb-20">
        {/* Barra flotante de vidrio */}
        <div className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
          <header className="glass-dark mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pl-2 pr-2 sm:pl-3">
            <BrandLogo />
            <nav className="flex items-center gap-1">
              <button
                onClick={() => openReports()}
                className="flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Mis reportes</span>
              </button>
              <button
                onClick={() => setIsModalLoginOpen(true)}
                className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-brand-900 transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label="Acceso para administradores"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Acceso</span>
              </button>
            </nav>
          </header>
        </div>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          {/* Mensaje + búsqueda */}
          <div>
            <span className="glass-dark inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-brand-100">
              Campus Juliaca · Mesa de reportes
            </span>
            {ubicacionInicial ? (
              <div className="mt-3 flex w-fit max-w-full items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-brand-900 shadow-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Reportando desde {ubicacionInicial.pabellon.nombre} · {ubicacionInicial.salon.nombre}. Elige el área del problema.
                </span>
                <button onClick={quitarSalonQr} className="rounded-full p-0.5 text-slate-500 hover:bg-slate-100" aria-label="Quitar ubicación">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
            <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Algo falla en el campus.
              <span className="block text-brand-200">Lo resolvemos juntos.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-brand-100">
              Elige el área responsable, cuéntanos qué pasó y sigue el avance de tu reporte hasta que quede resuelto.
            </p>

            <label className="glass-dark relative mt-8 flex max-w-xl items-center rounded-full p-1.5">
              <span className="sr-only">Buscar un área</span>
              <Search className="pointer-events-none absolute left-5 h-5 w-5 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="¿Qué necesitas? Internet, limpieza, un proyector…"
                className="w-full rounded-full border-0 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-300/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Borrar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>

            {/* Atajos: un toque para abrir el área */}
            {areas.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {areas.slice(0, 6).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleAreaClick(a)}
                    className="glass-dark rounded-full px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Bento (escritorio): consulta + cómo funciona + asistente */}
          <div className="hidden lg:block">{bento}</div>
        </section>
      </div>

      {/* ===================== Áreas ===================== */}
      <main className="relative z-10 mx-auto -mt-8 w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <div className="glass-light rounded-[32px] p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Áreas de atención</h2>
              <p className="text-sm text-slate-600">Toca un área para iniciar tu reporte.</p>
            </div>
            {!loading && !loadError ? (
              <span className="rounded-full bg-brand-900/5 px-3 py-1 text-xs font-medium text-brand-900">
                {filteredAreas.length === areas.length
                  ? `${areas.length} ${areas.length === 1 ? 'área' : 'áreas'}`
                  : `${filteredAreas.length} de ${areas.length}`}
              </span>
            ) : null}
          </div>

          {loadError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              No pudimos cargar las áreas. Revisa tu conexión y recarga la página.
            </div>
          ) : !loading && filteredAreas.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
              <p className="font-medium text-slate-900">
                {areas.length === 0 ? 'Aún no hay áreas disponibles.' : `Ningún área coincide con «${search}».`}
              </p>
              {areas.length > 0 ? (
                <button
                  onClick={() => setSearch('')}
                  className="mt-3 rounded-full bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
                >
                  Ver todas las áreas
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 4 }, (_, i) => <CardSkeleton key={i} wide={i === 0} />)
                : filteredAreas.map((area, i) => {
                    // La primera área se destaca a doble ancho cuando no se está buscando
                    const featured = i === 0 && !deferredSearch && filteredAreas.length > 2;
                    return (
                      <li key={area.id} className={featured ? 'sm:col-span-2' : ''}>
                        <button
                          onClick={() => handleAreaClick(area)}
                          className="group relative block h-56 w-full overflow-hidden rounded-[28px] bg-brand-900 text-left shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/50"
                        >
                          <img
                            src={area.image_url || IMAGE_CONFIG.PLACEHOLDER}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = IMAGE_CONFIG.ERROR_PLACEHOLDER;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-brand-950/10 to-transparent" />
                          <span className="glass-dark absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                          <div className="glass-photo absolute inset-x-0 bottom-0 px-5 py-4">
                            <div className="font-display text-lg font-semibold text-white">{area.name}</div>
                            <div className="line-clamp-1 text-sm text-white/80">
                              {area.description || 'Reportes para esta área.'}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
            </ul>
          )}
        </div>

        <div className="bg-campus-glow mt-4 rounded-[32px] p-3 text-white lg:hidden">{bento}</div>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 pb-8 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6">
        <span>Universidad Peruana Unión · Campus Juliaca</span>
        <span>Sistema de reportes del campus</span>
      </footer>

      {/* Modales (se montan solo al abrirse) */}
      <Suspense fallback={null}>
      {isModalLoginOpen && <ModalLogin isOpen onClose={() => setIsModalLoginOpen(false)} />}

      {selectedArea && isModalVerificarOpen && (
        <ModalVerificarAlumno
          isOpen={isModalVerificarOpen}
          onClose={() => {
            setIsModalVerificarOpen(false);
            setSelectedArea(null);
          }}
          onVerified={handleUserVerified}
          areaName={selectedArea.name}
        />
      )}

      {selectedArea && verifiedUser && isModalFormularioOpen && (
        <ModalFormularioArea
          isOpen={isModalFormularioOpen}
          onClose={handleCloseFormulario}
          areaId={selectedArea.id}
          areaName={selectedArea.name}
          verifiedUser={verifiedUser}
          ubicacionInicial={ubicacionInicial}
        />
      )}

      {isReportsModalOpen && (
        <StudentReportsModal
          isOpen
          initialCode={reportCode}
          onClose={() => {
            setIsReportsModalOpen(false);
            setReportCode('');
          }}
        />
      )}
      </Suspense>

      {/* Boundary propio: abrir un modal no oculta el chatbot mientras carga */}
      <Suspense fallback={null}>
        <ChatbotAsistente />
      </Suspense>
    </div>
  );
};

export default PublicView;
