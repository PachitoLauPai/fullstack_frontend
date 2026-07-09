"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { visitasService, type Visita } from "@/services/visitas.service"
import { useAuth } from "@/lib/auth-context"

const estadoConfig: Record<string, { label: string; icon: typeof CheckCircle2; variant: "default" | "secondary" | "destructive"; className: string }> = {
  BORRADOR: { label: "Borrador", icon: Clock, variant: "secondary", className: "bg-muted text-muted-foreground" },
  FIRMADA_DOCENTE: { label: "Firmada Docente", icon: CheckCircle2, variant: "default", className: "bg-primary text-primary-foreground" },
  COMPLETADA: { label: "Completada", icon: CheckCircle2, variant: "default", className: "bg-success text-success-foreground hover:bg-success/90" },
  AUDITADA: { label: "Auditada", icon: CheckCircle2, variant: "default", className: "bg-info text-info-foreground" },
}

interface RecentVisitsTableProps {
  showOnlyMine?: boolean
}

export function RecentVisitsTable({ showOnlyMine = false }: RecentVisitsTableProps) {
  const { user } = useAuth()
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVisitas() {
      try {
        setIsLoading(true)
        let data: Visita[] = []

        if (user?.rol === "DOCENTE") {
          data = await visitasService.getMisVisitasDocente()
        } else if (user?.rol === "AUDITOR") {
          data = await visitasService.getMisVisitasAuditor()
        } else if (user?.rol === "ADMIN") {
          data = await visitasService.getAll()
        }

        setVisitas(data.slice(0, 5))
      } catch {
        setVisitas([])
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchVisitas()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (visitas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay visitas recientes para mostrar.
      </p>
    )
  }

  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitas.map((visita) => {
            const config = estadoConfig[visita.estadoVisita] || estadoConfig.BORRADOR
            const Icon = config.icon
            return (
              <TableRow key={visita.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-sm">
                  <Link href={`/visitas/${visita.id}`} className="hover:underline">
                    VIS-{String(visita.id).padStart(3, "0")}
                  </Link>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{visita.nombreDocente} {visita.apellidosDocente}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{visita.nombreAsignatura}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{visita.nombreAsignatura}</TableCell>
                <TableCell className="hidden lg:table-cell">{visita.nombreSede}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div>
                    <p className="text-sm">{visita.fechaVisita}</p>
                    <p className="text-xs text-muted-foreground">{visita.horaInicio}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={config.variant} className={config.className}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
