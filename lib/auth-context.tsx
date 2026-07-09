"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { authService } from "@/services/auth.service"

export type UserRole = "ADMIN" | "AUDITOR" | "DOCENTE"

export interface User {
  id: number
  email: string
  nombre: string
  apellido: string
  rol: UserRole
  docenteId?: number
  responsableId?: number
  avatar?: string
}

interface JwtPayload {
  sub: string
  id: number
  rol: UserRole
  nombres: string
  apellidos: string
  idDocente?: number
  idResponsable?: number
  exp: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (allowedRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "auth_token"
const USER_KEY = "visitas_user"

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

function buildUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    console.log("AUTH DEBUG - Token decoded:", decoded)
    return {
      id: decoded.id,
      email: decoded.sub,
      nombre: decoded.nombres,
      apellido: decoded.apellidos,
      rol: decoded.rol,
      docenteId: decoded.idDocente,
      responsableId: decoded.idResponsable,
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)
    
    console.log("AUTH DEBUG - token exists:", !!token)
    console.log("AUTH DEBUG - storedUser exists:", !!storedUser)
    
    if (token && storedUser) {
      if (isTokenExpired(token)) {
        console.log("AUTH DEBUG - Token expired, clearing session")
        clearSession()
      } else {
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log("AUTH DEBUG - Loaded user from localStorage:", parsedUser)
          // Si el usuario no tiene nombre o apellido, reconstruir desde token
          if (!parsedUser.nombre || !parsedUser.apellido) {
            console.log("AUTH DEBUG - User missing nombre/apellido, rebuilding from token")
            const userFromToken = buildUserFromToken(token)
            if (userFromToken) {
              setUser(userFromToken)
              localStorage.setItem(USER_KEY, JSON.stringify(userFromToken))
            } else {
              setUser(parsedUser)
            }
          } else {
            setUser(parsedUser)
          }
        } catch {
          console.log("AUTH DEBUG - Failed to parse stored user")
          clearSession()
        }
      }
    } else if (token) {
      // Fallback: reconstruir desde token
      if (isTokenExpired(token)) {
        console.log("AUTH DEBUG - Token expired, clearing session")
        clearSession()
      } else {
        const userFromToken = buildUserFromToken(token)
        console.log("AUTH DEBUG - Built user from token:", userFromToken)
        if (userFromToken) {
          setUser(userFromToken)
          localStorage.setItem(USER_KEY, JSON.stringify(userFromToken))
        } else {
          clearSession()
        }
      }
    } else {
      console.log("AUTH DEBUG - No token found")
    }
    setIsLoading(false)
  }, [clearSession])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password })
      const { token } = response

      if (!token) {
        return { success: false, error: "No se recibio token de autenticacion" }
      }

      const userFromToken = buildUserFromToken(token)
      if (!userFromToken) {
        return { success: false, error: "Token invalido" }
      }

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userFromToken))
      setUser(userFromToken)

      return { success: true }
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      return { success: false, error: message || "Credenciales incorrectas" }
    }
  }

  const logout = () => {
    clearSession()
    router.push("/login")
  }

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false
    return allowedRoles.includes(user.rol)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const ROLE_PERMISSIONS = {
  ADMIN: {
    label: "Administrador",
    description: "Acceso completo al sistema",
    routes: [
      "/dashboard",
      "/visitas",
      "/visitas/nueva",
      "/requerimientos",
      "/docentes",
      "/responsables",
      "/asignaturas",
      "/sedes",
      "/reportes",
      "/usuarios",
      "/configuracion",
    ],
  },
  AUDITOR: {
    label: "Evaluador",
    description: "Gestiona visitas y requerimientos",
    routes: [
      "/dashboard",
      "/visitas",
      "/visitas/nueva",
      "/requerimientos",
      "/docentes",
      "/asignaturas",
      "/reportes",
    ],
  },
  DOCENTE: {
    label: "Docente",
    description: "Consulta sus visitas y requerimientos",
    routes: [
      "/dashboard",
      "/visitas",
      "/requerimientos",
    ],
  },
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.routes.some(r => route.startsWith(r))
}
