import React, { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button, Modal, Spinner } from '../../../components/ui';

interface Props {
  pabellonNombre: string;
  salon: { id: number; nombre: string };
  onClose: () => void;
}

/** Enlace que abre la portada con la ubicación del salón ya elegida */
const urlReporteSalon =(salonId: number) => `${window.location.origin}/?salon=${salonId}`;

/**
 * QR para pegar en la puerta del salón: al escanearlo, la portada abre con la
 * ubicación ya seleccionada. La librería se descarga solo al abrir el modal.
 */
const QrSalonModal: React.FC<Props> = ({ pabellonNombre, salon, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = urlReporteSalon(salon.id);
  const titulo = `${pabellonNombre} · ${salon.nombre}`;

  useEffect(() => {
    let vivo = true;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#003366', light: '#ffffff' } }),
      )
      .then((u) => vivo && setDataUrl(u))
      .catch((e) => console.error('No se pudo generar el QR', e));
    return () => {
      vivo = false;
    };
  }, [url]);

  const descargar = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR - ${titulo}.png`;
    a.click();
  };

  const imprimir = () => {
    if (!dataUrl) return;
    const w = window.open('', '_blank', 'width=600,height=800');
    if (!w) return;
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title>
      <style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;color:#003366}
      h1{font-size:28px;margin:0 0 4px}p{margin:0 0 24px;color:#475569}img{width:360px;height:360px}
      small{display:block;margin-top:16px;color:#64748b}</style></head><body>
      <h1>¿Algo falla en este salón?</h1><p>Escanea y repórtalo · ${titulo}</p>
      <img src="${dataUrl}" alt="Código QR"><small>UPeU Juliaca · Mesa de reportes</small>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    w.document.close();
  };

  return (
    <Modal
      open
      title={`QR · ${titulo}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={imprimir} disabled={!dataUrl}>
            <Printer className="h-4 w-4" /> Imprimir cartel
          </Button>
          <Button onClick={descargar} disabled={!dataUrl}>
            <Download className="h-4 w-4" /> Descargar PNG
          </Button>
        </>
      }
    >
      <div className="text-center">
        {dataUrl ? (
          <img src={dataUrl} alt={`Código QR de ${titulo}`} className="mx-auto h-64 w-64 rounded-2xl ring-1 ring-slate-200" />
        ) : (
          <Spinner />
        )}
        <p className="mt-4 text-sm text-slate-600">
          Pégalo en la puerta del salón. Al escanearlo se abre la página de reportes con la ubicación ya elegida.
        </p>
        <p className="mt-2 break-all text-xs text-slate-400">{url}</p>
      </div>
    </Modal>
  );
};

export default QrSalonModal;
