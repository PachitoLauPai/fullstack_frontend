import api from "@/lib/api"

export interface ReportesStats {
  totalVisitas: number
  totalVisitasCrecimiento: number
  cumplimiento: number
  cumplimientoCrecimiento: number
  docentesVisitados: number
  totalDocentes: number
  sedesActivas: number
  sedesDescripcion: string
}

export interface CumplimientoArea {
  area: string
  porcentajeCumplimiento: number
}

export interface VisitasPorSede {
  sede: string
  cantidad: number
  porcentaje: number
}

export interface EvolucionCumplimiento {
  mes: string
  cumplimiento: number
}

export interface TopDocente {
  ranking: number
  nombre: string
  totalVisitas: number
  cumplimiento: number
}

export interface RequerimientoPendiente {
  id: number
  descripcion: string
  docente: string
  fecha: string
  tipo: string
}

export interface ReporteData {
  estadisticas: ReportesStats
  cumplimientoPorArea: CumplimientoArea[]
  visitasPorSede: VisitasPorSede[]
  evolucionCumplimiento: EvolucionCumplimiento[]
  topDocentes: TopDocente[]
  requerimientosPendientes: RequerimientoPendiente[]
}

export type PeriodoReporte = "month" | "semester" | "year"

export const reportesService = {
  getReporteCompleto: async (periodo: PeriodoReporte): Promise<ReporteData> => {
    const response = await api.get<ReporteData>(`/reportes?periodo=${periodo}`)
    return response.data
  },

  exportPdf: async (periodo: PeriodoReporte): Promise<Blob> => {
    const response = await api.get(`/reportes/exportar/pdf?periodo=${periodo}`, {
      responseType: "blob",
    })
    return response.data
  },
}
