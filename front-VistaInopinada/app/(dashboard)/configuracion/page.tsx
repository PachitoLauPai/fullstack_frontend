"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Bell, Shield, Database, Save } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

export default function ConfiguracionPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configuracion</h1>
        <p className="text-muted-foreground">
          Administra la configuracion del sistema
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Universidad Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informacion de la Universidad
            </CardTitle>
            <CardDescription>
              Datos generales de la institucion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="universidad">Nombre de la Universidad</Label>
              <Input id="universidad" defaultValue="Universidad Nacional de Ingenieria" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vicerrectorado">Vicerrectorado</Label>
              <Input id="vicerrectorado" defaultValue="Vicerrectorado Academico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facultad">Facultad</Label>
              <Input id="facultad" defaultValue="Facultad de Ciencias" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escuela">Escuela Profesional</Label>
              <Input id="escuela" defaultValue="Escuela de Ingenieria de Sistemas" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigoForm">Codigo Formulario</Label>
                <Input id="codigoForm" defaultValue="F-AC-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" defaultValue="2.0" />
              </div>
            </div>
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura las alertas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por correo</Label>
                <p className="text-sm text-muted-foreground">Recibir resumen diario de actividad</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de requerimientos</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando hay requerimientos pendientes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorio de visitas</Label>
                <p className="text-sm text-muted-foreground">Recordar visitas programadas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones push</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones en el navegador</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Opciones de seguridad y acceso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tiempo de sesion</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticacion de dos factores</Label>
                <p className="text-sm text-muted-foreground">Mayor seguridad en el acceso</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de actividad</Label>
                <p className="text-sm text-muted-foreground">Guardar historial de acciones</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Datos del Sistema
            </CardTitle>
            <CardDescription>
              Gestion de datos y respaldos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Ultimo respaldo</p>
              <p className="text-xs text-muted-foreground">7 de abril de 2026, 03:00 AM</p>
            </div>
            <div className="space-y-2">
              <Label>Frecuencia de respaldo</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Exportar Datos
              </Button>
              <Button variant="outline" className="flex-1">
                Crear Respaldo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </RouteGuard>
  )
}
