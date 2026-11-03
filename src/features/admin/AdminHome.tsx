import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';
import { MODULES } from '../auth/modules';
import { MODULE_VIEWS } from './moduleRegistry';
import { Alert } from '../../components/ui';

/** Inicio del panel: lista de los módulos a los que el usuario tiene acceso */
const AdminHome: React.FC = () => {
  const { user, role, can } = useAuth();
  const modules = MODULES.filter((m) => can(m.key));
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {firstName ? `Buen día, ${firstName}.` : 'Buen día.'}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {role === 'super_admin'
          ? 'Tienes acceso total. Desde «Usuarios y permisos» decides qué ve cada admin.'
          : 'Estos son los módulos que te asignaron.'}
      </p>

      {modules.length === 0 ? (
        <div className="mt-6">
          <Alert tone="info">Todavía no tienes módulos asignados. Pide a un super admin que te dé acceso.</Alert>
        </div>
      ) : (
        <ul className="glass-light mt-6 divide-y divide-slate-200/70 overflow-hidden rounded-[28px]">
          {modules.map((m) => {
            const Icon = MODULE_VIEWS[m.key].icon;
            const readOnly = !can(m.key, 'edit');
            return (
              <li key={m.key}>
                <Link
                  to={`/admin/${m.key}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/70 focus-visible:bg-brand-50 focus-visible:outline-none"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-900 text-white"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">{m.label}</span>
                    <span className="block truncate text-sm text-slate-600">{m.description}</span>
                  </span>
                  <span className={`hidden text-xs sm:block ${readOnly ? 'text-slate-500' : 'text-brand-700'}`}>
                    {readOnly ? 'Solo ver' : 'Ver y editar'}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminHome;
