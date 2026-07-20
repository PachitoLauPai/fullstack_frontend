"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, AlertCircle, User } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        toast.success("Sesión iniciada correctamente")
        router.push("/dashboard")
      } else {
        setError(result.error || "Error al iniciar sesión")
        toast.error(result.error || "Error al iniciar sesión")
      }
    } catch {
      setError("Error inesperado. Intenta nuevamente.")
      toast.error("Error inesperado. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f0f5ff] items-center justify-center p-12 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-indigo-100/50 pointer-events-none" />
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center">
          <img
            src="/web-login-pao.svg"
            alt="Ilustración UTP"
            className="w-full max-h-[70vh] object-contain drop-shadow-sm transform hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header with Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-1.5 text-3xl font-extrabold tracking-tight select-none">
              <span className="bg-black text-white px-2 py-0.5 rounded-sm text-2xl font-bold">UTP</span>
              <span className="text-[#ff003c] font-black text-3xl">+</span>
              <span className="text-black dark:text-white font-semibold text-2xl">Visitas Inopinadas</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Sistema de Visitas
              </h1>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                Cercana, dinámica y flexible
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingresa tus datos para <span className="font-semibold text-slate-800 dark:text-slate-200">iniciar sesión</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Usuario o Correo Institucional
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@universidad.edu.pe"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="pr-10 h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-[#0066ff] focus-visible:border-[#0066ff] rounded-md"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Ejemplo: admin@universidad.edu.pe (digitar completo)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10 h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-[#0066ff] focus-visible:border-[#0066ff] rounded-md"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info("Por favor, ponte en contacto con el administrador del sistema para restablecer tu contraseña.")
                    }}
                    className="text-xs font-semibold text-[#0066ff] hover:underline"
                  >
                    Restablecer contraseña
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#0066ff] hover:bg-[#0052cc] text-white font-semibold rounded-md shadow-sm transition-all focus-visible:ring-[#0066ff]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              UTP - Sistema de Visitas Inopinadas © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
