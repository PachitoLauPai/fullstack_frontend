"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, FileBarChart, Users, Building2 } from "lucide-react"
import { VisitasPorSedeChart } from "@/components/reportes/visitas-por-sede-chart"
import { RouteGuard } from "@/components/route-guard"
import { useToast } from "@/hooks/use-toast"
import { reportesService, ReporteData, PeriodoReporte } from "@/services/reportes.service"

export default function ReportesPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <ReportesContent />
    </RouteGuard>
  )
}

function ReportesContent() {
  const { toast } = useToast()
  const [periodo, setPeriodo] = useState<PeriodoReporte>("semester")
  const [reportData, setReportData] = useState<ReporteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    ;(async () => {
      await cargarReporte(periodo)
    })()
  }, [periodo])

  const cargarReporte = async (periodoSeleccionado: PeriodoReporte) => {
    setLoading(true)
    try {
      const data = await reportesService.getReporteCompleto(periodoSeleccionado)
      setReportData(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error al cargar reportes",
        description: "No se pudo obtener la información del servidor.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    setExporting(true)
    try {
      const blob = await reportesService.exportPdf(periodo)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `reporte_visitas_${periodo}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      toast({
        title: "Exportación fallida",
        description: "No se pudo generar el PDF de reporte.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const estadisticas = reportData?.estadisticas
  const visitasPorSede = reportData?.visitasPorSede ?? []
  const topDocentes = reportData?.topDocentes ?? []
  const requerimientos = reportData?.requerimientosPendientes ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">Estadísticas y análisis del sistema</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(value) => setPeriodo(value as PeriodoReporte)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="semester">Este semestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPdf} disabled={exporting || loading}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visitas</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : estadisticas?.totalVisitas ?? "--"}</p>
            <p className={`text-xs ${((estadisticas?.totalVisitasCrecimiento ?? 0) >= 0) ? "text-success" : "text-destructive"}`}>
              {loading ? "Cargando..." : `${estadisticas?.totalVisitasCrecimiento ?? 0}% vs periodo anterior`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Docentes Visitados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : estadisticas?.docentesVisitados ?? "--"}</p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando..." : `de ${estadisticas?.totalDocentes ?? "--"} docentes`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sedes Activas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loading ? "..." : estadisticas?.sedesActivas ?? "--"}</p>
            <p className="text-xs text-muted-foreground">
              {loading ? "Cargando..." : estadisticas?.sedesDescripcion ?? "Con visitas registradas"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitas por Sede</CardTitle>
          <CardDescription>Distribución de visitas entre sedes</CardDescription>
        </CardHeader>
        <CardContent>
          <VisitasPorSedeChart data={visitasPorSede} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Docentes - Mayor Cumplimiento</CardTitle>
            <CardDescription>Docentes con mejor desempeño</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDocentes.length > 0
                ? topDocentes.map((docente, index) => (
                    <div key={docente.ranking} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{docente.nombre}</p>
                        <p className="text-xs text-muted-foreground">{docente.totalVisitas} visitas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">{docente.cumplimiento}%</p>
                      </div>
                    </div>
                  ))
                : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles.</p>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requerimientos Pendientes</CardTitle>
            <CardDescription>Requerimientos de mejora por atender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requerimientos.length > 0
                ? requerimientos.map((req) => (
                    <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${req.tipo === "alta" ? "bg-destructive" : "bg-warning"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{req.descripcion}</p>
                        <p className="text-xs text-muted-foreground">{req.docente}</p>
                        <p className="text-xs text-muted-foreground mt-1">{req.fecha}</p>
                      </div>
                    </div>
                  ))
                : (
                  <p className="text-sm text-muted-foreground">No hay requerimientos pendientes.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
