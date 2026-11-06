import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { BookOpen, Building2, FileText, GraduationCap, LayoutGrid, MessageCircle, MessageSquare, Users, type LucideIcon } from 'lucide-react';
import type { ModuleKey } from '../auth/modules';

/**
 * Qué componente e ícono usa cada módulo. Cada módulo se descarga solo al
 * abrirlo (el panel inicial no carga xlsx ni el código de las demás pantallas).
 */
export const MODULE_VIEWS: Record<ModuleKey, { icon: LucideIcon; component: LazyExoticComponent<ComponentType> }> = {
  reportes: { icon: FileText, component: lazy(() => import('./modules/ReportesModule')) },
  areas: { icon: LayoutGrid, component: lazy(() => import('../areas/components/GestionAreas')) },
  pabellones: { icon: Building2, component: lazy(() => import('../pabellones/components/GestionPabellones')) },
  alumnos: { icon: GraduationCap, component: lazy(() => import('../alumnos/components/GestionDatosAlumnos')) },
  docentes: { icon: BookOpen, component: lazy(() => import('../docentes/components/GestionDocentes')) },
  chatbot: { icon: MessageSquare, component: lazy(() => import('../chatbot/components/ConfiguracionChatbot')) },
  whatsapp: { icon: MessageCircle, component: lazy(() => import('../whatsapp/components/MensajesWhatsApp')) },
  usuarios: { icon: Users, component: lazy(() => import('../usuarios/components/GestionUsuarios')) },
};
