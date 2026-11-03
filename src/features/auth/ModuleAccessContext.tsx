import { createContext, useContext } from 'react';

/**
 * Nivel de acceso del módulo que se está mostrando. Lo provee el layout del
 * panel; los módulos lo leen para ocultar crear / editar / eliminar cuando
 * el admin solo tiene permiso de ver.
 */
export const ModuleAccessContext = createContext<{ canEdit: boolean }>({ canEdit: true });

export const useModuleAccess = () => useContext(ModuleAccessContext);
