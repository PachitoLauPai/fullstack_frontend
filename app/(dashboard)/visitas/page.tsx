"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { VisitasFilters, type FiltersState } from "@/components/visitas/visitas-filters"
import { VisitasTable } from "@/components/visitas/visitas-table"
import { useAuth } from "@/lib/auth-context"

export default function VisitasPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<FiltersState>({
    busqueda: "",
    idSede: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  })

  const isDocente = user?.rol === "DOCENTE"
  const isAdmin = user?.rol === "ADMIN"
  const canCreateVisita = user?.rol === "AUDITOR"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {isDocente ? "Mis Visitas" : "Visitas Inopinadas"}
          </h1>
          <p className="text-muted-foreground">
            {isDocente 
              ? "Historial de visitas realizadas a tus clases"
              : "Gestiona y registra las visitas de supervision"
            }
          </p>
        </div>
        {/* Botón Programar Visita - OCULTO POR AHORA */}
        {/* {isAdmin && (
          <Button asChild>
            <Link href="/visitas/programar">
              <Plus className="h-4 w-4 mr-2" />
              Programar Visita
            </Link>
          </Button>
        )} */}
        {canCreateVisita && (
          <Button asChild>
            <Link href="/visitas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Visita
            </Link>
          </Button>
        )}
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isDocente ? "Mis Visitas Recibidas" : "Lista de Visitas"}
          </CardTitle>
          <CardDescription>
            {isDocente 
              ? "Todas las visitas de supervision realizadas a tus clases"
              : "Todas las visitas registradas en el sistema"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isDocente && <VisitasFilters onFiltersChange={setFilters} />}
          <VisitasTable showOnlyMine={isDocente} filters={filters} />
        </CardContent>
      </Card>
    </div>
  )
}
