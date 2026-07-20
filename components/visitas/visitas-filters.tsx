"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, X } from "lucide-react"
import { sedesService, type Sede } from "@/services/sedes.service"
import { visitasService } from "@/services/visitas.service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface VisitasFiltersProps {
  onFiltersChange?: (filters: FiltersState) => void
}

export interface FiltersState {
  busqueda: string
  idSede: string
  estado: string
  fechaDesde: string
  fechaHasta: string
}

export function VisitasFilters({ onFiltersChange }: VisitasFiltersProps) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoadingSedes, setIsLoadingSedes] = useState(true)
  const [filters, setFilters] = useState<FiltersState>({
    busqueda: "",
    idSede: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
  })
  const [isExporting, setIsExporting] = useState(false)

  // Cargar sedes
  useEffect(() => {
    async function loadSedes() {
      try {
        const data = await sedesService.getAll()
        setSedes(data)
      } catch (error) {
        console.error("Error al cargar sedes:", error)
        toast.error("No se pudieron cargar las sedes")
      } finally {
        setIsLoadingSedes(false)
      }
    }

    loadSedes()
  }, [])

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    // Si el valor es "all" o "none", convertir a string vacío para los filtros
    const actualValue = (value === "all" || value === "none") ? "" : value
    const newFilters = { ...filters, [key]: actualValue }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleReset = () => {
    const emptyFilters: FiltersState = {
      busqueda: "",
      idSede: "",
      estado: "",
      fechaDesde: "",
      fechaHasta: "",
    }
    setFilters(emptyFilters)
    onFiltersChange?.(emptyFilters)
  }

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const payload = {
        busqueda: filters.busqueda || null,
        idSede: filters.idSede ? Number(filters.idSede) : null,
        estado: filters.estado || null,
        fechaDesde: filters.fechaDesde || null,
        fechaHasta: filters.fechaHasta || null,
      }
      const blob = await visitasService.exportarPdf(payload)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `visitas_filtradas.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("PDF exportado con los filtros actuales")
    } catch (error) {
      console.error("Error al exportar PDF:", error)
      toast.error("No se pudo exportar el PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== "")

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por docente, asignatura o ID..."
            className="pl-10 bg-slate-50/60 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 focus-visible:bg-white dark:focus-visible:bg-slate-900/60 focus-visible:border-[#0066ff] focus-visible:ring-[#0066ff]/20 h-10 transition-all text-slate-700 dark:text-slate-200"
            value={filters.busqueda}
            onChange={(e) => handleFilterChange("busqueda", e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-10 w-10 text-slate-500 border-slate-200"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-[#0066ff] to-[#0052cc] text-white hover:opacity-95 shadow transition-all duration-200 font-medium whitespace-nowrap px-4 h-10 cursor-pointer"
            onClick={handleExportPdf}
            disabled={isExporting}
            title={hasActiveFilters ? "Exportar visitas que coinciden con los filtros aplicados" : "Exportar todas las visitas"}
          >
            <Download className={cn("h-4 w-4", isExporting && "animate-bounce")} />
            <span>
              {isExporting 
                ? "Exportando..." 
                : hasActiveFilters 
                  ? "Exportar Filtrados" 
                  : "Exportar Todo (PDF)"
              }
            </span>
            {hasActiveFilters && (
              <span className="flex h-2 w-2 relative ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sede Filter */}
        <Select
          value={filters.idSede ? filters.idSede : "all"}
          onValueChange={(value) => handleFilterChange("idSede", value)}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-slate-50/60 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 h-10 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900/60 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all">
            <SelectValue placeholder="Sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {isLoadingSedes ? (
              <SelectItem value="loading" disabled>
                Cargando...
              </SelectItem>
            ) : (
              sedes.map((sede) => (
                <SelectItem key={sede.id} value={String(sede.id)}>
                  {sede.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Estado Filter */}
        <Select
          value={filters.estado ? filters.estado : "all"}
          onValueChange={(value) => handleFilterChange("estado", value)}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-slate-50/60 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 h-10 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900/60 focus:ring-[#0066ff]/20 focus:border-[#0066ff] transition-all">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="BORRADOR">Borrador</SelectItem>
            <SelectItem value="FIRMADA_DOCENTE">Firmada Docente</SelectItem>
            <SelectItem value="COMPLETADA">Completada</SelectItem>
            <SelectItem value="AUDITADA">Auditada</SelectItem>
          </SelectContent>
        </Select>

        {/* Fecha Desde */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Desde:</span>
          <input
            type="date"
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/60 dark:bg-slate-900/20 text-sm w-full md:w-[160px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/10 focus:bg-white transition-all"
            value={filters.fechaDesde}
            onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
            title="Fecha Desde"
          />
        </div>

        {/* Fecha Hasta */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Hasta:</span>
          <input
            type="date"
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50/60 dark:bg-slate-900/20 text-sm w-full md:w-[160px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/10 focus:bg-white transition-all"
            value={filters.fechaHasta}
            onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
            title="Fecha Hasta"
          />
        </div>
      </div>
    </div>
  )
}
