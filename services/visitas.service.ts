import api from "@/lib/api"

export interface EvaluacionControlDocente {
  docentePresente: boolean
  horarioCumplido: boolean
  interaccionAdecuada: boolean
  actividadDesarrollada: string
  observaciones: string
}

export interface EvaluacionMaterialVirtual {
  cumple: boolean
  observaciones: string
}

export interface EvaluacionAsistenciaEstudiantes {
  ambienteCumple: string | null
  ambienteObservaciones: string
  intranetCumple: string | null
  intranetObservaciones: string
  observacionesGenerales: string
}

export interface EvaluacionAvanceSilabico {
  temaCoincideVisita: boolean
  temaCoincideAnterior: boolean
  ingresoAulaVirtual: boolean
  observaciones: string
}

export interface EvaluacionGuiaPractica {
  temaProgramadoCumple: string
  logroEvidenciado: string
  rubricaEvaluacion: string
  observaciones: string
}

export interface RequerimientoVisita {
  id: number
  descripcion: string
  estado: string
  fechaSolicitud: string
}

export interface Visita {
  id: number
  fechaVisita: string
  horaInicio: string
  horaTermino: string
  semanaNumero: number | null
  lugarVisita: string | null
  tipoClase: string
  idSede: number
  nombreSede: string
  idDocente: number
  nombreDocente: string
  apellidosDocente: string
  idAsignatura: number
  nombreAsignatura: string
  idResponsable: number
  nombreResponsable: string
  idUsuarioAuditor: number
  nombreAuditor: string
  estadoVisita: string
  firmaDocenteHash: string | null
  firmaResponsableHash: string | null
  evidenciaImagenHash?: string | null
  fechaFirmaDocente: string | null
  fechaFirmaResponsable: string | null
  fechaRegistro: string
  updatedAt: string | null
  evaluacionControlDocente?: EvaluacionControlDocente
  evaluacionMaterialVirtual?: EvaluacionMaterialVirtual
  evaluacionAsistenciaEstudiantes?: EvaluacionAsistenciaEstudiantes
  evaluacionAvanceSilabico?: EvaluacionAvanceSilabico
  evaluacionGuiaPractica?: EvaluacionGuiaPractica
  requerimientos?: RequerimientoVisita[]
}

export interface RequerimientoCreateData {
  descripcion: string
}

export interface VisitaCreateData {
  fechaVisita: string
  horaInicio: string
  horaTermino: string
  semanaNumero?: number | null
  lugarVisita?: string | null
  tipoClase?: string
  idSede: number
  idDocente: number
  idAsignatura: number
  idResponsable: number
  evaluacionControlDocente?: EvaluacionControlDocente
  evaluacionMaterialVirtual?: EvaluacionMaterialVirtual
  evaluacionAsistenciaEstudiantes?: EvaluacionAsistenciaEstudiantes
  evaluacionAvanceSilabico?: EvaluacionAvanceSilabico
  evaluacionGuiaPractica?: EvaluacionGuiaPractica
  requerimientos?: RequerimientoCreateData[]
  evidenciaImagen?: string | null
}

export interface VisitaFilterData {
  busqueda?: string | null
  idSede?: number | null
  estado?: string | null
  fechaDesde?: string | null
  fechaHasta?: string | null
}

export interface VisitaProgramarData {
  idDocente: number
  idAsignatura: number
  idSede: number
  fechaVisita: string
  idAuditor: number
}

export const visitasService = {
  getAll: async (): Promise<Visita[]> => {
    const response = await api.get<Visita[]>("/visitas")
    return response.data
  },

  getMisVisitasDocente: async (): Promise<Visita[]> => {
    const response = await api.get<Visita[]>("/visitas/mis-visitas-docente")
    return response.data
  },

  getMisVisitasAuditor: async (): Promise<Visita[]> => {
    const response = await api.get<Visita[]>("/visitas/mis-visitas-auditor")
    return response.data
  },

  getById: async (id: number): Promise<Visita> => {
    const response = await api.get<Visita>(`/visitas/${id}`)
    return response.data
  },

  create: async (data: VisitaCreateData): Promise<Visita> => {
    const response = await api.post<Visita>("/visitas", data)
    return response.data
  },

  update: async (id: number, data: VisitaCreateData): Promise<Visita> => {
    const response = await api.put<Visita>(`/visitas/${id}`, data)
    return response.data
  },

  updateEvaluaciones: async (id: number, data: VisitaCreateData): Promise<Visita> => {
    const response = await api.put<Visita>(`/visitas/${id}/evaluaciones`, data)
    return response.data
  },

  firmarDocente: async (id: number, firmaHash: string): Promise<Visita> => {
    const response = await api.post<Visita>(`/visitas/${id}/firma-docente`, firmaHash, {
      headers: { "Content-Type": "text/plain" },
    })
    return response.data
  },

  firmarAuditor: async (id: number, firmaHash: string): Promise<Visita> => {
    const response = await api.post<Visita>(`/visitas/${id}/firma-auditor`, firmaHash, {
      headers: { "Content-Type": "text/plain" },
    })
    return response.data
  },

  filtrar: async (filters: VisitaFilterData): Promise<Visita[]> => {
    const response = await api.post<Visita[]>("/visitas/filtrar", filters)
    return response.data
  },

  filtrarAuditor: async (filters: VisitaFilterData): Promise<Visita[]> => {
    const response = await api.post<Visita[]>("/visitas/filtrar-auditor", filters)
    return response.data
  },

  filtrarDocente: async (filters: VisitaFilterData): Promise<Visita[]> => {
    const response = await api.post<Visita[]>("/visitas/filtrar-docente", filters)
    return response.data
  },

  generarPdf: async (id: number): Promise<Blob> => {
    const response = await api.get(`/visitas/${id}/pdf`, {
      responseType: "blob",
    })
    return response.data
  },

  exportarPdf: async (filters: {
    busqueda?: string | null
    idSede?: number | null
    estado?: string | null
    fechaDesde?: string | null
    fechaHasta?: string | null
  }): Promise<Blob> => {
    const response = await api.post(`/visitas/exportar/pdf`, filters, {
      responseType: "blob",
    })
    return response.data
  },

  programar: async (data: VisitaProgramarData): Promise<Visita> => {
    const response = await api.post<Visita>("/visitas/programar", data)
    return response.data
  },
}
