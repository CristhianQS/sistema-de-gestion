import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { MODULES, MODULE_BY_KEY, type ModuleKey } from '../auth/modules';
import { MODULE_VIEWS } from './moduleRegistry';
import NotificationBell from '../notifications/components/NotificationBell';
import NotificationPermissionBanner from '../notifications/components/NotificationPermissionBanner';
import { Spinner } from '../../components/ui';
import BrandLogo from '../../components/BrandLogo';
import UserMenu from './UserMenu';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center gap-3 rounded-full px-3.5 py-2 text-sm transition-colors ${
    isActive
      ? 'glass-dark font-medium text-white'
      : 'text-brand-100 hover:bg-white/5 hover:text-white'
  }`;

/** Panel único: barra lateral con los módulos permitidos y el contenido a la derecha */
const AdminLayout: React.FC = () => {
  const { user, can, loading } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleModules = MODULES.filter((m) => can(m.key));
  const moduleKey = pathname.split('/')[2] as ModuleKey | undefined;
  const current = moduleKey ? MODULE_BY_KEY.get(moduleKey) : undefined;

  const sidebar = (
    <nav className="flex h-full flex-col overflow-hidden rounded-[28px] bg-campus-glow px-2.5 py-4 shadow-xl" aria-label="Módulos">
      <div className="mb-6 px-2">
        <BrandLogo />
      </div>
      <p className="mb-2 px-3 text-[11px] font-medium text-brand-300">Módulos</p>
      <div className="flex-1 space-y-0.5 overflow-y-auto">
        <NavLink to="/admin" end className={navClass} onClick={() => setMenuOpen(false)}>
          <Home className="h-4 w-4" /> Inicio
        </NavLink>
        {visibleModules.map((m) => {
          const Icon = MODULE_VIEWS[m.key].icon;
          return (
            <NavLink key={m.key} to={`/admin/${m.key}`} className={navClass} onClick={() => setMenuOpen(false)}>
              <Icon className="h-4 w-4" /> {m.label}
            </NavLink>
          );
        })}
      </div>
      <p className="px-3 pt-4 text-[11px] text-brand-300">Campus Juliaca</p>
    </nav>
  );

  return (
    <div className="min-h-screen bg-campus-soft">
      {/* Barra lateral fija en escritorio */}
      <aside className="fixed inset-y-3 left-3 hidden w-56 lg:block">{sidebar}</aside>

      {/* Menú deslizable en móvil */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative h-full w-60 p-3">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-[15.5rem]">
        <div className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
        <header className="glass-light flex h-14 items-center gap-3 rounded-full px-3 sm:px-4">
          <button
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Dónde estás */}
          <div className="min-w-0 truncate text-sm">
            <span className="text-slate-500">Panel</span>
            <span className="mx-1.5 text-slate-300">/</span>
            <span className="font-medium text-slate-900">{current?.label ?? 'Inicio'}</span>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {user?.email ? <NotificationBell userEmail={user.email} /> : null}
            <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
            <UserMenu />
          </div>
        </header>
        </div>
        <NotificationPermissionBanner />
        <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">{loading ? <Spinner /> : <Outlet />}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
