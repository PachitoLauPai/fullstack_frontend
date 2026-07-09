import api from "@/lib/api"

export interface Universidad {
  id: number
  nombreUniversidad: string
  direccion?: string
}

export const universidadesService = {
  getAll: async (): Promise<Universidad[]> => {
    const response = await api.get<Universidad[]>("/universidades")
    return response.data
  },

  getById: async (id: number): Promise<Universidad> => {
    const response = await api.get<Universidad>(`/universidades/${id}`)
    return response.data
  },
}
