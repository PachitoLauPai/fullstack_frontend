"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PenTool, Save, CheckCircle2, Eraser } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { usuarioService } from "@/services/usuario.service"
import { toast } from "sonner"

export default function PerfilPage() {
  const { user } = useAuth()
  const [firmaGuardada, setFirmaGuardada] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasFirma, setHasFirma] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    async function cargarFirma() {
      try {
        setIsLoading(true)
        const firma = await usuarioService.getMiFirma()
        if (firma && firma.trim() !== "") {
          setFirmaGuardada(firma)
          setHasFirma(true)
        }
      } catch {
        toast.error("Error al cargar firma guardada")
      } finally {
        setIsLoading(false)
      }
    }
    cargarFirma()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // El tamaño del canvas está definido inline en el JSX (600x150)
    // Solo configuramos el estilo de dibujo
    ctx.strokeStyle = "#1e3a5f"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    // El canvas tiene dimensiones fijas de 600x150
    ctx.clearRect(0, 0, 600, 150)
  }

  async function guardarFirma() {
    const canvas = canvasRef.current
    if (!canvas) return

    const firmaData = canvas.toDataURL("image/png")
    if (firmaData === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==") {
      toast.error("Por favor dibuja tu firma primero")
      return
    }

    try {
      setIsSaving(true)
      await usuarioService.guardarMiFirma(firmaData)
      setFirmaGuardada(firmaData)
      setHasFirma(true)
      toast.success("Firma guardada exitosamente")
    } catch {
      toast.error("Error al guardar la firma")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card>
          <CardContent className="p-6">
            <div className="h-40 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y firma digital
        </p>
      </div>

      <Card>
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Firma Digital
          </CardTitle>
          <CardDescription>
            Configura tu firma digital para usarla en las visitas. Solo necesitas hacerlo una vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {hasFirma && firmaGuardada && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Firma configurada</span>
              </div>
              <p className="text-sm text-green-600 mb-3">
                Ya tienes una firma guardada. Puedes usarla para firmar visitas o dibujar una nueva.
              </p>
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-muted-foreground mb-2">Tu firma actual:</p>
                <img src={firmaGuardada} alt="Firma guardada" className="max-h-24" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              {hasFirma ? "Dibujar nueva firma" : "Dibuja tu firma"}
            </Label>
            <div className="border-2 border-dashed rounded-lg p-1 bg-card">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full h-auto max-w-full cursor-crosshair touch-none bg-white"
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Firme con el mouse o dedo (en dispositivos tactiles)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex-1"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button
              onClick={guardarFirma}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Firma"}
            </Button>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Tu firma se guardará de forma segura y podrás usarla para firmar visitas sin necesidad de dibujarla cada vez.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle>Información de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">{user?.nombre} {user?.apellido}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Rol:</span>
              <span className="font-medium">{user?.rol}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
