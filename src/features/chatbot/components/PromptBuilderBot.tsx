import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import type { ChatbotConfig } from '../config/chatbotPrompts';
import { useQuery } from '@tanstack/react-query';
import { buildBuilderBotSegments, joinSegments, type UbicacionCampus } from '../config/builderbotPrompt';
import { getAllPabellones, getAllSalones } from '../../../services/database/pabellones.service';

/** Pabellones con sus aulas, para el bloque «Ubicaciones del campus» */
async function cargarUbicaciones(): Promise<UbicacionCampus[]> {
  const [pabellones, salones] = await Promise.all([getAllPabellones(), getAllSalones()]);
  return pabellones.map((p) => ({
    pabellon: p.nombre,
    aulas: salones.filter((s) => s.pabellon_id === p.id).map((s) => s.nombre),
  }));
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt('Copia el texto con Ctrl+C:', text);
    }
  };
  return (
    <button
      type="button"
      onClick={copiar}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        copiado ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-900 text-white hover:bg-brand-800'
      }`}
    >
      {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copiado ? 'Copiado' : label}
    </button>
  );
}

/**
 * Prompt del asistente de WhatsApp (BuilderBot), por bloques y completo.
 * Se arma con la configuración que se está editando y las áreas del sistema.
 */
const PromptBuilderBot: React.FC<{ config: ChatbotConfig }> = ({ config }) => {
  const [abierto, setAbierto] = useState<string | null>(null);
  const { data: ubicaciones } = useQuery({ queryKey: ['ubicaciones-campus'], queryFn: cargarUbicaciones });
  const segmentos = useMemo(() => buildBuilderBotSegments(config, ubicaciones), [config, ubicaciones]);
  const completo = useMemo(() => joinSegments(segmentos), [segmentos]);

  return (
    <section className="glass-light mb-6 rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">Prompt para BuilderBot</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Copia cada bloque en su sección del asistente de BuilderBot, o usa el prompt completo si solo tiene un campo.
            Se arma con los textos de abajo y las reglas de la mesa de ayuda; si cambias algo, guarda y vuelve a copiar.
          </p>
        </div>
        <CopyButton text={completo} label="Copiar prompt completo" />
      </div>

      <ol className="mt-5 divide-y divide-slate-200/70 overflow-hidden rounded-2xl bg-white/70 ring-1 ring-slate-200/70">
        {segmentos.map((s, i) => {
          const open = abierto === s.key;
          return (
            <li key={s.key}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setAbierto(open ? null : s.key)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  aria-expanded={open}
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{s.title}</span>
                    <span className="block truncate text-xs text-slate-500">{s.hint}</span>
                  </span>
                  <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <CopyButton text={s.text} />
              </div>
              {open && (
                <pre className="mx-4 mb-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 font-sans text-sm text-slate-700 ring-1 ring-slate-200/70">
                  {s.text}
                </pre>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default PromptBuilderBot;
