import axios from "axios"
import { toast } from "sonner"

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
if (API_BASE_URL.endsWith("/")) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}
if (!API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response
      const message = error.response.data?.message || error.message

      switch (status) {
        case 401:
          toast.error("Sesion expirada. Por favor, inicia sesion nuevamente.")
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            window.location.href = "/login"
          }
          break
        case 403:
          toast.error("No tienes permisos para realizar esta accion.")
          break
        case 500:
          toast.error("Error del servidor. Intenta mas tarde.")
          break
        default:
          toast.error(message || "Ocurrio un error inesperado.")
      }
    } else if (error.request) {
      toast.error("No se pudo conectar con el servidor. Verifica tu conexion.")
    }

    return Promise.reject(error)
  }
)

export default api
