import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { ROLE_LABELS } from '../auth/modules';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

/** Usuario en sesión (arriba a la derecha) con menú para cerrar sesión */
const UserMenu: React.FC = () => {
  const { user, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;
  const displayName = user.name || user.email;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-900 text-xs font-semibold text-white">
          {initials(displayName)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[11rem] truncate text-sm font-medium text-slate-900">{displayName}</span>
          <span className="block text-xs text-slate-500">{role ? ROLE_LABELS[role] : ''}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div role="menu" className="glass-light absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-3xl !bg-white/90">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="truncate text-sm font-medium text-slate-900">{displayName}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
          <button
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UserMenu;
