import api from "@/lib/api"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
  nombres: string
  apellidos: string
  rol: string
  idDocente: number | null
  idResponsable: number | null
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data)
    return response.data
  },
}
