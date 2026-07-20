"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, MoreHorizontal, Eye, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { visitasService, type Visita, type VisitaFilterData } from "@/services/visitas.service"
import { type FiltersState } from "@/components/visitas/visitas-filters"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const estadoConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  BORRADOR: { label: "Borrador", icon: Clock, className: "bg-muted text-muted-foreground" },
  FIRMADA_DOCENTE: { label: "Firmada Docente", icon: CheckCircle2, className: "bg-primary text-primary-foreground" },
  COMPLETADA: { label: "Completada", icon: CheckCircle2, className: "bg-success text-success-foreground hover:bg-success/90" },
  AUDITADA: { label: "Auditada", icon: CheckCircle2, className: "bg-info text-info-foreground" },
}

interface VisitasTableProps {
  showOnlyMine?: boolean
  filters?: FiltersState
}

export function VisitasTable({ showOnlyMine = false, filters }: VisitasTableProps) {
  const { user } = useAuth()
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchVisitas() {
      try {
        setIsLoading(true)
        setError(null)
        let data: Visita[] = []

        // Preparar filtros
        const filterData: VisitaFilterData = {
          busqueda: filters?.busqueda || null,
          idSede: filters?.idSede ? parseInt(filters.idSede) : null,
          estado: filters?.estado || null,
          fechaDesde: filters?.fechaDesde || null,
          fechaHasta: filters?.fechaHasta || null,
        }

        if (user?.rol === "DOCENTE") {
          if (showOnlyMine) {
            data = await visitasService.filtrarDocente(filterData)
          } else {
            data = await visitasService.getMisVisitasDocente()
          }
        } else if (user?.rol === "AUDITOR") {
          data = await visitasService.filtrarAuditor(filterData)
        } else if (user?.rol === "ADMIN") {
          data = await visitasService.filtrar(filterData)
        }

        setVisitas(data)
      } catch (err) {
        console.error("Error al cargar visitas:", err)
        setError("No se pudieron cargar las visitas.")
        toast.error("Error al cargar las visitas")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchVisitas()
    }
  }, [user, filters, showOnlyMine])

  const handleGenerarPdf = async (id: number) => {
    try {
      const blob = await visitasService.generarPdf(id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `visita-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("PDF generado exitosamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar el PDF")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead className="hidden md:table-cell">Asignatura</TableHead>
                <TableHead className="hidden lg:table-cell">Sede</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[60px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium">Error al cargar visitas</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  if (visitas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay visitas registradas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {showOnlyMine ? "Aun no tienes visitas registradas." : "No se encontraron visitas con los filtros aplicados."}
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
      <Table>
        <TableHeader className="bg-slate-50/70 dark:bg-slate-900/40">
          <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-slate-800">
            <TableHead className="w-[80px] font-semibold text-slate-700 dark:text-slate-300 py-3">ID</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-3">Docente</TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-300 py-3">Asignatura</TableHead>
            <TableHead className="hidden lg:table-cell font-semibold text-slate-700 dark:text-slate-300 py-3">Sede</TableHead>
            <TableHead className="hidden sm:table-cell font-semibold text-slate-700 dark:text-slate-300 py-3">Fecha</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-3">Estado</TableHead>
            <TableHead className="w-[60px] font-semibold text-slate-700 dark:text-slate-300 py-3">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitas.map((visita) => {
            const config = estadoConfig[visita.estadoVisita] || estadoConfig.BORRADOR
            const Icon = config.icon
            return (
              <TableRow key={visita.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 even:bg-slate-50/20 dark:even:bg-slate-900/5 border-b border-slate-150 dark:border-slate-800/60 transition-colors">
                <TableCell className="font-mono text-sm font-semibold text-slate-500 dark:text-slate-400 py-3.5">VIS-{String(visita.id).padStart(3, "0")}</TableCell>
                <TableCell className="py-3.5">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{visita.nombreDocente} {visita.apellidosDocente}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{visita.nombreAsignatura}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell py-3.5 text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="font-medium">{visita.nombreAsignatura}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell py-3.5 text-slate-600 dark:text-slate-300 font-medium">{visita.nombreSede}</TableCell>
                <TableCell className="hidden sm:table-cell py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{visita.fechaVisita}</p>
                    <p className="text-xs text-muted-foreground">{visita.horaInicio}</p>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge className={cn("px-2.5 py-0.5 font-medium rounded-full shadow-xs text-xs", config.className)}>
                    <Icon className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/visitas/${visita.id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerarPdf(visita.id)} className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        Generar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {visitas.length} visita{visitas.length !== 1 ? "s" : ""}
        </p>
      </div>
    </>
  )
}

function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  )
}
