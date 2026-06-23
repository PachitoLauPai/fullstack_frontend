import api from "@/lib/api"

export interface Asignatura {
  id: number
  nombre: string
  campoFormativo: string | null
  cicloAcademico: string | null
  turno: string | null
  tipoHorario: string | null
}

export interface AsignaturaCreateData {
  nombre: string
  campoFormativo?: string | null
  cicloAcademico?: string | null
  turno?: string | null
  tipoHorario?: string | null
}

export const asignaturasService = {
  getAll: async (): Promise<Asignatura[]> => {
    const response = await api.get<Asignatura[]>("/asignaturas")
    return response.data
  },

  getById: async (id: number): Promise<Asignatura> => {
    const response = await api.get<Asignatura>(`/asignaturas/${id}`)
    return response.data
  },

  create: async (data: AsignaturaCreateData): Promise<Asignatura> => {
    const response = await api.post<Asignatura>("/asignaturas", data)
    return response.data
  },

  update: async (id: number, data: AsignaturaCreateData): Promise<Asignatura> => {
    const response = await api.put<Asignatura>(`/asignaturas/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/asignaturas/${id}`)
  },
}
