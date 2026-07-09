"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  ClipboardCheck,
  MonitorPlay,
  Users,
  FileText,
  FlaskConical,
  Save,
  Send,
  Eraser,
  PenTool,
  Plus,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { docentesService, type Docente } from "@/services/docentes.service"
import { sedesService, type Sede } from "@/services/sedes.service"
import { asignaturasService, type Asignatura } from "@/services/asignaturas.service"
import { visitasService } from "@/services/visitas.service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// Componente de evaluacion con opciones SI/NO o CUMPLE/NO CUMPLE
interface EvaluacionRadioProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options?: { value: string; label: string }[]
}

function EvaluacionRadio({
  id,
  label,
  value,
  onChange,
  options = [{ value: "si", label: "SI" }, { value: "no", label: "NO" }]
}: EvaluacionRadioProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card">
      <Label htmlFor={id} className="font-medium flex-1">
        {label}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-4"
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`${id}-${opt.value}`} />
            <Label htmlFor={`${id}-${opt.value}`} className="text-sm cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

// Componente de firma digital
interface SignaturePadProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function SignaturePad({ label, value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing style
    ctx.strokeStyle = "#1e3a5f"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Load existing signature if any
    if (value) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = value
    }
  }, [value])

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
    if (!isDrawing) return
    setIsDrawing(false)
    setHasSignature(true)

    const canvas = canvasRef.current
    if (canvas) {
      onChange(canvas.toDataURL("image/png"))
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    setHasSignature(false)
    onChange("")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          {label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
        >
          <Eraser className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      </div>
      <div className="border-2 border-dashed rounded-lg p-1 bg-card">
        <canvas
          ref={canvasRef}
          className="w-full h-32 cursor-crosshair touch-none"
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
  )
}

interface VisitaFormProps {
  onDirtyChange?: (dirty: boolean) => void
}

