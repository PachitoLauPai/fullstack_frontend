import api from "@/lib/api"

export interface Usuario {
  id: number
  email: string
  nombres: string
  apellidos: string
  idRol: number
  rol?: string
  nombreRol?: string
  dni?: string
  cargo?: string
  estado?: boolean
  createdAt?: string
}

export interface UsuarioCreateData {
  email: string
  nombres: string
  apellidos: string
  password?: string
  idRol: number
  dni?: string
  cargo?: string
}

export interface UsuarioUpdateData extends UsuarioCreateData {
  estado?: boolean
}

export const usuariosService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get<Usuario[]>("/usuarios")
    return response.data
  },

  create: async (data: UsuarioCreateData): Promise<Usuario> => {
    const response = await api.post<Usuario>("/usuarios", data)
    return response.data
  },

  update: async (id: number, data: UsuarioUpdateData): Promise<Usuario> => {
    const response = await api.put<Usuario>(`/usuarios/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/usuarios/${id}`)
  },
}
