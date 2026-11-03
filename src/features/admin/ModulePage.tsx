import React, { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { MODULE_BY_KEY, type ModuleKey } from '../auth/modules';
import { ModuleAccessContext } from '../auth/ModuleAccessContext';
import { MODULE_VIEWS } from './moduleRegistry';
import { Badge, Spinner } from '../../components/ui';

/**
 * Muestra un módulo si el usuario tiene permiso. Si solo puede ver, el
 * módulo recibe canEdit = false y oculta crear / editar / eliminar.
 */
const ModulePage: React.FC = () => {
  const { moduleKey } = useParams();
  const { can } = useAuth();

  const def = moduleKey ? MODULE_BY_KEY.get(moduleKey as ModuleKey) : undefined;
  if (!def || !can(def.key)) return <Navigate to="/admin" replace />;

  const canEdit = can(def.key, 'edit');
  const View = MODULE_VIEWS[def.key].component;

  return (
    <ModuleAccessContext.Provider value={{ canEdit }}>
      {!canEdit ? (
        <div className="mb-4">
          <Badge tone="gray">Solo lectura: puedes ver este módulo, pero no modificarlo.</Badge>
        </div>
      ) : null}
      <Suspense fallback={<Spinner />}>
        {/* key: al cambiar de módulo se reinicia su estado */}
        <View key={def.key} />
      </Suspense>
    </ModuleAccessContext.Provider>
  );
};

export default ModulePage;
