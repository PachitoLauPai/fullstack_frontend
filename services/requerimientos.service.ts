import api from "@/lib/api"

export interface RequerimientoVisita {
  id: number
  idVisita: number
  descripcion: string
  fechaSolicitud: string
  estado: string
  respuesta?: string | null
  fechaRespuesta?: string | null
  nombreDocente?: string | null
  nombreAsignatura?: string | null
  nombreSede?: string | null
}

export interface RequerimientoUpdateRequest {
  estado: string
  respuesta: string
  fechaRespuesta?: string
}

export const requerimientosService = {
  listAll: async (): Promise<RequerimientoVisita[]> => {
    const response = await api.get<RequerimientoVisita[]>("/requerimientos")
    return response.data
  },

  // Nuevo: Docente ve solo sus requerimientos
  listMisRequerimientos: async (): Promise<RequerimientoVisita[]> => {
    const response = await api.get<RequerimientoVisita[]>("/requerimientos/mis-requerimientos")
    return response.data
  },

  // Nuevo: Auditor ve requerimientos de sus visitas
  listRequerimientosDeMisVisitas: async (): Promise<RequerimientoVisita[]> => {
    const response = await api.get<RequerimientoVisita[]>("/requerimientos/requerimientos-de-mis-visitas")
    return response.data
  },

  getById: async (id: number): Promise<RequerimientoVisita> => {
    const response = await api.get<RequerimientoVisita>(`/requerimientos/${id}`)
    return response.data
  },

  update: async (id: number, payload: RequerimientoUpdateRequest): Promise<RequerimientoVisita> => {
    const response = await api.put<RequerimientoVisita>(`/requerimientos/${id}`, payload)
    return response.data
  },

  // Nuevo: Docente atiende requerimiento con respuesta
  atender: async (id: number, respuesta: string): Promise<RequerimientoVisita> => {
    const response = await api.post<RequerimientoVisita>(`/requerimientos/${id}/atender`, respuesta, {
      headers: { 'Content-Type': 'text/plain' }
    })
    return response.data
  },
}
