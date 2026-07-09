"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { requerimientosService, type RequerimientoVisita } from "@/services/requerimientos.service"
import { evidenciasService, type EvidenciaRequerimiento } from "@/services/evidencias.service"
import {
  AlertCircle,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  FileText,
  Filter,
  Upload,
  FileCheck,
  X,
  Download,
  Trash2,
} from "lucide-react"

const estadoConfig = {
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  en_proceso: {
    label: "En Proceso",
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  atendido: {
    label: "Atendido",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rechazado: {
    label: "Rechazado",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
}

const normalizeEstado = (estado?: string) =>
  estado?.toLowerCase().replace(" ", "_") as keyof typeof estadoConfig

export default function RequerimientosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isDocente = user?.rol === "DOCENTE"
  const canRespond = isDocente // Solo docente puede responder/attender requerimientos

  const [requerimientos, setRequerimientos] = useState<RequerimientoVisita[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [selectedReq, setSelectedReq] = useState<RequerimientoVisita | null>(null)
  const [respuesta, setRespuesta] = useState("")
  const [nuevoEstado, setNuevoEstado] = useState<string>("")
  const [archivos, setArchivos] = useState<File[]>([])
  const [evidencias, setEvidencias] = useState<EvidenciaRequerimiento[]>([])
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cargarRequerimientos()
  }, [])

  const cargarRequerimientos = async () => {
    try {
      setLoading(true)
      let data: RequerimientoVisita[]
      if (isDocente) {
        data = await requerimientosService.listMisRequerimientos()
      } else if (user?.rol === "AUDITOR") {
        data = await requerimientosService.listRequerimientosDeMisVisitas()
      } else {
        data = await requerimientosService.listAll()
      }
      setRequerimientos(data)
    } catch (error) {
      console.error("Error al cargar requerimientos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los requerimientos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isResponderDisabled = !respuesta.trim()

  const cargarEvidencias = async (idRequerimiento: number) => {
    try {
      setCargandoEvidencias(true)
      const data = await evidenciasService.listPorRequerimiento(idRequerimiento)
      setEvidencias(data)
    } catch (error) {
      console.error("Error al cargar evidencias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las evidencias",
        variant: "destructive",
      })
    } finally {
      setCargandoEvidencias(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const nuevosArchivos = Array.from(e.dataTransfer.files).filter(
        (file) => file.size <= 10 * 1024 * 1024
      ) // Máximo 10MB
      if (nuevosArchivos.length > 0) {
        setArchivos((prev) => [...prev, ...nuevosArchivos])
      } else {
        toast({
          title: "Error",
          description: "Los archivos deben ser menores a 10MB",
          variant: "destructive",
        })
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const nuevosArchivos = Array.from(e.target.files).filter(
        (file) => file.size <= 10 * 1024 * 1024
      ) // Máximo 10MB
      if (nuevosArchivos.length > 0) {
        setArchivos((prev) => [...prev, ...nuevosArchivos])
      } else {
        toast({
          title: "Error",
          description: "Los archivos deben ser menores a 10MB",
          variant: "destructive",
        })
      }
    }
  }

  const removeArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubirEvidencia = async (archivo: File) => {
    if (!selectedReq) return
    try {
      await evidenciasService.subirEvidencia(
        selectedReq.id,
        archivo,
        undefined  // sin descripción adicional
      )
      toast({
        title: "Éxito",
        description: "Evidencia subida correctamente",
      })
      await cargarEvidencias(selectedReq.id)
      setArchivos([])
    } catch (error) {
      console.error("Error al subir evidencia:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive",
      })
    }
  }

  const handleEliminarEvidencia = async (idEvidencia: number) => {
    try {
      await evidenciasService.eliminar(idEvidencia)
      toast({
        title: "Éxito",
        description: "Evidencia eliminada",
      })
      if (selectedReq) {
        await cargarEvidencias(selectedReq.id)
      }
    } catch (error) {
      console.error("Error al eliminar evidencia:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive",
      })
    }
  }

  const handleDescargarEvidencia = async (evidencia: EvidenciaRequerimiento) => {
    try {
      const blob = await evidenciasService.descargarArchivo(evidencia.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", evidencia.nombreArchivo)
      document.body.appendChild(link)
      link.click()
      link.parentElement?.removeChild(link)
    } catch (error) {
      console.error("Error al descargar:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo",
        variant: "destructive",
      })
    }
  }

  const handleResponder = async () => {
    if (!selectedReq) return

    if (!respuesta.trim()) {
      toast({
        title: "Error",
        description: "Completa el campo de respuesta antes de guardar",
        variant: "destructive",
      })
      return
    }

    try {
      if (isDocente) {
        // Docente atiende el requerimiento
        await requerimientosService.atender(selectedReq.id, respuesta.trim())
        
        // Subir archivos de evidencia
        if (archivos.length > 0) {
          for (const archivo of archivos) {
            await handleSubirEvidencia(archivo)
          }
        }
      } else {
        // Admin/Auditor ya no pueden modificar requerimientos
        toast({
          title: "No permitido",
          description: "Solo el docente puede atender requerimientos",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Éxito",
        description: "Requerimiento actualizado correctamente",
      })
      setSelectedReq(null)
      setRespuesta("")
      setNuevoEstado("")
      setArchivos([])
      cargarRequerimientos()
    } catch (error) {
      console.error("Error al responder requerimiento:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el requerimiento",
        variant: "destructive",
      })
    }
  }

  const handleOpenRequerimiento = (req: RequerimientoVisita) => {
    setSelectedReq(req)
    setRespuesta(req.respuesta || "")
    setNuevoEstado(req.estado?.toLowerCase() || "pendiente")
    setArchivos([])
    cargarEvidencias(req.id)
  }

  const filteredRequerimientos = requerimientos.filter((req) => {
    const matchSearch =
      req.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.nombreDocente ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.nombreAsignatura ?? "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchEstado = filterEstado === "todos" || req.estado?.toLowerCase() === filterEstado

    return matchSearch && matchEstado
  })

  const stats = {
    total: requerimientos.length,
    pendientes: requerimientos.filter((r: RequerimientoVisita) => r.estado?.toLowerCase() === "pendiente").length,
    enProceso: requerimientos.filter((r: RequerimientoVisita) => r.estado?.toLowerCase() === "en_proceso").length,
    atendidos: requerimientos.filter((r: RequerimientoVisita) => r.estado?.toLowerCase() === "atendido").length,
    rechazados: requerimientos.filter((r: RequerimientoVisita) => r.estado?.toLowerCase() === "rechazado").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isDocente ? "Mis Requerimientos" : "Requerimientos de Visitas"}
          </h1>
          <p className="text-muted-foreground">
            {isDocente
              ? "Requerimientos solicitados en las visitas a tus clases"
              : "Seguimiento de requerimientos solicitados durante las visitas inopinadas"
            }
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> En Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.enProceso}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Atendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.atendidos}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Rechazados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rechazados}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Requerimientos
          </CardTitle>
          <CardDescription>
            Gestione y de seguimiento a los requerimientos de las visitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripcion, docente o asignatura..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="atendido">Atendidos</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Descripcion</TableHead>
                  <TableHead className="w-[25%]">Asignatura</TableHead>
                  <TableHead className="w-20 text-center">Fecha</TableHead>
                  <TableHead className="w-24 text-center">Estado</TableHead>
                  <TableHead className="w-24 text-center">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequerimientos
                .sort((a, b) => new Date(b.fechaSolicitud || 0).getTime() - new Date(a.fechaSolicitud || 0).getTime())
                .map((req) => {
                  const estadoKey = normalizeEstado(req.estado)
                  const config = estadoConfig[estadoKey] || estadoConfig.pendiente
                  const EstadoIcon = config.icon
                  const isPendiente = req.estado?.toLowerCase() === "pendiente" || req.estado?.toLowerCase() === "en_proceso"

                  return (
                    <TableRow key={req.id} className="hover:bg-muted/50">
                      <TableCell>
                        <p className="text-sm leading-snug" title={req.descripcion}>
                          {req.descripcion.length > 90 
                            ? req.descripcion.substring(0, 90) + "..." 
                            : req.descripcion}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium truncate" title={req.nombreAsignatura || ""}>{req.nombreAsignatura}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.nombreSede}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground text-center whitespace-nowrap">
                        {req.fechaSolicitud
                          ? new Date(req.fechaSolicitud).toLocaleDateString("es-PE", { day: '2-digit', month: '2-digit', year: '2-digit' })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={`${config.color} text-xs px-2 py-0.5`}>
                          <EstadoIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant={canRespond && isPendiente ? "default" : "ghost"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleOpenRequerimiento(req)}
                        >
                          {canRespond && isPendiente ? "Atender" : "Ver"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedReq}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReq(null)
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Requerimiento #{selectedReq?.id}</DialogTitle>
            <DialogDescription>
              Visita #{selectedReq?.idVisita} - {selectedReq?.nombreSede}
            </DialogDescription>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-3 py-2">
              <div className="p-2 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Descripcion del requerimiento:</Label>
                <p className="mt-0.5 text-sm">{selectedReq.descripcion}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Docente:</Label>
                  <p className="font-medium text-xs">{selectedReq.nombreDocente}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Asignatura:</Label>
                  <p className="font-medium text-xs">{selectedReq.nombreAsignatura}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha:</Label>
                  <p className="font-medium text-xs">
                    {selectedReq.fechaSolicitud
                      ? new Date(selectedReq.fechaSolicitud).toLocaleDateString("es-PE")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estado:</Label>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1 py-0.5 ${
                      estadoConfig[normalizeEstado(selectedReq.estado)]?.color ||
                      estadoConfig.pendiente.color
                    }`}
                  >
                    {estadoConfig[normalizeEstado(selectedReq.estado)]?.label || "Pendiente"}
                  </Badge>
                </div>
              </div>

              {selectedReq.respuesta && (
                <div className="p-2 bg-accent/10 border border-accent/20 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Respuesta:</Label>
                  <p className="mt-0.5 text-sm">{selectedReq.respuesta}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Respondido: {selectedReq.fechaRespuesta && new Date(selectedReq.fechaRespuesta).toLocaleDateString("es-PE")}
                  </p>
                </div>
              )}

              {/* Mostrar evidencias cargadas (para requerimientos atendidos) */}
              {evidencias.length > 0 && selectedReq?.estado?.toLowerCase() === "atendido" && (
                <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                  <Label className="text-xs text-green-900 dark:text-green-300 font-medium flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Evidencias adjuntas: {evidencias.length}
                  </Label>
                  <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
                    {evidencias.map((evidencia) => (
                      <div key={evidencia.id} className="bg-white dark:bg-slate-900 p-1.5 rounded border border-green-100 dark:border-green-900/50">
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-start gap-1 flex-1 min-w-0">
                            <FileText className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium break-all">{evidencia.nombreArchivo}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(evidencia.fechaCarga).toLocaleDateString("es-PE")}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleDescargarEvidencia(evidencia)}
                            title="Descargar"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canRespond && selectedReq?.estado?.toLowerCase() !== "atendido" && (
                <div className="space-y-2 border-t pt-2">
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 flex items-center gap-1 text-sm">
                      <FileCheck className="h-3 w-3" />
                      Atender Requerimiento
                    </h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Describe las acciones realizadas y adjunta evidencia.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="respuesta" className="text-xs">Descripción de acciones:</Label>
                    <Textarea
                      id="respuesta"
                      placeholder="Ej: Actualicé la guía y subí el archivo..."
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      rows={2}
                      className="text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Evidencia adjunta:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors cursor-pointer ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-muted-foreground/25 hover:bg-muted/50"}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileInput}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Arrastra o haz clic
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          (máx. 10MB)
                        </p>
                      </div>

                      <div>
                        {archivos.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {archivos.map((archivo, index) => {
                              const isImage = archivo.type.startsWith("image/")
                              const previewUrl = isImage ? URL.createObjectURL(archivo) : null
                              
                              return (
                                <div key={index} className="bg-muted p-1.5 rounded border border-muted-foreground/20">
                                  <div className="flex items-start justify-between gap-1">
                                    <div className="flex items-start gap-1 flex-1 min-w-0">
                                      <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium break-all">{archivo.name}</p>
                                        <span className="text-xs text-muted-foreground">
                                          ({(archivo.size / 1024).toFixed(1)}KB)
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="flex-shrink-0 h-5 w-5 p-0"
                                      onClick={() => removeArchivo(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {isImage && previewUrl && (
                                    <div className="mt-1">
                                      <img 
                                        src={previewUrl} 
                                        alt={archivo.name}
                                        className="max-h-20 rounded object-contain bg-white border"
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mostrar evidencias ya cargadas */}
                    {evidencias.length > 0 && (
                      <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                        <Label className="text-xs text-green-900 dark:text-green-300 font-medium">
                          Evidencias: {evidencias.length} cargada(s)
                        </Label>
                        <div className="space-y-1 mt-1 max-h-28 overflow-y-auto">
                          {evidencias.map((evidencia) => {
                            const isImage = evidencia.tipoArchivo?.startsWith("image/")
                            
                            return (
                              <div key={evidencia.id} className="bg-white dark:bg-slate-900 p-1.5 rounded border border-green-100 dark:border-green-900/50">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-start gap-1 flex-1 min-w-0">
                                    <FileText className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium break-all">{evidencia.nombreArchivo}</p>
                                      {evidencia.descripcion && (
                                        <p className="text-xs text-muted-foreground">{evidencia.descripcion}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(evidencia.fechaCarga).toLocaleDateString("es-PE")}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={() => handleDescargarEvidencia(evidencia)}
                                      title="Descargar"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    {canRespond && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0"
                                        onClick={() => handleEliminarEvidencia(evidencia.id)}
                                        title="Eliminar"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                {isImage && (
                                  <div className="mt-1">
                                    <img 
                                      src={evidenciasService.obtenerUrlPreview(evidencia.id)}
                                      alt={evidencia.nombreArchivo}
                                      className="max-h-16 rounded object-contain bg-white border border-green-100"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1 text-center">
                                      Haz clic en descargar para obtener la imagen en tamaño completo
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!respuesta.trim() && (
                    <p className="text-sm text-red-600">Debes describir las acciones tomadas antes de atender el requerimiento.</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-1 pt-1">
            <Button variant="outline" onClick={() => setSelectedReq(null)} size="sm">
              Cerrar
            </Button>
            {canRespond && selectedReq?.estado?.toLowerCase() !== "atendido" && (
              <Button 
                disabled={isResponderDisabled} 
                onClick={handleResponder}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Guardar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
