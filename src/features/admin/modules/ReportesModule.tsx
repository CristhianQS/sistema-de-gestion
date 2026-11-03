import { useAuth } from '../../auth/context/AuthContext';
import VisualizarReportes from '../../reportes/components/VisualizarReportes';

/** Reportes limitados a las áreas del admin (el super admin ve todas) */
export default function ReportesModule() {
  const { permissions } = useAuth();
  // areaIds null = super admin (todas); `??` no sirve aquí porque convertiría null en []
  return <VisualizarReportes areaIds={permissions ? permissions.areaIds : []} />;
}
