"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Users, ClipboardCheck, TrendingUp, Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { useToast } from "@/hooks/use-toast"
import { sedesService, type Sede } from "@/services/sedes.service"
import { universidadesService, type Universidad } from "@/services/universidades.service"
import { Spinner } from "@/components/ui/spinner"

export default function SedesPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <SedesContent />
    </RouteGuard>
  )
}

function SedesContent() {
  const { toast } = useToast()
  const [sedes, setSedes] = useState<Sede[]>([])
  const [universidades, setUniversidades] = useState<Universidad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null)
  const [formData, setFormData] = useState({ nombre: "", idUniversidad: 0 })
  const [formError, setFormError] = useState({ nombre: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [sedesData, universidadesData] = await Promise.all([
        sedesService.getAll(),
        universidadesService.getAll(),
      ])
      setSedes(sedesData)
      setUniversidades(universidadesData)
    } catch (error) {
      console.error("Error cargando sedes o universidades:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las sedes o universidades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedSede(null)
    setFormData({ nombre: "", idUniversidad: 0 })
    setFormError({ nombre: "" })
  }

  const handleCreateSede = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.nombre.trim()) {
      setFormError({ nombre: "El nombre de la sede es obligatorio." })
      toast({
        title: "Error",
        description: "El nombre de la sede no puede quedar vacío.",
        variant: "destructive",
      })
      return
    }

    if (formData.idUniversidad === 0) {
      toast({
        title: "Error",
        description: "Selecciona una universidad",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const nuevaSede = await sedesService.create({
        nombre: formData.nombre,
        idUniversidad: formData.idUniversidad,
      })
      setSedes((current) => [nuevaSede, ...current])
      toast({ title: "Éxito", description: "Sede creada correctamente" })
      resetForm()
      setNewDialogOpen(false)
    } catch (error) {
      console.error("Error creando sede:", error)
      toast({ title: "Error", description: "No se pudo crear la sede", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSede = (sede: Sede) => {
    setSelectedSede(sede)
    setFormData({ nombre: sede.nombre, idUniversidad: sede.idUniversidad })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSede) return

    if (!formData.nombre.trim()) {
      setFormError({ nombre: "El nombre de la sede es obligatorio." })
      toast({
        title: "Error",
        description: "El nombre de la sede no puede quedar vacío.",
        variant: "destructive",
      })
      return
    }

    if (formData.idUniversidad === 0) {
      toast({
        title: "Error",
        description: "Selecciona una universidad",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const sedeActualizada = await sedesService.update(selectedSede.id, {
        nombre: formData.nombre,
        idUniversidad: formData.idUniversidad,
      })
      setSedes((current) => current.map((item) => (item.id === sedeActualizada.id ? sedeActualizada : item)))
      toast({ title: "Éxito", description: "Sede actualizada correctamente" })
      resetForm()
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error actualizando sede:", error)
      toast({ title: "Error", description: "No se pudo actualizar la sede", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewSede = (sede: Sede) => {
    setSelectedSede(sede)
    setViewDialogOpen(true)
  }

  const handleDeleteSede = async (sede: Sede) => {
    const confirmed = window.confirm(`¿Eliminar la sede ${sede.nombre}?`)
    if (!confirmed) return

    try {
      await sedesService.delete(sede.id)
      setSedes((current) => current.filter((item) => item.id !== sede.id))
      toast({ title: "Éxito", description: "Sede eliminada correctamente" })
    } catch (error) {
      console.error("Error eliminando sede:", error)
      toast({ title: "Error", description: "No se pudo eliminar la sede", variant: "destructive" })
    }
  }

  const filteredSedes = sedes.filter((sede) => {
    const query = searchTerm.toLowerCase()
    return [sede.nombre, sede.nombreUniversidad]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  })

  const totalUniversidades = new Set(sedes.map((sede) => sede.nombreUniversidad)).size
  const promedioSedesPorUniversidad = totalUniversidades > 0 ? Math.round(sedes.length / totalUniversidades) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sedes</h1>
          <p className="text-muted-foreground">Gestiona las sedes de la universidad</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setNewDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sede
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Sede</DialogTitle>
              <DialogDescription>Agrega una nueva sede ligada a una universidad existente</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSede} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la sede</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(event) => {
                    setFormData({ ...formData, nombre: event.target.value })
                    if (event.target.value.trim()) {
                      setFormError({ nombre: "" })
                    }
                  }}
                  placeholder="Nombre de la sede"
                />
                {formError.nombre ? (
                  <p className="text-sm text-destructive mt-1">{formError.nombre}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="universidad">Universidad</Label>
                <Select
                  value={formData.idUniversidad ? String(formData.idUniversidad) : ""}
                  onValueChange={(value) => setFormData({ ...formData, idUniversidad: Number(value) })}
                >
                  <SelectTrigger id="universidad">
                    <SelectValue placeholder="Selecciona una universidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {universidades.map((universidad) => (
                      <SelectItem key={universidad.id} value={String(universidad.id)}>
                        {universidad.nombreUniversidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setNewDialogOpen(false); resetForm() }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sedes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sedes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Universidades</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUniversidades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sedes / Universidad</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{promedioSedesPorUniversidad}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última actualización</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Ahora</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de sedes</CardTitle>
          <CardDescription>Busca, edita o agrega una sede nueva</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sede o universidad..."
              className="pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : filteredSedes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No hay sedes registradas.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSedes.map((sede) => (
                <Card key={sede.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          {sede.nombre}
                        </CardTitle>
                        <CardDescription className="mt-1">{`ID ${sede.id}`}</CardDescription>
                      </div>
                      <Badge className="bg-success text-success-foreground">Activa</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-medium">Universidad</div>
                      <div className="text-muted-foreground">{sede.nombreUniversidad}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Sede</p>
                        <p className="font-medium">{sede.nombre}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Código</p>
                        <p className="font-medium">{sede.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewSede(sede)}>
                        <Eye className="mr-2 h-4 w-4" />Ver Detalle
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditSede(sede)}>
                        <Edit className="mr-2 h-4 w-4" />Editar
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteSede(sede)}>
                        <Trash2 className="mr-2 h-4 w-4" />Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setEditDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Sede</DialogTitle>
            <DialogDescription>Actualiza la información de la sede seleccionada</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre de la sede</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(event) => {
                  setFormData({ ...formData, nombre: event.target.value })
                  if (event.target.value.trim()) {
                    setFormError({ nombre: "" })
                  }
                }}
                placeholder="Nombre de la sede"
              />
              {formError.nombre ? (
                <p className="text-sm text-destructive mt-1">{formError.nombre}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-universidad">Universidad</Label>
              <Select
                value={formData.idUniversidad ? String(formData.idUniversidad) : ""}
                onValueChange={(value) => setFormData({ ...formData, idUniversidad: Number(value) })}
              >
                <SelectTrigger id="edit-universidad">
                  <SelectValue placeholder="Selecciona una universidad" />
                </SelectTrigger>
                <SelectContent>
                  {universidades.map((universidad) => (
                    <SelectItem key={universidad.id} value={String(universidad.id)}>
                      {universidad.nombreUniversidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => { setEditDialogOpen(false); resetForm() }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={(open) => { if (!open) setViewDialogOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Sede</DialogTitle>
            <DialogDescription>Consulta la información registrada de la sede</DialogDescription>
          </DialogHeader>
          {selectedSede ? (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{selectedSede.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Universidad</p>
                <p className="font-medium">{selectedSede.nombreUniversidad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID de sede</p>
                <p className="font-medium">{selectedSede.id}</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">Selecciona una sede para ver el detalle.</div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
