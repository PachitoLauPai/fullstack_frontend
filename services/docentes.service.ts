import api from "@/lib/api"

export interface Docente {
  id: number
  nombres: string
  apellidos: string
  email: string
  estadoActivo: boolean
  visitas?: number
  cumplimiento?: number
  asignaturas?: string[]
}

export interface CreateDocenteRequest {
  nombres: string
  apellidos: string
  email: string
  estadoActivo?: boolean
}

export interface SendEmailRequest {
  destinatario: string
  asunto: string
  mensaje: string
}

export const docentesService = {
  getAll: async (): Promise<Docente[]> => {
    const response = await api.get<Docente[]>("/docentes")
    return response.data
  },

  getActivos: async (): Promise<Docente[]> => {
    const response = await api.get<Docente[]>("/docentes/activos")
    return response.data
  },

  getById: async (id: number): Promise<Docente> => {
    const response = await api.get<Docente>(`/docentes/${id}`)
    return response.data
  },

  create: async (docente: CreateDocenteRequest): Promise<Docente> => {
    const response = await api.post<Docente>("/docentes", docente)
    return response.data
  },

  update: async (id: number, docente: CreateDocenteRequest): Promise<Docente> => {
    const response = await api.put<Docente>(`/docentes/${id}`, docente)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/docentes/${id}`)
  },

  sendEmail: async (data: SendEmailRequest): Promise<void> => {
    await api.post("/docentes/email", data)
  },
}
