"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, Clock, FileText, MapPin, PenTool, User, BookOpen, Users, BarChart3, ClipboardList } from "lucide-react"
import { visitasService, type Visita } from "@/services/visitas.service"
import { usuarioService } from "@/services/usuario.service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const estadoConfig: Record<string, { label: string; className: string }> = {
  BORRADOR: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  FIRMADA_DOCENTE: { label: "Firmada por Docente", className: "bg-primary text-primary-foreground" },
  COMPLETADA: { label: "Completada", className: "bg-success text-success-foreground" },
  AUDITADA: { label: "Auditada", className: "bg-info text-info-foreground" },
}

export default function VisitaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [visita, setVisita] = useState<Visita | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [showFirmaModal, setShowFirmaModal] = useState(false)
  const [firmaGuardada, setFirmaGuardada] = useState<string | null>(null)
  const [isLoadingFirma, setIsLoadingFirma] = useState(false)

  const id = Number(params.id)

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError("ID de visita invalido")
      setIsLoading(false)
      return
    }

    async function fetchVisita() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await visitasService.getById(id)
        setVisita(data)
      } catch {
        setError("No se pudo cargar la visita.")
        toast.error("Error al cargar la visita")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisita()
  }, [id])

  async function handleFirmaDocente() {
    try {
      setIsLoadingFirma(true)
      // Verificar si tiene firma guardada
      const firma = await usuarioService.getMiFirma()
      if (firma && firma.trim() !== "") {
        // Usar firma guardada
        setFirmaGuardada(firma)
        setShowFirmaModal(true)
      } else {
        // No tiene firma, mostrar modal para crearla
        setFirmaGuardada(null)
        setShowFirmaModal(true)
      }
    } catch {
      toast.error("Error al verificar firma guardada")
    } finally {
      setIsLoadingFirma(false)
    }
  }

  async function confirmarFirmaConFirmaGuardada() {
    if (!firmaGuardada) return
    try {
      setIsSigning(true)
      setShowFirmaModal(false)
      await visitasService.firmarDocente(visita!.id, firmaGuardada)
      toast.success("Visita firmada correctamente como docente")
      const updated = await visitasService.getById(visita!.id)
      setVisita(updated)
    } catch {
      toast.error("Error al firmar la visita")
    } finally {
      setIsSigning(false)
    }
  }

  async function handleFirmaAuditor() {
    try {
      setIsLoadingFirma(true)
      // Verificar si tiene firma guardada
      const firma = await usuarioService.getMiFirma()
      if (firma && firma.trim() !== "") {
        setFirmaGuardada(firma)
        setShowFirmaModal(true)
      } else {
        setFirmaGuardada(null)
        setShowFirmaModal(true)
      }
    } catch {
      toast.error("Error al verificar firma guardada")
    } finally {
      setIsLoadingFirma(false)
    }
  }

  async function confirmarFirmaAuditorConFirmaGuardada() {
    if (!firmaGuardada) return
    try {
      setIsSigning(true)
      setShowFirmaModal(false)
      await visitasService.firmarAuditor(visita!.id, firmaGuardada)
      toast.success("Visita firmada correctamente como auditor")
      const updated = await visitasService.getById(visita!.id)
      setVisita(updated)
    } catch {
      toast.error("Error al firmar la visita")
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60" />
      </div>
    )
  }

  if (error || !visita) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Error al cargar la visita</h3>
        <p className="text-sm text-muted-foreground mt-1">{error || "No se encontro la visita solicitada."}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/visitas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a visitas
          </Link>
        </Button>
      </div>
    )
  }

  const estado = estadoConfig[visita.estadoVisita] || estadoConfig.BORRADOR
  const isDocente = user?.rol === "DOCENTE"
  const isAuditor = user?.rol === "AUDITOR"
  const isAdmin = user?.rol === "ADMIN"

  const canFirmarDocente = isDocente && visita.estadoVisita === "BORRADOR"
  const canFirmarAuditor = isAuditor && visita.estadoVisita === "FIRMADA_DOCENTE"
  const showEvaluaciones = isDocente || isAuditor || isAdmin

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/visitas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Detalle de Visita
          </h1>
          <p className="text-muted-foreground">
            VIS-{String(visita.id).padStart(3, "0")}
          </p>
        </div>
        <Badge className={estado.className}>{estado.label}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informacion general */}
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Informacion General
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Docente:</span>
              <span className="font-medium">{visita.nombreDocente} {visita.apellidosDocente}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Asignatura:</span>
              <span className="font-medium">{visita.nombreAsignatura}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Sede:</span>
              <span className="font-medium">{visita.nombreSede}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Auditor:</span>
              <span className="font-medium">{visita.nombreAuditor}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Responsable:</span>
              <span className="font-medium">{visita.nombreResponsable}</span>
            </div>
          </CardContent>
        </Card>

        {/* Fecha y horario */}
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Fecha y Horario
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium">{visita.fechaVisita}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Hora inicio:</span>
              <span className="font-medium">{visita.horaInicio}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Hora termino:</span>
              <span className="font-medium">{visita.horaTermino}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Tipo de clase:</span>
              <span className="font-medium">{visita.tipoClase}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Lugar:</span>
              <span className="font-medium">{visita.lugarVisita || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firmas */}
      <Card>
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <PenTool className="h-5 w-5" />
            Firmas
          </CardTitle>
          <CardDescription>
            Estado de las firmas digitales de la visita
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Firma del Docente</span>
              </div>
              {visita.firmaDocenteHash ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Firmado el {visita.fechaFirmaDocente || "N/A"}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Pendiente de firma
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Firma del Auditor</span>
              </div>
              {visita.firmaResponsableHash ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Firmado el {visita.fechaFirmaResponsable || "N/A"}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Pendiente de firma
                </div>
              )}
            </div>
          </div>

          {/* Botones de firma */}
          <div className="flex flex-wrap gap-3 mt-4">
            {canFirmarDocente && (
              <Button onClick={handleFirmaDocente} disabled={isSigning}>
                <PenTool className="h-4 w-4 mr-2" />
                {isSigning ? "Firmando..." : "Firmar como Docente"}
              </Button>
            )}
            {canFirmarAuditor && (
              <Button onClick={handleFirmaAuditor} disabled={isSigning}>
                <PenTool className="h-4 w-4 mr-2" />
                {isSigning ? "Firmando..." : "Firmar como Auditor"}
              </Button>
            )}
            {!canFirmarDocente && !canFirmarAuditor && visita.estadoVisita === "COMPLETADA" && (
              <p className="text-sm text-muted-foreground">
                Visita completada. No se requieren mas acciones.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {visita.evidenciaImagenHash && (
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Evidencia Fotográfica
            </CardTitle>
            <CardDescription>
              Imagen cargada como evidencia de la visita.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg border overflow-hidden bg-card">
              <img
                src={visita.evidenciaImagenHash}
                alt="Evidencia de la visita"
                className="w-full object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluaciones - Solo para Auditor y Admin */}
      {showEvaluaciones && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Evaluaciones de la Visita</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Evaluación Control Docente */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5" />
                  Control del Docente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                {visita.evaluacionControlDocente ? (
                  <>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Docente presente:</span>
                      <Badge variant={visita.evaluacionControlDocente.docentePresente ? "default" : "destructive"}>
                        {visita.evaluacionControlDocente.docentePresente ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Horario cumplido:</span>
                      <Badge variant={visita.evaluacionControlDocente.horarioCumplido ? "default" : "destructive"}>
                        {visita.evaluacionControlDocente.horarioCumplido ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Interacción adecuada:</span>
                      <Badge variant={visita.evaluacionControlDocente.interaccionAdecuada ? "default" : "destructive"}>
                        {visita.evaluacionControlDocente.interaccionAdecuada ? "Sí" : "No"}
                      </Badge>
                    </div>
                    {visita.evaluacionControlDocente.actividadDesarrollada && (
                      <div className="pt-2">
                        <span className="text-muted-foreground">Actividad desarrollada:</span>
                        <p className="text-sm mt-1">{visita.evaluacionControlDocente.actividadDesarrollada}</p>
                      </div>
                    )}
                    {visita.evaluacionControlDocente.observaciones && (
                      <div className="pt-2">
                        <span className="text-muted-foreground">Observaciones:</span>
                        <p className="text-sm mt-1">{visita.evaluacionControlDocente.observaciones}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay evaluación registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Evaluación Material Virtual */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5" />
                  Material Virtual
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                {visita.evaluacionMaterialVirtual ? (
                  <>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Cumple requisitos:</span>
                      <Badge variant={visita.evaluacionMaterialVirtual.cumple ? "default" : "destructive"}>
                        {visita.evaluacionMaterialVirtual.cumple ? "Sí" : "No"}
                      </Badge>
                    </div>
                    {visita.evaluacionMaterialVirtual.observaciones && (
                      <div className="pt-2">
                        <span className="text-muted-foreground">Observaciones:</span>
                        <p className="text-sm mt-1">{visita.evaluacionMaterialVirtual.observaciones}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay evaluación registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Evaluación Asistencia Estudiantes */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5" />
                  Control de Asistencia de Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                {visita.evaluacionAsistenciaEstudiantes ? (
                  <>
                    {/* Control en Ambiente */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2 text-primary">Control en Ambiente</h4>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Cumple:</span>
                        <Badge variant={visita.evaluacionAsistenciaEstudiantes.ambienteCumple === "CUMPLE" ? "default" : "destructive"}>
                          {visita.evaluacionAsistenciaEstudiantes.ambienteCumple || "No registrado"}
                        </Badge>
                      </div>
                      {visita.evaluacionAsistenciaEstudiantes.ambienteObservaciones && (
                        <div className="pt-2">
                          <span className="text-muted-foreground">Observaciones:</span>
                          <p className="text-sm mt-1">{visita.evaluacionAsistenciaEstudiantes.ambienteObservaciones}</p>
                        </div>
                      )}
                    </div>

                    {/* Control en Intranet */}
                    <div className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2 text-primary">Control en Intranet</h4>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Cumple:</span>
                        <Badge variant={visita.evaluacionAsistenciaEstudiantes.intranetCumple === "CUMPLE" ? "default" : "destructive"}>
                          {visita.evaluacionAsistenciaEstudiantes.intranetCumple || "No registrado"}
                        </Badge>
                      </div>
                      {visita.evaluacionAsistenciaEstudiantes.intranetObservaciones && (
                        <div className="pt-2">
                          <span className="text-muted-foreground">Observaciones:</span>
                          <p className="text-sm mt-1">{visita.evaluacionAsistenciaEstudiantes.intranetObservaciones}</p>
                        </div>
                      )}
                    </div>

                    {/* Observaciones Generales */}
                    {visita.evaluacionAsistenciaEstudiantes.observacionesGenerales && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground font-medium">Observaciones Generales:</span>
                        <p className="text-sm mt-1">{visita.evaluacionAsistenciaEstudiantes.observacionesGenerales}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay evaluación registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Evaluación Avance Silábico */}
            <Card>
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" />
                  Avance Silábico
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                {visita.evaluacionAvanceSilabico ? (
                  <>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Tema coincide con visita:</span>
                      <Badge variant={visita.evaluacionAvanceSilabico.temaCoincideVisita ? "default" : "destructive"}>
                        {visita.evaluacionAvanceSilabico.temaCoincideVisita ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Tema coincide con anterior:</span>
                      <Badge variant={visita.evaluacionAvanceSilabico.temaCoincideAnterior ? "default" : "destructive"}>
                        {visita.evaluacionAvanceSilabico.temaCoincideAnterior ? "Sí" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Ingreso aula virtual:</span>
                      <Badge variant={visita.evaluacionAvanceSilabico.ingresoAulaVirtual ? "default" : "destructive"}>
                        {visita.evaluacionAvanceSilabico.ingresoAulaVirtual ? "Sí" : "No"}
                      </Badge>
                    </div>
                    {visita.evaluacionAvanceSilabico.observaciones && (
                      <div className="pt-2">
                        <span className="text-muted-foreground">Observaciones:</span>
                        <p className="text-sm mt-1">{visita.evaluacionAvanceSilabico.observaciones}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No hay evaluación registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Evaluación Guía Práctica */}
            {visita.evaluacionGuiaPractica && (
              <Card>
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList className="h-5 w-5" />
                    Guía Práctica
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Tema programado cumple:</span>
                    <Badge variant={visita.evaluacionGuiaPractica.temaProgramadoCumple === "CUMPLE" ? "default" : "destructive"}>
                      {visita.evaluacionGuiaPractica.temaProgramadoCumple}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Logro evidenciado:</span>
                    <Badge variant={visita.evaluacionGuiaPractica.logroEvidenciado === "CUMPLE" ? "default" : "destructive"}>
                      {visita.evaluacionGuiaPractica.logroEvidenciado}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Rúbrica evaluación:</span>
                    <Badge variant={visita.evaluacionGuiaPractica.rubricaEvaluacion === "CUMPLE" ? "default" : "destructive"}>
                      {visita.evaluacionGuiaPractica.rubricaEvaluacion}
                    </Badge>
                  </div>
                  {visita.evaluacionGuiaPractica.observaciones && (
                    <div className="pt-2">
                      <span className="text-muted-foreground">Observaciones:</span>
                      <p className="text-sm mt-1">{visita.evaluacionGuiaPractica.observaciones}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Requerimientos */}
      {visita.requerimientos && visita.requerimientos.length > 0 && (
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-5 w-5" />
              Requerimientos de la Visita
            </CardTitle>
            <CardDescription>
              {visita.requerimientos.length} requerimiento{visita.requerimientos.length !== 1 ? "s" : ""} registrado{visita.requerimientos.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {visita.requerimientos.map((req) => (
                <div key={req.id} className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{req.descripcion}</p>
                    <Badge variant={req.estado === "ATENDIDO" ? "default" : "secondary"}>
                      {req.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fecha solicitud: {new Date(req.fechaSolicitud).toLocaleDateString("es-PE")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Firma */}
      <Dialog open={showFirmaModal} onOpenChange={setShowFirmaModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Firmar Visita</DialogTitle>
            <DialogDescription>
              {firmaGuardada
                ? "¿Deseas usar tu firma guardada para firmar esta visita?"
                : "No tienes una firma guardada. Por favor, configura tu firma en tu perfil primero."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            {firmaGuardada && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Tu firma guardada:</p>
                <img src={firmaGuardada} alt="Firma guardada" className="max-h-24 border rounded" />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowFirmaModal(false)}>
                Cancelar
              </Button>
              {firmaGuardada ? (
                <Button
                  onClick={user?.rol === "DOCENTE" ? confirmarFirmaConFirmaGuardada : confirmarFirmaAuditorConFirmaGuardada}
                  disabled={isSigning}
                >
                  {isSigning ? "Firmando..." : "Confirmar Firma"}
                </Button>
              ) : (
                <Button onClick={() => router.push("/perfil")}>
                  Ir a Perfil para Configurar Firma
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function generateStaticParams() {
  return []; // Le dice a Next.js que no fabrique ningún ID fijo en el build
}