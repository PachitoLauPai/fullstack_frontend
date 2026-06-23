"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ClipboardCheck, 
  Users, 
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Plus,
  FileText
} from "lucide-react"
import { RecentVisitsTable } from "@/components/dashboard/recent-visits-table"
import { useAuth, ROLE_PERMISSIONS } from "@/lib/auth-context"
import { dashboardService, DashboardAuditorStats } from "@/services/dashboard.service"
import Link from "next/link"
import { toast } from "sonner"

// Stats para Admin y Evaluador
const adminStats = [
  {
    title: "Visitas Este Mes",
    value: "47",
    change: "+12%",
    changeType: "positive" as const,
    icon: ClipboardCheck,
    description: "vs mes anterior"
  },
  {
    title: "Docentes Evaluados",
    value: "32",
    change: "+8%",
    changeType: "positive" as const,
    icon: Users,
    description: "vs mes anterior"
  },
  {
    title: "Cumplimiento General",
    value: "89%",
    change: "+5%",
    changeType: "positive" as const,
    icon: CheckCircle2,
    description: "promedio evaluaciones"
  },
  {
    title: "Requerimientos Pendientes",
    value: "7",
    change: "-3",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "por atender"
  },
]

// Stats para Docente
const docenteStats = [
  {
    title: "Mis Visitas Recibidas",
    value: "5",
    change: "",
    changeType: "positive" as const,
    icon: ClipboardCheck,
    description: "este semestre"
  },
  {
    title: "Cumplimiento",
    value: "92%",
    change: "+3%",
    changeType: "positive" as const,
    icon: CheckCircle2,
    description: "promedio general"
  },
  {
    title: "Requerimientos",
    value: "2",
    change: "",
    changeType: "negative" as const,
    icon: AlertTriangle,
    description: "pendientes de atencion"
  },
  {
    title: "Ultima Visita",
    value: "3",
    change: "",
    changeType: "positive" as const,
    icon: Calendar,
    description: "dias atras"
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const isDocente = user?.rol === "DOCENTE"
  const isAdmin = user?.rol === "ADMIN"
  const isAuditor = user?.rol === "AUDITOR"
  
  const [auditorStats, setAuditorStats] = useState<DashboardAuditorStats | null>(null)
  const [isLoading, setIsLoading] = useState(isAuditor)
  
  useEffect(() => {
    if (isAuditor) {
      cargarEstadisticasAuditor()
    }
  }, [isAuditor])
  
  async function cargarEstadisticasAuditor() {
    try {
      setIsLoading(true)
      const stats = await dashboardService.getAuditorStats()
      setAuditorStats(stats)
    } catch (error) {
      toast.error("Error al cargar estadísticas del dashboard")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Stats para Admin (estáticos por ahora)
  const adminStatsDisplay = [
    {
      title: "Visitas Este Mes",
      value: auditorStats?.visitasEsteMes.toString() || "0",
      icon: ClipboardCheck,
      description: "visitas registradas"
    },
    {
      title: "Docentes Evaluados",
      value: auditorStats?.docentesEvaluados.toString() || "0",
      icon: Users,
      description: "docentes únicos"
    },
    {
      title: "Requerimientos Pendientes",
      value: auditorStats?.requerimientosPendientes.toString() || "0",
      icon: AlertTriangle,
      description: "por atender"
    },
    {
      title: "Visitas Recientes",
      value: auditorStats?.visitasRecientes?.length.toString() || "0",
      icon: Calendar,
      description: "últimas registradas"
    },
  ]
  
  const stats = isDocente ? docenteStats : adminStatsDisplay
  const roleInfo = user ? ROLE_PERMISSIONS[user.rol] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {isDocente ? "Mi Panel" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isDocente 
              ? "Resumen de tus visitas y evaluaciones"
              : "Resumen general del sistema de visitas inopinadas"
            }
          </p>
        </div>

        {/* Quick Actions - Solo para Auditor */}
        {isAuditor && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/visitas/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Visita
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm">
          Conectado como <strong>{roleInfo?.label}</strong> - {roleInfo?.description}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading && isAuditor ? (
                <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {(stat as any).change && (stat as any).changeType && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={
                        (stat as any).changeType === "positive" 
                          ? "text-success text-xs font-medium" 
                          : "text-destructive text-xs font-medium"
                      }>
                        {(stat as any).change}
                      </span>
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  )}
                  {(!(stat as any).change || !(stat as any).changeType) && (
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables - Diferente segun rol */}
      {/* Proximas Visitas Programadas - OCULTO POR AHORA */}

      {/* Recent Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isDocente ? "Mis Visitas Recientes" : "Visitas Recientes"}
          </CardTitle>
          <CardDescription>
            {isDocente 
              ? "Ultimas visitas realizadas a tus clases"
              : "Ultimas visitas realizadas en el sistema"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentVisitsTable showOnlyMine={isDocente} />
        </CardContent>
      </Card>
    </div>
  )
}
