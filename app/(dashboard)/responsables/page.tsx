"use client"

import { useEffect, useState, type FormEvent } from "react"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Mail, Briefcase, ClipboardList, Eye, CheckCircle2, XCircle, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { responsablesService, type Responsable } from "@/services/responsables.service"
import { visitasService, type Visita } from "@/services/visitas.service"
import { Spinner } from "@/components/ui/spinner"

export default function ResponsablesPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <ResponsablesContent />
    </RouteGuard>
  )
}

function ResponsablesContent() {
  const { toast } = useToast()
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewVisitsDialogOpen, setViewVisitsDialogOpen] = useState(false)
  const [selectedResponsable, setSelectedResponsable] = useState<Responsable | null>(null)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    cargo: "",
    email: "",
    estadoActivo: true,
  })

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)
      try {
        const [responsablesData, visitasData] = await Promise.all([
          responsablesService.getAll(),
          visitasService.getAll(),
        ])

        setResponsables(
          responsablesData.map((responsable) => ({
            ...responsable,
            estadoActivo: responsable.estadoActivo ?? true,
          }))
        )
        setVisitas(visitasData)
      } catch (error) {
        console.error("Error al cargar responsables o visitas:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los responsables o las visitas",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [toast])

  const getVisitasRealizadas = (responsableId: number) =>
    visitas.filter((visita) => visita.idResponsable === responsableId).length

  const filteredResponsables = responsables.filter((responsable) => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true

    const fullName = `${responsable.nombres} ${responsable.apellidos}`.toLowerCase()
    const resIdStr = String(responsable.id)
    const resIdFormatted = `RES-${responsable.id.toString().padStart(3, "0")}`.toLowerCase()
    const cargo = (responsable.cargo || "").toLowerCase()
    const email = (responsable.email || "").toLowerCase()

    return (
      fullName.includes(term) ||
      resIdStr === term ||
      resIdFormatted.includes(term) ||
      cargo.includes(term) ||
      email.includes(term)
    )
  })

  const stats = {
    total: responsables.length,
    activos: responsables.filter((r) => r.estadoActivo).length,
    totalVisitas: responsables.reduce(
      (acc, responsable) => acc + getVisitasRealizadas(responsable.id),
      0
    ),
  }

  const resetForm = () => {
    setFormData({ nombres: "", apellidos: "", cargo: "", email: "", estadoActivo: true })
    setSelectedResponsable(null)
  }

  const handleCrearResponsable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.nombres || !formData.apellidos || !formData.email) {
      toast({
        title: "Error",
        description: "Completa los nombres, apellidos y correo electrónico",
        variant: "destructive",
      })
      return
    }

    try {
      const nuevoResponsable = await responsablesService.create({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cargo: formData.cargo || null,
        email: formData.email,
        estadoActivo: formData.estadoActivo,
      })

      setResponsables((current) => [
        ...current,
        { ...nuevoResponsable, estadoActivo: formData.estadoActivo },
      ])
      toast({ title: "Éxito", description: "Responsable registrado correctamente" })
      resetForm()
      setNewDialogOpen(false)
    } catch (error) {
      console.error("Error al crear responsable:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el responsable",
        variant: "destructive",
      })
    }
  }

  const handleEditarResponsable = (responsable: Responsable) => {
    setSelectedResponsable(responsable)
    setFormData({
      nombres: responsable.nombres,
      apellidos: responsable.apellidos,
      cargo: responsable.cargo ?? "",
      email: responsable.email ?? "",
      estadoActivo: responsable.estadoActivo ?? true,
    })
    setEditDialogOpen(true)
  }

  const handleGuardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedResponsable) return

    if (!formData.nombres || !formData.apellidos || !formData.email) {
      toast({
        title: "Error",
        description: "Completa los nombres, apellidos y correo electrónico",
        variant: "destructive",
      })
      return
    }

    try {
      const actualizado = await responsablesService.update(selectedResponsable.id, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cargo: formData.cargo || null,
        email: formData.email,
        estadoActivo: formData.estadoActivo,
      })

      setResponsables((current) =>
        current.map((responsable) =>
          responsable.id === selectedResponsable.id
            ? {
                ...responsable,
                ...actualizado,
                estadoActivo: formData.estadoActivo,
              }
            : responsable
        )
      )

      toast({ title: "Éxito", description: "Responsable actualizado correctamente" })
      resetForm()
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error al actualizar responsable:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el responsable",
        variant: "destructive",
      })
    }
  }

  const handleToggleEstado = async (responsable: Responsable) => {
    const nuevoEstado = !responsable.estadoActivo
    try {
      await responsablesService.update(responsable.id, {
        nombres: responsable.nombres,
        apellidos: responsable.apellidos,
        cargo: responsable.cargo,
        email: responsable.email,
        estadoActivo: nuevoEstado,
      })
      setResponsables((current) =>
        current.map((item) =>
          item.id === responsable.id ? { ...item, estadoActivo: nuevoEstado } : item
        )
      )
      toast({
        title: "Éxito",
        description: `Responsable ${nuevoEstado ? "activado" : "desactivado"}`,
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del responsable",
        variant: "destructive",
      })
    }
  }

  const handleVerVisitas = (responsable: Responsable) => {
    setSelectedResponsable(responsable)
    setViewVisitsDialogOpen(true)
  }

  const handleEliminarResponsable = async (responsable: Responsable) => {
    const confirmed = window.confirm(`¿Eliminar a ${responsable.nombres} ${responsable.apellidos}?`)
    if (!confirmed) return

    try {
      await responsablesService.delete(responsable.id)
      setResponsables((current) => current.filter((item) => item.id !== responsable.id))
      toast({ title: "Éxito", description: "Responsable eliminado" })
    } catch (error) {
      console.error("Error al eliminar responsable:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el responsable",
        variant: "destructive",
      })
    }
  }

  const responsableVisitas = selectedResponsable
    ? visitas.filter((visita) => visita.idResponsable === selectedResponsable.id)
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Responsables de Visita</h1>
          <p className="text-muted-foreground">
            Gestion de auditores y responsables de las visitas inopinadas
          </p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Responsable
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Responsable de Visita</DialogTitle>
              <DialogDescription>
                Ingrese los datos del responsable/auditor de visitas inopinadas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCrearResponsable} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    placeholder="Nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    placeholder="Apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  placeholder="Ej: Vicerrector Academico, Decano, Director de Escuela"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Correo Electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="responsable@universidad.edu.pe"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setNewDialogOpen(false); resetForm() }}>
                  Cancelar
                </Button>
                <Button type="submit">Registrar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Responsables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.activos} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Visitas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitas}</div>
            <p className="text-xs text-muted-foreground">En total acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Promedio por Responsable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {stats.total > 0 ? (stats.totalVisitas / stats.total).toFixed(1) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">visitas por responsable</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Lista de Responsables
          </CardTitle>
          <CardDescription>
            Personal autorizado para realizar visitas inopinadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cargo o email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-6 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Visitas Realizadas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponsables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No hay responsables que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResponsables.map((responsable) => (
                      <TableRow key={responsable.id}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-muted-foreground">
                            RES-{responsable.id.toString().padStart(3, "0")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {responsable.nombres} {responsable.apellidos}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {responsable.cargo || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {responsable.email || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {getVisitasRealizadas(responsable.id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={responsable.estadoActivo ? "default" : "secondary"}>
                            {responsable.estadoActivo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleToggleEstado(responsable)}>
                                {responsable.estadoActivo ? (
                                  <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                {responsable.estadoActivo ? "Desactivar" : "Activar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleVerVisitas(responsable)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver visitas
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleEditarResponsable(responsable)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onSelect={() => handleEliminarResponsable(responsable)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setEditDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Responsable</DialogTitle>
            <DialogDescription>
              Actualiza los datos del responsable de visita
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuardarEdicion} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombres">Nombres</Label>
                <Input
                  id="edit-nombres"
                  placeholder="Nombres"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellidos">Apellidos</Label>
                <Input
                  id="edit-apellidos"
                  placeholder="Apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cargo">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Cargo
              </Label>
              <Input
                id="edit-cargo"
                placeholder="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">
                <Mail className="h-4 w-4 inline mr-1" />
                Correo Electronico
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="responsable@universidad.edu.pe"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => { setEditDialogOpen(false); resetForm() }}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewVisitsDialogOpen} onOpenChange={setViewVisitsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Visitas del responsable</DialogTitle>
            <DialogDescription>
              {selectedResponsable ? `${selectedResponsable.nombres} ${selectedResponsable.apellidos}` : "Selecciona un responsable para ver sus visitas."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 min-w-0">
            {responsableVisitas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No se encontraron visitas para este responsable.</p>
            ) : (
              <div className="rounded-md border overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Docente</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responsableVisitas.map((visita) => (
                      <TableRow key={visita.id}>
                        <TableCell>{visita.fechaVisita}</TableCell>
                        <TableCell>{`${visita.horaInicio} - ${visita.horaTermino}`}</TableCell>
                        <TableCell>{visita.nombreDocente}</TableCell>
                        <TableCell>{visita.nombreSede}</TableCell>
                        <TableCell>{visita.estadoVisita}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewVisitsDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