export function VisitaForm({ onDirtyChange }: VisitaFormProps) {
  const [step, setStep] = useState(1)
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    // Datos generales
    sede: "",
    docente: "",
    asignatura: "",
    campoFormativo: "",
    ciclo: "",
    turno: "",
    fecha: "",
    horaInicio: "",
    horaTermino: "",
    semana: "",
    tipoClase: "",
    horaPractica: "",
    horaTeoria: "",
    lugar: "",

    // 1. Control Docente
    docentePresente: "",
    horarioProgramado: "",
    interaccion: "",
    actividad: "",
    observacionesDocente: "",

    // 2. Material Aula Virtual
    materialCargado: "",
    observacionesMaterial: "",

    // 3. Control Asistencia Estudiantes
    asistenciaAmbienteCumple: "",
    asistenciaAmbienteObs: "",
    asistenciaIntranetCumple: "",
    asistenciaIntranetObs: "",
    observacionesAsistencia: "",

    // 4. Control Avance Silabico
    temaCoincideVisita: "",
    temaCoincideAnterior: "",
    ingresoAvanceAulaVirtual: "",
    observacionesAvance: "",

    // 5. Guia de Practica
    temaProgramadoGuia: "",
    logroEvidenciado: "",
    rubricaEvaluacion: "",
    observacionesGuia: "",

    // Responsable y Requerimientos
    responsable: "",
    requerimientos: [{ id: 1, descripcion: "" }],
    evidenciaImagen: "",

    // Firmas digitales
    firmaDocente: "",
    firmaResponsable: ""
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    removeFieldError(field)
  }

  const handleEvidenceImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      updateField("evidenciaImagen", "")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === "string") {
        updateField("evidenciaImagen", result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Funciones para manejar requerimientos dinámicos
  const addRequerimiento = () => {
    setFormData(prev => ({
      ...prev,
      requerimientos: [...prev.requerimientos, { id: Date.now(), descripcion: "" }]
    }))
  }

  const removeRequerimiento = (id: number) => {
    setFormData(prev => ({
      ...prev,
      requerimientos: prev.requerimientos.filter(r => r.id !== id)
    }))
  }

  const updateRequerimiento = (id: number, descripcion: string) => {
    setFormData(prev => ({
      ...prev,
      requerimientos: prev.requerimientos.map(r =>
        r.id === id ? { ...r, descripcion } : r
      )
    }))
  }

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayDateString = formatLocalDate(new Date())

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const parseTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return { hours, minutes }
  }

  const getCurrentTimeString = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  }

  const validateHours = () => {
    const newErrors: Record<string, string> = {}

    if (formData.horaInicio) {
      const { hours: initHours } = parseTime(formData.horaInicio)
      if (initHours < 8 || initHours >= 23) {
        newErrors.horaInicio = "La hora de inicio debe estar entre 08:00 y 23:00"
      }
    }

    if (formData.horaTermino) {
      const { hours: termHours } = parseTime(formData.horaTermino)
      if (termHours < 8 || termHours >= 23) {
        newErrors.horaTermino = "La hora de término debe estar entre 08:00 y 23:00"
      }
    }

    if (formData.horaInicio && formData.horaTermino) {
      const { hours: initHours, minutes: initMinutes } = parseTime(formData.horaInicio)
      const { hours: termHours, minutes: termMinutes } = parseTime(formData.horaTermino)

      const initTimeInMinutes = initHours * 60 + initMinutes
      const termTimeInMinutes = termHours * 60 + termMinutes

      if (termTimeInMinutes <= initTimeInMinutes) {
        newErrors.horaTermino = "La hora de término debe ser posterior a la hora de inicio"
      } else if (termTimeInMinutes - initTimeInMinutes > 20) {
        newErrors.horaTermino = "La visita no puede durar más de 20 minutos"
      }
    }

    return newErrors
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    const idSede = parseInt(formData.sede)
    const idAsignatura = parseInt(formData.asignatura)

    if (!formData.fecha) newErrors.fecha = "Fecha de visita es obligatoria."
    if (isNaN(idSede)) newErrors.sede = "Selecciona una sede."
    if (!formData.ciclo) newErrors.ciclo = "Selecciona un ciclo."
    if (!formData.turno) newErrors.turno = "Selecciona un turno."
    if (isNaN(idAsignatura)) newErrors.asignatura = "Selecciona una asignatura."
    if (!formData.campoFormativo) newErrors.campoFormativo = "Selecciona un campo formativo."
    if (!formData.semana) {
      newErrors.semana = "Ingresa el número de semana."
    } else {
      const sem = parseInt(formData.semana)
      if (isNaN(sem) || sem < 1 || sem > 18) {
        newErrors.semana = "La semana debe estar entre 1 y 18."
      }
    }
    if (!formData.tipoClase) newErrors.tipoClase = "Selecciona el tipo de clase."
    if (!formData.horaPractica) newErrors.horaPractica = "Indica horas de práctica/teoría."
    if (!formData.lugar) newErrors.lugar = "Ingresa el lugar de la visita."

    if (!newErrors.fecha && !isValidDateString(formData.fecha)) {
      newErrors.fecha = "Fecha de visita inválida."
    }

    if (!newErrors.fecha) {
      const selectedDate = parseDate(formData.fecha)
      const today = parseDate(todayDateString)
      if (selectedDate.getTime() < today.getTime()) {
        newErrors.fecha = "La fecha de visita no puede ser anterior a hoy."
      }
    }

    // Validar horas
    const hoursErrors = validateHours()
    Object.assign(newErrors, hoursErrors)

    setErrors(newErrors)
    return {
      valid: Object.keys(newErrors).length === 0,
      message: Object.values(newErrors)[0] || "Complete los campos obligatorios"
    }
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    const idDocente = parseInt(formData.docente)
    if (isNaN(idDocente)) newErrors.docente = "Selecciona un docente."
    if (!formData.docentePresente) newErrors.docentePresente = "Selecciona si el docente estuvo presente."
    if (!formData.horarioProgramado) newErrors.horarioProgramado = "Selecciona si el horario fue programado."
    if (!formData.interaccion) newErrors.interaccion = "Selecciona si la interacción fue adecuada."
    // Actividad ahora es OPCIONAL
    if (!formData.materialCargado) newErrors.materialCargado = "Selecciona el estado del material virtual."
    if (!formData.asistenciaAmbienteCumple) newErrors.asistenciaAmbienteCumple = "Selecciona el control en ambiente."
    if (!formData.asistenciaIntranetCumple) newErrors.asistenciaIntranetCumple = "Selecciona el control en intranet."
    if (!formData.temaCoincideVisita) newErrors.temaCoincideVisita = "Selecciona si el tema coincide con la visita."
    if (!formData.temaCoincideAnterior) newErrors.temaCoincideAnterior = "Selecciona si el tema coincide con el anterior."
    if (!formData.ingresoAvanceAulaVirtual) newErrors.ingresoAvanceAulaVirtual = "Selecciona si el avance se ingresó en el aula virtual."
    if (!formData.temaProgramadoGuia) newErrors.temaProgramadoGuia = "Selecciona si cumple el tema programado."
    if (!formData.logroEvidenciado) newErrors.logroEvidenciado = "Selecciona si el logro está evidenciado."
    if (!formData.rubricaEvaluacion) newErrors.rubricaEvaluacion = "Selecciona si existe una rúbrica de evaluación."

    setErrors(newErrors)
    return {
      valid: Object.keys(newErrors).length === 0,
      message: Object.values(newErrors)[0] || "Complete los campos obligatorios de evaluación"
    }
  }
  const canProceedToStep = (targetStep: number): { canProceed: boolean; message: string } => {
    if (targetStep === 1) {
      return { canProceed: true, message: "" }
    }
    if (targetStep === 2) {
      const validation = validateStep1()
      return { canProceed: validation.valid, message: validation.message }
    }
    if (targetStep === 3) {
      const validation = validateStep2()
      return { canProceed: validation.valid, message: validation.message }
    }
    if (targetStep === 4) {
      return { canProceed: true, message: "" }
    }
    return { canProceed: true, message: "" }
  }

  const handleStepClick = (targetStep: number) => {
    const validation = canProceedToStep(targetStep)
    if (!validation.canProceed) {
      toast.error(validation.message)
      return
    }
    setStep(targetStep)
  }

  const handleNextStep = () => {
    const nextStep = Math.min(4, step + 1)
    const validation = canProceedToStep(nextStep)
    if (!validation.canProceed) {
      toast.error(validation.message)
      return
    }
    setStep(nextStep)
  }

  const getMissingEvaluationFields = () => {
    const missing: string[] = []

    // 1. Control Docente
    if (!formData.docentePresente) missing.push("1. Control Docente - ¿Docente presente?")
    if (!formData.horarioProgramado) missing.push("1. Control Docente - ¿Horario programado?")
    if (!formData.interaccion) missing.push("1. Control Docente - ¿Interacción?")

    // 2. Material Aula Virtual
    if (!formData.materialCargado) missing.push("2. Material Aula Virtual - ¿Cumple?")

    // 3. Control de Asistencia
    if (!formData.asistenciaAmbienteCumple) missing.push("3. Control de Asistencia - ¿Control en ambiente?")
    if (!formData.asistenciaIntranetCumple) missing.push("3. Control de Asistencia - ¿Control en intranet?")

    // 4. Control del Avance Silabico
    if (!formData.temaCoincideVisita) missing.push("4. Control del Avance Silabico - Tema de la visita")
    if (!formData.temaCoincideAnterior) missing.push("4. Control del Avance Silabico - Tema anterior")
    if (!formData.ingresoAvanceAulaVirtual) missing.push("4. Control del Avance Silabico - Ingreso del avance")

    // 5. Guía de Práctica
    if (!formData.temaProgramadoGuia) missing.push("5. Guía de Práctica - Tema programado")
    if (!formData.logroEvidenciado) missing.push("5. Guía de Práctica - Logro evidenciado")
    if (!formData.rubricaEvaluacion) missing.push("5. Guía de Práctica - Rúbrica de evaluación")

    return missing
  }

  const isValidDateString = (dateString: string) => {
    if (!dateString) return false
    const date = parseDate(dateString)
    return !Number.isNaN(date.getTime())
  }

  const isValidTimeString = (timeString: string) => {
    if (!timeString) return false
    const { hours, minutes } = parseTime(timeString)
    return (
      !Number.isNaN(hours) && !Number.isNaN(minutes) &&
      hours >= 0 && hours < 24 &&
      minutes >= 0 && minutes < 60
    )
  }

  const validateSubmit = (
    idSede: number,
    idDocente: number,
    idAsignatura: number,
    idResponsable: number | undefined
  ) => {
    const step1Validation = validateStep1()
    if (!step1Validation.valid) {
      return step1Validation
    }

    const step2Validation = validateStep2()
    if (!step2Validation.valid) {
      return step2Validation
    }

    const newErrors: Record<string, string> = {}
    if (idResponsable == null) {
      newErrors.responsable = "Responsable no disponible."
    }

    setErrors(prev => ({ ...prev, ...newErrors }))

    return {
      valid: Object.keys(newErrors).length === 0,
      message: Object.values(newErrors)[0] || ""
    }
  }

  const router = useRouter()
  const [sedes, setSedes] = useState<Sede[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fieldError = (field: string) => errors[field] || ""
  const removeFieldError = (field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const isFormDirty = useMemo(() => {
    const {
      horaInicio,
      horaTermino,
      firmaDocente,
      firmaResponsable,
      ...rest
    } = formData as { [key: string]: any }

    return Object.entries(rest).some(([key, value]) => {
      if (key === "requerimientos") {
        return Array.isArray(value) && value.some((item) => item.descripcion?.trim().length > 0)
      }
      return typeof value === "string" ? value.trim().length > 0 : Boolean(value)
    })
  }, [formData])

  useEffect(() => {
    onDirtyChange?.(isFormDirty)
  }, [isFormDirty, onDirtyChange])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isFormDirty) return
      event.preventDefault()
      event.returnValue = ""
      return ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isFormDirty])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug: Verificar estado del usuario
  useEffect(() => {
    console.log("DEBUG - Usuario en VisitaForm:", user)
    console.log("DEBUG - mounted:", mounted)
    console.log("DEBUG - user?.nombre:", user?.nombre)
    console.log("DEBUG - user?.apellido:", user?.apellido)
  }, [user, mounted])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingData(true)
        const [s, d, a] = await Promise.all([
          sedesService.getAll(),
          docentesService.getActivos(),
          asignaturasService.getAll(),
        ])
        setSedes(s)
        setDocentes(d)
        setAsignaturas(a)
      } catch {
        toast.error("Error al cargar datos del formulario")
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [])

  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      const idSede = parseInt(formData.sede)
      const idDocente = parseInt(formData.docente)
      const idAsignatura = parseInt(formData.asignatura)
      const idResponsable = user?.responsableId ?? user?.id

      const validation = validateSubmit(idSede, idDocente, idAsignatura, idResponsable)
      if (!validation.valid) {
        toast.error(validation.message)
        setIsSubmitting(false)
        return
      }

      // Filtrar solo requerimientos con descripción
      const requerimientosValidos = formData.requerimientos
        .filter(r => r.descripcion.trim().length > 0)
        .map(r => ({ descripcion: r.descripcion.trim() }))

      const horaInicioPayload = formData.horaInicio
      const horaTerminoPayload = formData.horaTermino

      console.log("DEBUG - formData values:", {
        docentePresente: formData.docentePresente,
        horarioProgramado: formData.horarioProgramado,
        interaccion: formData.interaccion,
        materialCargado: formData.materialCargado,
        temaCoincideVisita: formData.temaCoincideVisita,
        temaCoincideAnterior: formData.temaCoincideAnterior,
        ingresoAvanceAulaVirtual: formData.ingresoAvanceAulaVirtual
      })

      // Mapear evaluaciones desde formData
      const evaluacionControlDocente = {
        docentePresente: formData.docentePresente === "si" || formData.docentePresente === "cumple",
        horarioCumplido: formData.horarioProgramado === "si" || formData.horarioProgramado === "cumple",
        interaccionAdecuada: formData.interaccion === "si" || formData.interaccion === "cumple",
        actividadDesarrollada: formData.actividad || "NO_APLICA",
        observaciones: formData.observacionesDocente || ""
      }

      const evaluacionMaterialVirtual = {
        cumple: formData.materialCargado === "si" || formData.materialCargado === "cumple",
        observaciones: formData.observacionesMaterial || ""
      }

      const evaluacionAsistenciaEstudiantes = {
        ambienteCumple: (formData.asistenciaAmbienteCumple || "NO_APLICA").toUpperCase() as "CUMPLE" | "NO_CUMPLE" | "NO_APLICA",
        ambienteObservaciones: formData.asistenciaAmbienteObs || "",
        intranetCumple: (formData.asistenciaIntranetCumple || "NO_APLICA").toUpperCase() as "CUMPLE" | "NO_CUMPLE" | "NO_APLICA",
        intranetObservaciones: formData.asistenciaIntranetObs || "",
        observacionesGenerales: formData.observacionesAsistencia || ""
      }

      const evaluacionAvanceSilabico = {
        temaCoincideVisita: formData.temaCoincideVisita === "si" || formData.temaCoincideVisita === "cumple",
        temaCoincideAnterior: formData.temaCoincideAnterior === "si" || formData.temaCoincideAnterior === "cumple",
        ingresoAulaVirtual: formData.ingresoAvanceAulaVirtual === "si" || formData.ingresoAvanceAulaVirtual === "cumple",
        observaciones: formData.observacionesAvance || ""
      }

      const evaluacionGuiaPractica = {
        temaProgramadoCumple: (formData.temaProgramadoGuia || "NO_APLICA").toUpperCase() as "CUMPLE" | "NO_CUMPLE" | "NO_APLICA",
        logroEvidenciado: (formData.logroEvidenciado || "NO_APLICA").toUpperCase() as "CUMPLE" | "NO_CUMPLE" | "NO_APLICA",
        rubricaEvaluacion: (formData.rubricaEvaluacion || "NO_APLICA").toUpperCase() as "CUMPLE" | "NO_CUMPLE" | "NO_APLICA",
        observaciones: formData.observacionesGuia || ""
      }

      const payload = {
        fechaVisita: formData.fecha,
        horaInicio: horaInicioPayload,
        horaTermino: horaTerminoPayload,
        semanaNumero: formData.semana ? parseInt(formData.semana) : null,
        lugarVisita: formData.lugar || null,
        tipoClase: formData.tipoClase || "TEORICA",
        idSede,
        idDocente,
        idAsignatura,
        idResponsable: idResponsable!,
        evaluacionControlDocente,
        evaluacionMaterialVirtual,
        evaluacionAsistenciaEstudiantes,
        evaluacionAvanceSilabico,
        evaluacionGuiaPractica,
        requerimientos: requerimientosValidos.length > 0 ? requerimientosValidos : undefined,
        evidenciaImagen: formData.evidenciaImagen || null,
        firmaDocente: formData.firmaDocente || null,
        firmaResponsable: formData.firmaResponsable || null,
      }
      await visitasService.create(payload)
      toast.success("Visita registrada exitosamente")
      router.push("/visitas")
    } catch {
      toast.error("Error al registrar la visita")
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: "Datos Generales", icon: Building2 },
    { number: 2, title: "Evaluaciones", icon: ClipboardCheck },
    { number: 3, title: "Observaciones", icon: FileText },
    { number: 4, title: "Resumen", icon: Send },
  ]

  const cumpleOptions = [
    { value: "cumple", label: "Cumple" },
    { value: "no_cumple", label: "No Cumple" }
  ]

  const siNoOptions = [
    { value: "si", label: "SI" },
    { value: "no", label: "NO" }
  ]

  const cumpleNoAplicaOptions = [
    { value: "cumple", label: "Cumple" },
    { value: "no_cumple", label: "No Cumple" },
    { value: "no_aplica", label: "No Aplica" }
  ]

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center flex-shrink-0">
            <button
              onClick={() => handleStepClick(s.number)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                step === s.number
                  ? "bg-primary text-primary-foreground"
                  : step > s.number
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
              <span className="font-medium text-sm hidden sm:inline">{s.title}</span>
              <span className="font-medium text-sm sm:hidden">{s.number}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn(
                "w-8 lg:w-16 h-0.5 mx-2",
                step > s.number ? "bg-accent" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Datos Generales */}
      {step === 1 && (
        <Card>
          <CardHeader className="bg-primary/5 border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Datos Generales de la Visita
              </CardTitle>
              <CardDescription>
                Informacion basica de la visita inopinada - Clases Presenciales
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Fecha y Hora */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Visita
                </Label>
                <Input
                  type="date"
                  min={todayDateString}
                  value={formData.fecha}
                  onChange={(e) => updateField("fecha", e.target.value)}
                  className={cn(errors.fecha && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("fecha") && <p className="text-xs text-destructive mt-1">{fieldError("fecha")}</p>}
              </div>
              <div className="space-y-2">
                <Label>Semana N</Label>
                <Input
                  type="number"
                  min="1"
                  max="18"
                  placeholder="Ej: 5"
                  value={formData.semana}
                  onChange={(e) => updateField("semana", e.target.value)}
                  className={cn(errors.semana && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("semana") && <p className="text-xs text-destructive mt-1">{fieldError("semana")}</p>}
              </div>
            </div>

            {/* Hora de Inicio y Hora de Termino */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hora de Inicio</Label>
                <Input
                  type="time"
                  min="08:00"
                  max="22:59"
                  value={formData.horaInicio}
                  onChange={(e) => updateField("horaInicio", e.target.value)}
                  className={cn(errors.horaInicio && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("horaInicio") && <p className="text-xs text-destructive mt-1">{fieldError("horaInicio")}</p>}
                <p className="text-xs text-muted-foreground">Rango: 08:00 - 23:00</p>
              </div>
              <div className="space-y-2">
                <Label>Hora de Término</Label>
                <Input
                  type="time"
                  min="08:00"
                  max="22:59"
                  value={formData.horaTermino}
                  onChange={(e) => updateField("horaTermino", e.target.value)}
                  className={cn(errors.horaTermino && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("horaTermino") && <p className="text-xs text-destructive mt-1">{fieldError("horaTermino")}</p>}
                <p className="text-xs text-muted-foreground">Debe ser posterior a la hora de inicio</p>
              </div>
            </div>

            {/* Sede, Ciclo, Turno */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Sede o Filial</Label>
                <Select value={formData.sede} onValueChange={(v) => updateField("sede", v)} disabled={isLoadingData}>
                  <SelectTrigger className={cn(errors.sede && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder={isLoadingData ? "Cargando..." : "Seleccionar sede"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sedes.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("sede") && <p className="text-xs text-destructive mt-1">{fieldError("sede")}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ciclo</Label>
                <Select value={formData.ciclo} onValueChange={(v) => updateField("ciclo", v)}>
                  <SelectTrigger className={cn(errors.ciclo && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Ciclo" />
                  </SelectTrigger>
                  {fieldError("ciclo") && <p className="text-xs text-destructive mt-1">{fieldError("ciclo")}</p>}
                  <SelectContent>
                    {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={formData.turno} onValueChange={(v) => updateField("turno", v)}>
                  <SelectTrigger className={cn(errors.turno && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manana">Manana</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noche">Noche</SelectItem>
                  </SelectContent>
                </Select>
                {fieldError("turno") && <p className="text-xs text-destructive mt-1">{fieldError("turno")}</p>}
              </div>
            </div>

            {/* Asignatura y Campo Formativo */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Asignatura
                </Label>
                <Select value={formData.asignatura} onValueChange={(v) => updateField("asignatura", v)} disabled={isLoadingData}>
                  <SelectTrigger className={cn(errors.asignatura && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder={isLoadingData ? "Cargando..." : "Seleccionar asignatura"} />
                  </SelectTrigger>
                  <SelectContent>
                    {asignaturas.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("asignatura") && <p className="text-xs text-destructive mt-1">{fieldError("asignatura")}</p>}
              </div>
              <div className="space-y-2">
                <Label>Campo Formativo</Label>
                <Select value={formData.campoFormativo} onValueChange={(v) => updateField("campoFormativo", v)}>
                  <SelectTrigger className={cn(errors.campoFormativo && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Seleccionar campo formativo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudios-generales">Estudios Generales</SelectItem>
                    <SelectItem value="estudios-especificos">Estudios Especificos</SelectItem>
                    <SelectItem value="estudios-especialidad">Estudios de Especialidad</SelectItem>
                    <SelectItem value="practicas-preprofesionales">Practicas Pre-Profesionales</SelectItem>
                  </SelectContent>
                </Select>
                {fieldError("campoFormativo") && <p className="text-xs text-destructive mt-1">{fieldError("campoFormativo")}</p>}
              </div>
            </div>

            {/* Tipo de Clase, Hora Practica/Teoria, Lugar */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo de Clase</Label>
                <Select value={formData.tipoClase} onValueChange={(v) => updateField("tipoClase", v)}>
                  <SelectTrigger className={cn(errors.tipoClase && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEORICA">Teorica</SelectItem>
                    <SelectItem value="PRACTICA">Practica</SelectItem>
                    <SelectItem value="MIXTA">Mixta (Teoria + Practica)</SelectItem>
                  </SelectContent>
                </Select>
                {fieldError("tipoClase") && <p className="text-xs text-destructive mt-1">{fieldError("tipoClase")}</p>}
              </div>
              <div className="space-y-2">
                <Label>Hora Practica / Hora Teoria</Label>
                <Input
                  placeholder="Ej: 2HP / 3HT"
                  value={formData.horaPractica}
                  onChange={(e) => updateField("horaPractica", e.target.value)}
                  className={cn(errors.horaPractica && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("horaPractica") && <p className="text-xs text-destructive mt-1">{fieldError("horaPractica")}</p>}
              </div>
              <div className="space-y-2">
                <Label>Lugar de la Visita</Label>
                <Input
                  placeholder="Ej: Aula 301, Laboratorio de Computo"
                  value={formData.lugar}
                  onChange={(e) => updateField("lugar", e.target.value)}
                  className={cn(errors.lugar && "border-destructive focus:border-destructive focus:ring-destructive")}
                />
                {fieldError("lugar") && <p className="text-xs text-destructive mt-1">{fieldError("lugar")}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Evaluaciones */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 1. Control Docente */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                1. Control Docente (Asistencia, Horario, Comportamiento)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Docente */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm text-muted-foreground">Docente:</Label>
                <Select value={formData.docente} onValueChange={(v) => updateField("docente", v)} disabled={isLoadingData}>
                  <SelectTrigger className={cn("mt-1", errors.docente && "border-destructive focus:border-destructive focus:ring-destructive")}>
                    <SelectValue placeholder={isLoadingData ? "Cargando..." : "Seleccionar docente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {docentes.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.nombres} {d.apellidos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldError("docente") && <p className="text-xs text-destructive mt-1">{fieldError("docente")}</p>}
              </div>

              {/* Tabla de evaluacion docente */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-px bg-muted text-sm font-medium">
                  <div className="bg-primary/10 p-3 text-center">PRESENTE</div>
                  <div className="bg-primary/10 p-3 text-center">HORARIO PROGRAMADO</div>
                  <div className="bg-primary/10 p-3 text-center">INTERACCION</div>
                  <div className="bg-primary/10 p-3 text-center">ACTIVIDAD</div>
                </div>
                <div className="grid grid-cols-4 gap-px bg-muted">
                  {/* Presente */}
                  <div className="bg-card p-3">
                    <RadioGroup
                      value={formData.docentePresente}
                      onValueChange={(v) => updateField("docentePresente", v)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="si" id="presente-si" />
                        <Label htmlFor="presente-si" className="text-sm cursor-pointer">SI</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="presente-no" />
                        <Label htmlFor="presente-no" className="text-sm cursor-pointer">NO</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {/* Horario Programado */}
                  <div className="bg-card p-3">
                    <RadioGroup
                      value={formData.horarioProgramado}
                      onValueChange={(v) => updateField("horarioProgramado", v)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="cumple" id="horario-cumple" />
                        <Label htmlFor="horario-cumple" className="text-sm cursor-pointer">Cumple</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no_cumple" id="horario-no-cumple" />
                        <Label htmlFor="horario-no-cumple" className="text-sm cursor-pointer">No Cumple</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {/* Interaccion */}
                  <div className="bg-card p-3">
                    <RadioGroup
                      value={formData.interaccion}
                      onValueChange={(v) => updateField("interaccion", v)}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="si" id="interaccion-si" />
                        <Label htmlFor="interaccion-si" className="text-sm cursor-pointer">SI</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="interaccion-no" />
                        <Label htmlFor="interaccion-no" className="text-sm cursor-pointer">NO</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {/* Actividad */}
                  <div className="bg-card p-3">
                    <Input
                      placeholder="Describir actividad"
                      value={formData.actividad}
                      onChange={(e) => updateField("actividad", e.target.value)}
                      className={cn("text-sm", errors.actividad && "border-destructive focus:border-destructive focus:ring-destructive")}
                    />
                    {fieldError("actividad") && <p className="text-xs text-destructive mt-2">{fieldError("actividad")}</p>}
                  </div>
                </div>
              </div>
              {(fieldError("docentePresente") || fieldError("horarioProgramado") || fieldError("interaccion")) && (
                <p className="text-xs text-destructive mt-2">
                  {fieldError("docentePresente") || fieldError("horarioProgramado") || fieldError("interaccion")}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <Label className="text-sm">Observaciones:</Label>
                <Textarea
                  placeholder="Observaciones del control docente..."
                  value={formData.observacionesDocente}
                  onChange={(e) => updateField("observacionesDocente", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Material Aula Virtual */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <MonitorPlay className="h-5 w-5" />
                2. Registro de Material a Utilizar Cargado en Aula Virtual Antes del Inicio de Clases
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <EvaluacionRadio
                id="materialCargado"
                label="CUMPLE"
                value={formData.materialCargado}
                onChange={(v) => updateField("materialCargado", v)}
                options={siNoOptions}
              />
              {fieldError("materialCargado") && <p className="text-xs text-destructive mt-2">{fieldError("materialCargado")}</p>}
              <div className="space-y-2">
                <Label className="text-sm">Observaciones:</Label>
                <Textarea
                  placeholder="Observaciones del material..."
                  value={formData.observacionesMaterial}
                  onChange={(e) => updateField("observacionesMaterial", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Control de Registro de Asistencia */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                3. Control de Registro de Asistencia de Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Tabla de control de asistencia */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-px bg-muted text-sm font-medium">
                  <div className="bg-primary/10 p-3 text-center">CONTROL</div>
                  <div className="bg-primary/10 p-3 text-center">CONTROL EN AMBIENTE</div>
                  <div className="bg-primary/10 p-3 text-center">CONTROL EN INTRANET</div>
                </div>
                {/* Fila Asistencia */}
                <div className="grid grid-cols-3 gap-px bg-muted">
                  <div className="bg-card p-3 flex items-center font-medium text-sm">
                    ASISTENCIA
                  </div>
                  {/* Control en Ambiente */}
                  <div className="bg-card p-3">
                    <RadioGroup
                      value={formData.asistenciaAmbienteCumple}
                      onValueChange={(v) => updateField("asistenciaAmbienteCumple", v)}
                      className="flex gap-4 mb-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="cumple" id="amb-cumple" />
                        <Label htmlFor="amb-cumple" className="text-xs cursor-pointer">Cumple</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="no_cumple" id="amb-no-cumple" />
                        <Label htmlFor="amb-no-cumple" className="text-xs cursor-pointer">No Cumple</Label>
                      </div>
                    </RadioGroup>
                    <Input
                      placeholder="Observaciones"
                      value={formData.asistenciaAmbienteObs}
                      onChange={(e) => updateField("asistenciaAmbienteObs", e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  {/* Control en Intranet */}
                  <div className="bg-card p-3">
                    <RadioGroup
                      value={formData.asistenciaIntranetCumple}
                      onValueChange={(v) => updateField("asistenciaIntranetCumple", v)}
                      className="flex gap-4 mb-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="cumple" id="intra-cumple" />
                        <Label htmlFor="intra-cumple" className="text-xs cursor-pointer">Cumple</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="no_cumple" id="intra-no-cumple" />
                        <Label htmlFor="intra-no-cumple" className="text-xs cursor-pointer">No Cumple</Label>
                      </div>
                    </RadioGroup>
                    <Input
                      placeholder="Observaciones"
                      value={formData.asistenciaIntranetObs}
                      onChange={(e) => updateField("asistenciaIntranetObs", e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                {(fieldError("asistenciaAmbienteCumple") || fieldError("asistenciaIntranetCumple")) && (
                  <p className="text-xs text-destructive mt-2">
                    {fieldError("asistenciaAmbienteCumple") || fieldError("asistenciaIntranetCumple")}
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-sm">Observaciones Generales:</Label>
                <Textarea
                  placeholder="Observaciones del control de asistencia..."
                  value={formData.observacionesAsistencia}
                  onChange={(e) => updateField("observacionesAsistencia", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Control del Avance Silabico */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                4. Control del Avance Silabico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-px bg-muted text-sm font-medium">
                  <div className="bg-primary/10 p-3 col-span-1"></div>
                  <div className="bg-primary/10 p-3 text-center">CUMPLE</div>
                  <div className="bg-primary/10 p-3 text-center">NO CUMPLE</div>
                </div>
                {/* Item 1 */}
                <div className="grid grid-cols-3 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    El tema del silabo coincide con la clase desarrollada en la fecha de la visita
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaCoincideVisita}
                      onValueChange={(v) => updateField("temaCoincideVisita", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="cumple" id="tema-visita-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaCoincideVisita}
                      onValueChange={(v) => updateField("temaCoincideVisita", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="no_cumple" id="tema-visita-no" />
                    </RadioGroup>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="grid grid-cols-3 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    El tema desarrollado en la fecha anterior a la visita coincide con el silabo
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaCoincideAnterior}
                      onValueChange={(v) => updateField("temaCoincideAnterior", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="cumple" id="tema-ant-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaCoincideAnterior}
                      onValueChange={(v) => updateField("temaCoincideAnterior", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="no_cumple" id="tema-ant-no" />
                    </RadioGroup>
                  </div>
                </div>
                {/* Item 3 */}
                <div className="grid grid-cols-3 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    Ingreso del avance silabico en el aula virtual
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.ingresoAvanceAulaVirtual}
                      onValueChange={(v) => updateField("ingresoAvanceAulaVirtual", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="cumple" id="avance-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.ingresoAvanceAulaVirtual}
                      onValueChange={(v) => updateField("ingresoAvanceAulaVirtual", v)}
                      className="flex gap-4"
                    >
                      <RadioGroupItem value="no_cumple" id="avance-no" />
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-sm">Observaciones:</Label>
                <Textarea
                  placeholder="Observaciones del avance silabico..."
                  value={formData.observacionesAvance}
                  onChange={(e) => updateField("observacionesAvance", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              {(fieldError("temaCoincideVisita") || fieldError("temaCoincideAnterior") || fieldError("ingresoAvanceAulaVirtual")) && (
                <p className="text-xs text-destructive mt-2">
                  {fieldError("temaCoincideVisita") || fieldError("temaCoincideAnterior") || fieldError("ingresoAvanceAulaVirtual")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 5. Guia de Practica */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                5. Cumple con el Desarrollo de la Guia de Practica
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-px bg-muted text-sm font-medium">
                  <div className="bg-primary/10 p-3"></div>
                  <div className="bg-primary/10 p-3 text-center">CUMPLE</div>
                  <div className="bg-primary/10 p-3 text-center">NO CUMPLE</div>
                  <div className="bg-primary/10 p-3 text-center">NO APLICA</div>
                </div>
                {/* Item 1 */}
                <div className="grid grid-cols-4 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    Cumple con el tema programado en la guia de practica para el desarrollo de la clase practica
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaProgramadoGuia}
                      onValueChange={(v) => updateField("temaProgramadoGuia", v)}
                    >
                      <RadioGroupItem value="cumple" id="guia1-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaProgramadoGuia}
                      onValueChange={(v) => updateField("temaProgramadoGuia", v)}
                    >
                      <RadioGroupItem value="no_cumple" id="guia1-no" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.temaProgramadoGuia}
                      onValueChange={(v) => updateField("temaProgramadoGuia", v)}
                    >
                      <RadioGroupItem value="no_aplica" id="guia1-na" />
                    </RadioGroup>
                  </div>
                </div>
                {/* Item 2 */}
                <div className="grid grid-cols-4 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    Se evidencia el logro a medir en la practica desarrollada
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.logroEvidenciado}
                      onValueChange={(v) => updateField("logroEvidenciado", v)}
                    >
                      <RadioGroupItem value="cumple" id="guia2-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.logroEvidenciado}
                      onValueChange={(v) => updateField("logroEvidenciado", v)}
                    >
                      <RadioGroupItem value="no_cumple" id="guia2-no" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.logroEvidenciado}
                      onValueChange={(v) => updateField("logroEvidenciado", v)}
                    >
                      <RadioGroupItem value="no_aplica" id="guia2-na" />
                    </RadioGroup>
                  </div>
                </div>
                {/* Item 3 */}
                <div className="grid grid-cols-4 gap-px bg-muted">
                  <div className="bg-card p-3 text-sm">
                    Cuenta con una rubrica de evaluacion
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.rubricaEvaluacion}
                      onValueChange={(v) => updateField("rubricaEvaluacion", v)}
                    >
                      <RadioGroupItem value="cumple" id="guia3-cumple" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.rubricaEvaluacion}
                      onValueChange={(v) => updateField("rubricaEvaluacion", v)}
                    >
                      <RadioGroupItem value="no_cumple" id="guia3-no" />
                    </RadioGroup>
                  </div>
                  <div className="bg-card p-3 flex justify-center">
                    <RadioGroup
                      value={formData.rubricaEvaluacion}
                      onValueChange={(v) => updateField("rubricaEvaluacion", v)}
                    >
                      <RadioGroupItem value="no_aplica" id="guia3-na" />
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-sm">Observaciones:</Label>
                <Textarea
                  placeholder="Observaciones de la guia de practica..."
                  value={formData.observacionesGuia}
                  onChange={(e) => updateField("observacionesGuia", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              {(fieldError("temaProgramadoGuia") || fieldError("logroEvidenciado") || fieldError("rubricaEvaluacion")) && (
                <p className="text-xs text-destructive mt-2">
                  {fieldError("temaProgramadoGuia") || fieldError("logroEvidenciado") || fieldError("rubricaEvaluacion")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Responsable y Requerimientos */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Responsable de Realizar la Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm text-muted-foreground">Responsable (Auditor):</Label>
                <p className="font-medium">
                  {!mounted
                    ? "Cargando..."
                    : user?.nombre && user?.apellido
                      ? `${user.nombre} ${user.apellido}`
                      : user?.nombre
                        ? user.nombre
                        : "Auditor actual"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Requerimientos Solicitados en la Visita Inopinada
              </CardTitle>
              <CardDescription>
                Registre los requerimientos de mejora o acciones correctivas identificadas. Puede agregar varios requerimientos.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {formData.requerimientos.map((req, index) => (
                <div key={req.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1">
                      Requerimiento {index + 1}
                    </Label>
                    <Textarea
                      placeholder={`Describa el requerimiento ${index + 1}...`}
                      value={req.descripcion}
                      onChange={(e) => updateRequerimiento(req.id, e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                  {formData.requerimientos.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeRequerimiento(req.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={addRequerimiento}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar otro requerimiento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidencia Visual de la Visita
              </CardTitle>
              <CardDescription>
                Adjunte una fotografía o captura como evidencia de la visita.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evidenciaImagen">Imagen de evidencia</Label>
                <input
                  id="evidenciaImagen"
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceImageChange}
                  className="block w-full text-sm text-muted-foreground file:border file:border-input file:rounded-md file:px-3 file:py-2 file:text-sm file:font-medium file:bg-card file:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">Se guardará como imagen en el PDF de la visita.</p>
              </div>
              {formData.evidenciaImagen && (
                <div className="rounded-lg border overflow-hidden bg-card">
                  <div className="p-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Vista previa de evidencia</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateField("evidenciaImagen", "")}>Quitar</Button>
                  </div>
                  <img src={formData.evidenciaImagen} alt="Evidencia de visita" className="w-full object-contain" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Resumen y Envio */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Resumen de la Visita
              </CardTitle>
              <CardDescription>
                Revise los datos antes de crear la visita. Firme para completar el proceso.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Sede:</span>
                  <span className="font-medium">
                    {sedes.find(s => s.id.toString() === formData.sede)?.nombre || formData.sede || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Docente:</span>
                  <span className="font-medium">
                    {(() => {
                      const d = docentes.find(d => d.id.toString() === formData.docente)
                      return d ? `${d.nombres} ${d.apellidos}` : formData.docente || "-"
                    })()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Asignatura:</span>
                  <span className="font-medium">
                    {asignaturas.find(a => a.id.toString() === formData.asignatura)?.nombre || formData.asignatura || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Campo Formativo:</span>
                  <span className="font-medium">{formData.campoFormativo || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-medium">{formData.fecha || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Horario:</span>
                  <span className="font-medium">{formData.horaInicio || "-"} - {formData.horaTermino || "-"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Responsable (Auditor):</span>
                  <span className="font-medium">
                    {!mounted
                      ? "Cargando..."
                      : user?.nombre && user?.apellido
                        ? `${user.nombre} ${user.apellido}`
                        : user?.nombre
                          ? user.nombre
                          : "Auditor actual"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firmas */}
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Firmas
              </CardTitle>
              <CardDescription>
                Firme para completar el proceso de creación de la visita.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <SignaturePad
                  label="Firma del Docente"
                  value={formData.firmaDocente}
                  onChange={(v) => updateField("firmaDocente", v)}
                />
                <SignaturePad
                  label="Firma del Responsable (Auditor)"
                  value={formData.firmaResponsable}
                  onChange={(v) => updateField("firmaResponsable", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Acciones finales */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creando..." : "Crear Visita"}
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Anterior
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={step === 4}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
