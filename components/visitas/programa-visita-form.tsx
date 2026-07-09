"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Building2, 
  User, 
  BookOpen, 
  Calendar, 
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { docentesService, type Docente } from "@/services/docentes.service"
import { sedesService, type Sede } from "@/services/sedes.service"
import { asignaturasService, type Asignatura } from "@/services/asignaturas.service"
import { usuarioService, type Usuario } from "@/services/usuario.service"
import { visitasService, type VisitaProgramarData } from "@/services/visitas.service"
import { toast } from "sonner"

interface ProgramaVisitaFormProps {
  onDirtyChange?: (isDirty: boolean) => void
}

export function ProgramaVisitaForm({ onDirtyChange }: ProgramaVisitaFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  
  // Data loading
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [auditors, setAuditors] = useState<Usuario[]>([])

  // Form state
  const [formData, setFormData] = useState({
    idDocente: "",
    idAsignatura: "",
    idSede: "",
    fechaVisita: "",
    idAuditor: "",
  })

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [docentesData, sedesData, asignaturasData, auditorsData] = await Promise.all([
          docentesService.getAll(),
          sedesService.getAll(),
          asignaturasService.getAll(),
          usuarioService.getAuditors(),
        ])
        setDocentes(docentesData)
        setSedes(sedesData)
        setAsignaturas(asignaturasData)
        setAuditors(auditorsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación
    if (!formData.idDocente || !formData.idAsignatura || !formData.idSede || !formData.fechaVisita || !formData.idAuditor) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      setIsSubmitting(true)
      const data: VisitaProgramarData = {
        idDocente: parseInt(formData.idDocente),
        idAsignatura: parseInt(formData.idAsignatura),
        idSede: parseInt(formData.idSede),
        fechaVisita: formData.fechaVisita,
        idAuditor: parseInt(formData.idAuditor),
      }

      await visitasService.programar(data)
      toast.success("Visita programada correctamente")
      setIsDirty(false)
      router.push("/visitas")
    } catch (error) {
      console.error("Error programming visit:", error)
      toast.error("Error al programar la visita")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      idDocente: "",
      idAsignatura: "",
      idSede: "",
      fechaVisita: "",
      idAuditor: "",
    })
    setIsDirty(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programar Visita</CardTitle>
          <CardDescription>Asigna una visita a un evaluador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Programar Visita Inopinada</CardTitle>
        <CardDescription>
          Asigna una nueva visita a un evaluador para supervisar a un docente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Docente */}
          <div className="space-y-2">
            <Label htmlFor="docente" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Docente
            </Label>
            <Select value={formData.idDocente} onValueChange={(value) => handleChange("idDocente", value)}>
              <SelectTrigger id="docente">
                <SelectValue placeholder="Selecciona un docente" />
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

          {/* Asignatura */}
          <div className="space-y-2">
            <Label htmlFor="asignatura" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Asignatura
            </Label>
            <Select value={formData.idAsignatura} onValueChange={(value) => handleChange("idAsignatura", value)}>
              <SelectTrigger id="asignatura">
                <SelectValue placeholder="Selecciona una asignatura" />
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

          {/* Sede */}
          <div className="space-y-2">
            <Label htmlFor="sede" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Sede
            </Label>
            <Select value={formData.idSede} onValueChange={(value) => handleChange("idSede", value)}>
              <SelectTrigger id="sede">
                <SelectValue placeholder="Selecciona una sede" />
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

          {/* Fecha Visita */}
          <div className="space-y-2">
            <Label htmlFor="fechaVisita" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de la Visita
            </Label>
            <Input
              id="fechaVisita"
              type="date"
              value={formData.fechaVisita}
              onChange={(e) => handleChange("fechaVisita", e.target.value)}
            />
          </div>

          {/* Auditor/Evaluador */}
          <div className="space-y-2">
            <Label htmlFor="auditor" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Evaluador
            </Label>
            <Select value={formData.idAuditor} onValueChange={(value) => handleChange("idAuditor", value)}>
              <SelectTrigger id="auditor">
                <SelectValue placeholder="Selecciona un evaluador" />
              </SelectTrigger>
              <SelectContent>
                {auditors.map((auditor) => (
                  <SelectItem key={auditor.id} value={auditor.id.toString()}>
                    {auditor.nombres} {auditor.apellidos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Programando..." : "Programar Visita"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!isDirty || isSubmitting}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
