import api from "@/lib/api"

export interface Responsable {
  id: number
  nombres: string
  apellidos: string
  cargo: string | null
  email: string | null
}

export interface ResponsableCreateData {
  nombres: string
  apellidos: string
  cargo?: string | null
  email?: string | null
}

export const responsablesService = {
  getAll: async (): Promise<Responsable[]> => {
    const response = await api.get<Responsable[]> ("/responsables")
    return response.data
  },

  getActivos: async (): Promise<Responsable[]> => {
    const response = await api.get<Responsable[]>("/responsables/activos")
    return response.data
  },

  getById: async (id: number): Promise<Responsable> => {
    const response = await api.get<Responsable>(`/responsables/${id}`)
    return response.data
  },

  create: async (data: ResponsableCreateData): Promise<Responsable> => {
    const response = await api.post<Responsable>("/responsables", data)
    return response.data
  },

  update: async (id: number, data: ResponsableCreateData): Promise<Responsable> => {
    const response = await api.put<Responsable>(`/responsables/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/responsables/${id}`)
  },
}
