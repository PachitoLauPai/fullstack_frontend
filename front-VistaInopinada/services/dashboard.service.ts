import api from "@/lib/api";

export interface DashboardAuditorStats {
  visitasEsteMes: number;
  docentesEvaluados: number;
  requerimientosPendientes: number;
  proximasVisitas: VisitaResumen[];
  visitasRecientes: VisitaResumen[];
}

export interface VisitaResumen {
  id: number;
  docenteNombre: string;
  asignaturaNombre: string;
  fechaVisita: string;
  horaInicio: string;
  sedeNombre: string;
  estadoVisita: string;
}

export const dashboardService = {
  async getAuditorStats(): Promise<DashboardAuditorStats> {
    const response = await api.get("/visitas/dashboard/auditor-stats");
    return response.data;
  },
};
