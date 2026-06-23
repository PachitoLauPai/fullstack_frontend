import api from "@/lib/api"

export interface Sede {
  id: number
  nombre: string
  idUniversidad: number
  nombreUniversidad: string
}

export interface SedeCreateData {
  nombre: string
  idUniversidad: number
}

export interface SedeUpdateData {
  nombre: string
  idUniversidad: number
}

export const sedesService = {
  getAll: async (): Promise<Sede[]> => {
    const response = await api.get<Sede[]>("/sedes")
    return response.data
  },

  getByUniversidad: async (idUniversidad: number): Promise<Sede[]> => {
    const response = await api.get<Sede[]>(`/sedes/universidad/${idUniversidad}`)
    return response.data
  },

  getById: async (id: number): Promise<Sede> => {
    const response = await api.get<Sede>(`/sedes/${id}`)
    return response.data
  },

  create: async (data: SedeCreateData): Promise<Sede> => {
    const response = await api.post<Sede>("/sedes", data)
    return response.data
  },

  update: async (id: number, data: SedeUpdateData): Promise<Sede> => {
    const response = await api.put<Sede>(`/sedes/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/sedes/${id}`)
  },
}
