/**
 * Componentes de interfaz compartidos. Usan solo la paleta `brand` y los
 * grises; rojo/verde/ámbar quedan para estados.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-900 text-white shadow-sm hover:bg-brand-800',
  secondary: 'bg-white/80 text-brand-900 border border-slate-200 hover:bg-white',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'gray' }) {
  const styles = tone === 'brand' ? 'bg-brand-50 text-brand-800 ring-brand-200' : 'bg-gray-100 text-gray-700 ring-gray-200';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles}`}>
      {children}
    </span>
  );
}

export function Alert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-brand-200 bg-brand-50 text-brand-900',
  }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`glass-light flex max-h-[90vh] w-full flex-col rounded-[28px] !bg-white/90 ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-200/70 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Cargando">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-gray-50';
