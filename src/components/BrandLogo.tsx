import { useState } from 'react';

/**
 * Logo UPeU Juliaca.
 * Coloca el logo oficial en `public/logo-upeu.png` (fondo transparente).
 * Mientras no exista, se muestra un sello con las siglas.
 */
export const LOGO_SRC = '/logo-upeu.png';

export default function BrandLogo({ subtitle = 'Juliaca' }: { subtitle?: string }) {
  const [missing, setMissing] = useState(false);

  return (
    <div className="flex items-center gap-2.5">
      {missing ? (
        <div
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[11px] font-bold tracking-tight text-brand-900"
        >
          UPeU
        </div>
      ) : (
        <img src={LOGO_SRC} alt="" className="h-9 w-auto" onError={() => setMissing(true)} />
      )}
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">UPeU {subtitle}</div>
        <div className="text-[11px] text-brand-200">Universidad Peruana Unión</div>
      </div>
    </div>
  );
}
