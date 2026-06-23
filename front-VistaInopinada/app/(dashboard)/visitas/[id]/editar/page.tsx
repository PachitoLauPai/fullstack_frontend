"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { visitasService, type Visita, type VisitaCreateData } from "@/services/visitas.service"
import { sedesService, type Sede } from "@/services/sedes.service"
import { docentesService, type Docente } from "@/services/docentes.service"
import { asignaturasService, type Asignatura } from "@/services/asignaturas.service"
import { responsablesService, type Responsable } from "@/services/responsables.service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function EditarVisitaPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const visitaId = Number(params.id)

  const [visita, setVisita] = useState<Visita | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sedes, setSedes] = useState<Sede[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [responsables, setResponsables] = useState<Responsable[]>([])

  const [formData, setFormData] = useState<VisitaCreateData>({
    fechaVisita: "",
    horaInicio: "",
    horaTermino: "",
    semanaNumero: null,
    lugarVisita: "",
    tipoClase: "PRESENCIAL",
    idSede: 0,
    idDocente: 0,
    idAsignatura: 0,
    idResponsable: 0,
  })

  useEffect(() => {
    if (!user || user.rol !== "AUDITOR") {
      toast.error("No tienes permisos para editar visitas")
      router.push("/visitas")
      return
    }

    cargarDatos()
  }, [user, visitaId])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [visitaData, sedesData, docentesData, asignaturasData, responsablesData] = await Promise.all([
        visitasService.getById(visitaId),
        sedesService.getAll(),
        docentesService.getAll(),
        asignaturasService.getAll(),
        responsablesService.getAll(),
      ])

      setVisita(visitaData)
      setSedes(sedesData)
      setDocentes(docentesData)
      setAsignaturas(asignaturasData)
      setResponsables(responsablesData)

      // Cargar datos al formulario
      setFormData({
        fechaVisita: visitaData.fechaVisita,
        horaInicio: visitaData.horaInicio,
        horaTermino: visitaData.horaTermino,
        semanaNumero: visitaData.semanaNumero,
        lugarVisita: visitaData.lugarVisita || "",
        tipoClase: visitaData.tipoClase as "PRESENCIAL" | "VIRTUAL" | "HIBRIDA",
        idSede: visitaData.idSede ?? 0,
        idDocente: visitaData.idDocente ?? 0,
        idAsignatura: visitaData.idAsignatura ?? 0,
        idResponsable: visitaData.idResponsable ?? 0,
      })

      // Verificar si se puede editar (solo BORRADOR)
      if (visitaData.estadoVisita !== "BORRADOR") {
        toast.error("Solo se pueden editar visitas en estado BORRADOR")
        router.push(`/visitas/${visitaId}`)
        return
      }

      // Verificar que sea el creador
      const visitaAuditorId = Number(visitaData.idUsuarioAuditor)
      const currentUserId = Number(user?.id)
      
      console.log("Verificando propiedad de visita:", {
        visitaAuditorId,
        currentUserId,
        visitaId: visitaData.id,
        userRol: user?.rol,
        userId: user?.id,
        idUsuarioAuditor: visitaData.idUsuarioAuditor
      })
      
      if (visitaAuditorId !== currentUserId) {
        toast.error(`No puedes editar visitas de otros evaluadores (Visita: ${visitaAuditorId}, Tú: ${currentUserId})`)
        router.push(`/visitas/${visitaId}`)
        return
      }
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar la visita")
      router.push("/visitas")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await visitasService.update(visitaId, formData)
      toast.success("Visita actualizada correctamente")
      router.push(`/visitas/${visitaId}`)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!visita) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontró la visita</p>
        <Button asChild className="mt-4">
          <Link href="/visitas">Volver a visitas</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/visitas/${visitaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Visita</h1>
          <p className="text-muted-foreground">Modifica los datos de la visita</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Datos básicos de la visita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaVisita">Fecha de Visita *</Label>
                <Input
                  id="fechaVisita"
                  type="date"
                  value={formData.fechaVisita}
                  onChange={(e) => setFormData({ ...formData, fechaVisita: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semanaNumero">Semana</Label>
                <Input
                  id="semanaNumero"
                  type="number"
                  value={formData.semanaNumero || ""}
                  onChange={(e) => setFormData({ ...formData, semanaNumero: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Número de semana"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora Inicio *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaTermino">Hora Término *</Label>
                <Input
                  id="horaTermino"
                  type="time"
                  value={formData.horaTermino}
                  onChange={(e) => setFormData({ ...formData, horaTermino: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugarVisita">Lugar de Visita</Label>
              <Input
                id="lugarVisita"
                value={formData.lugarVisita || ""}
                onChange={(e) => setFormData({ ...formData, lugarVisita: e.target.value || null })}
                placeholder="Ej: Aula 301, Laboratorio A, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoClase">Tipo de Clase *</Label>
              <Select
                value={formData.tipoClase}
                onValueChange={(value) => setFormData({ ...formData, tipoClase: value as "PRESENCIAL" | "VIRTUAL" | "HIBRIDA" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                  <SelectItem value="HIBRIDA">Híbrida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asignaciones</CardTitle>
            <CardDescription>Docente, asignatura y sede</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idSede">Sede *</Label>
              <Select
                value={formData.idSede.toString()}
                onValueChange={(value) => setFormData({ ...formData, idSede: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id.toString()}>
                      {sede.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idDocente">Docente *</Label>
              <Select
                value={formData.idDocente.toString()}
                onValueChange={(value) => setFormData({ ...formData, idDocente: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar docente" />
                </SelectTrigger>
                <SelectContent>
                  {docentes.map((docente) => (
                    <SelectItem key={docente.id} value={docente.id.toString()}>
                      {docente.nombres} {docente.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idAsignatura">Asignatura *</Label>
              <Select
                value={formData.idAsignatura.toString()}
                onValueChange={(value) => setFormData({ ...formData, idAsignatura: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asignatura" />
                </SelectTrigger>
                <SelectContent>
                  {asignaturas.map((asignatura) => (
                    <SelectItem key={asignatura.id} value={asignatura.id.toString()}>
                      {asignatura.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idResponsable">Responsable *</Label>
              <Select
                value={formData.idResponsable.toString()}
                onValueChange={(value) => setFormData({ ...formData, idResponsable: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {responsables.map((responsable) => (
                    <SelectItem key={responsable.id} value={responsable.id.toString()}>
                      {responsable.nombres} {responsable.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/visitas/${visitaId}`}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
