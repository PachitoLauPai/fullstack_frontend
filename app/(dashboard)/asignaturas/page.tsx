"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Search, MoreHorizontal, Eye, Edit } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { useToast } from "@/hooks/use-toast"
import { asignaturasService, type Asignatura } from "@/services/asignaturas.service"
import { Spinner } from "@/components/ui/spinner"

export default function AsignaturasPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <AsignaturasContent />
    </RouteGuard>
  )
}

function AsignaturasContent() {
  const { toast } = useToast()
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedAsignatura, setSelectedAsignatura] = useState<Asignatura | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    campoFormativo: "",
    cicloAcademico: "",
    turno: "",
    tipoHorario: "",
  })

  useEffect(() => {
    cargarAsignaturas()
  }, [])

  const cargarAsignaturas = async () => {
    setLoading(true)
    try {
      const data = await asignaturasService.getAll()
      setAsignaturas(data)
    } catch (error) {
      console.error("Error cargando asignaturas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las asignaturas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", campoFormativo: "", cicloAcademico: "", turno: "", tipoHorario: "" })
    setSelectedAsignatura(null)
  }

  const handleCreateAsignatura = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.nombre) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" })
      return
    }

    try {
      const nuevo = await asignaturasService.create({
        nombre: formData.nombre,
        campoFormativo: formData.campoFormativo || null,
        cicloAcademico: formData.cicloAcademico || null,
        turno: formData.turno || null,
        tipoHorario: formData.tipoHorario || null,
      })
      setAsignaturas((current) => [nuevo, ...current])
      toast({ title: "Éxito", description: "Asignatura creada correctamente" })
      resetForm()
      setNewDialogOpen(false)
    } catch (error) {
      console.error("Error creando asignatura:", error)
      toast({ title: "Error", description: "No se pudo crear la asignatura", variant: "destructive" })
    }
  }

  const handleEditAsignatura = (asignatura: Asignatura) => {
    setSelectedAsignatura(asignatura)
    setFormData({
      nombre: asignatura.nombre,
      campoFormativo: asignatura.campoFormativo ?? "",
      cicloAcademico: asignatura.cicloAcademico ?? "",
      turno: asignatura.turno ?? "",
      tipoHorario: asignatura.tipoHorario ?? "",
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAsignatura) return
    if (!formData.nombre) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" })
      return
    }

    try {
      const actualizado = await asignaturasService.update(selectedAsignatura.id, {
        nombre: formData.nombre,
        campoFormativo: formData.campoFormativo || null,
        cicloAcademico: formData.cicloAcademico || null,
        turno: formData.turno || null,
        tipoHorario: formData.tipoHorario || null,
      })
      setAsignaturas((current) => current.map((item) => (item.id === actualizado.id ? actualizado : item)))
      toast({ title: "Éxito", description: "Asignatura actualizada correctamente" })
      resetForm()
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error actualizando asignatura:", error)
      toast({ title: "Error", description: "No se pudo actualizar la asignatura", variant: "destructive" })
    }
  }

  const handleViewAsignatura = async (id: number) => {
    setLoading(true)
    try {
      const asignatura = await asignaturasService.getById(id)
      setSelectedAsignatura(asignatura)
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Error cargando detalle:", error)
      toast({ title: "Error", description: "No se pudo cargar el detalle", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredAsignaturas = asignaturas.filter((asig) => {
    const query = searchTerm.toLowerCase()
    return [
      asig.nombre,
      asig.campoFormativo,
      asig.cicloAcademico,
      asig.turno,
      asig.tipoHorario,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Asignaturas</h1>
          <p className="text-muted-foreground">Gestiona las asignaturas del programa</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setNewDialogOpen(open) }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Asignatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Asignatura</DialogTitle>
              <DialogDescription>Agrega una nueva asignatura al sistema</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAsignatura} className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-sm font-medium">Nombre</label>
                <Input
                  id="nombre"
                  placeholder="Nombre de la asignatura"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="campoFormativo" className="block text-sm font-medium">Campo Formativo</label>
                <Select value={formData.campoFormativo} onValueChange={(value) => setFormData({ ...formData, campoFormativo: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Campo formativo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESTUDIOS GENERALES">ESTUDIOS GENERALES</SelectItem>
                    <SelectItem value="ESTUDIOS ESPECÍFICOS">ESTUDIOS ESPECÍFICOS</SelectItem>
                    <SelectItem value="ESTUDIOS DE ESPECIALIDAD">ESTUDIOS DE ESPECIALIDAD</SelectItem>
                    <SelectItem value="PRÁCTICAS PRE-PROFESIONALES">PRÁCTICAS PRE-PROFESIONALES</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="cicloAcademico" className="block text-sm font-medium">Ciclo</label>
                  <Select value={formData.cicloAcademico} onValueChange={(value) => setFormData({ ...formData, cicloAcademico: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "I",
                        "II",
                        "III",
                        "IV",
                        "V",
                        "VI",
                        "VII",
                        "VIII",
                        "IX",
                        "X",
                      ].map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="turno" className="block text-sm font-medium">Turno</label>
                  <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAÑANA">MAÑANA</SelectItem>
                      <SelectItem value="TARDE">TARDE</SelectItem>
                      <SelectItem value="NOCHE">NOCHE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="tipoHorario" className="block text-sm font-medium">Tipo de Horario</label>
                <Select value={formData.tipoHorario} onValueChange={(value) => setFormData({ ...formData, tipoHorario: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de horario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEORÍA">TEORÍA</SelectItem>
                    <SelectItem value="PRÁCTICA">PRÁCTICA</SelectItem>
                    <SelectItem value="MIXTA (TEORÍA + PRÁCTICA)">MIXTA (TEORÍA + PRÁCTICA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setNewDialogOpen(false); resetForm() }}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Asignaturas</CardTitle>
          <CardDescription>Todas las asignaturas registradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar asignatura..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 flex justify-center">
                <Spinner />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asignatura</TableHead>
                    <TableHead className="hidden md:table-cell">Campo Formativo</TableHead>
                    <TableHead className="hidden sm:table-cell">Ciclo</TableHead>
                    <TableHead className="hidden lg:table-cell">Turno</TableHead>
                    <TableHead className="hidden sm:table-cell">Horario</TableHead>
                    <TableHead className="w-16">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAsignaturas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No hay asignaturas que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAsignaturas.map((asig) => (
                      <TableRow key={asig.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{asig.nombre}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{asig.campoFormativo || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{asig.campoFormativo || "-"}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{asig.cicloAcademico || "-"}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{asig.turno || "-"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{asig.tipoHorario || "-"}</TableCell>
                        <TableCell className="w-16">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleViewAsignatura(asig.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleEditAsignatura(asig)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
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
            <DialogTitle>Editar Asignatura</DialogTitle>
            <DialogDescription>Actualiza los datos de la asignatura</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-nombre" className="block text-sm font-medium">Nombre</label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-campoFormativo" className="block text-sm font-medium">Campo Formativo</label>
              <Select value={formData.campoFormativo} onValueChange={(value) => setFormData({ ...formData, campoFormativo: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Campo formativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDIOS GENERALES">ESTUDIOS GENERALES</SelectItem>
                  <SelectItem value="ESTUDIOS ESPECÍFICOS">ESTUDIOS ESPECÍFICOS</SelectItem>
                  <SelectItem value="ESTUDIOS DE ESPECIALIDAD">ESTUDIOS DE ESPECIALIDAD</SelectItem>
                  <SelectItem value="PRÁCTICAS PRE-PROFESIONALES">PRÁCTICAS PRE-PROFESIONALES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-cicloAcademico" className="block text-sm font-medium">Ciclo</label>
                <Select value={formData.cicloAcademico} onValueChange={(value) => setFormData({ ...formData, cicloAcademico: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "I",
                      "II",
                      "III",
                      "IV",
                      "V",
                      "VI",
                      "VII",
                      "VIII",
                      "IX",
                      "X",
                    ].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-turno" className="block text-sm font-medium">Turno</label>
                <Select value={formData.turno} onValueChange={(value) => setFormData({ ...formData, turno: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAÑANA">MAÑANA</SelectItem>
                    <SelectItem value="TARDE">TARDE</SelectItem>
                    <SelectItem value="NOCHE">NOCHE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-tipoHorario" className="block text-sm font-medium">Tipo de Horario</label>
              <Select value={formData.tipoHorario} onValueChange={(value) => setFormData({ ...formData, tipoHorario: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo de horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEORÍA">TEORÍA</SelectItem>
                  <SelectItem value="PRÁCTICA">PRÁCTICA</SelectItem>
                  <SelectItem value="MIXTA (TEORÍA + PRÁCTICA)">MIXTA (TEORÍA + PRÁCTICA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => { setEditDialogOpen(false); resetForm() }}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={(open) => { if (!open) setSelectedAsignatura(null); setViewDialogOpen(open) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Asignatura</DialogTitle>
            <DialogDescription>Consulta los detalles completos de la asignatura</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedAsignatura ? (
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p>{selectedAsignatura.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Campo Formativo</p>
                  <p>{selectedAsignatura.campoFormativo || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ciclo</p>
                    <p>{selectedAsignatura.cicloAcademico || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Turno</p>
                    <p>{selectedAsignatura.turno || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Horario</p>
                  <p>{selectedAsignatura.tipoHorario || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No se encontró información de detalle.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
