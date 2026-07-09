"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, MoreHorizontal, Eye, Edit, Mail, CheckCircle2, XCircle, X } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { docentesService, type Docente } from "@/services/docentes.service"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function DocentesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.rol === "ADMIN"
  
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [viewDialog, setViewDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [emailDialog, setEmailDialog] = useState(false)
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    estadoActivo: true,
  })
  const [emailData, setEmailData] = useState({
    asunto: "",
    mensaje: "",
  })

  // Cargar docentes del API
  useEffect(() => {
    cargarDocentes()
  }, [])

  const cargarDocentes = async () => {
    try {
      setLoading(true)
      const data = await docentesService.getAll()
      setDocentes(data)
    } catch (error) {
      console.error("Error al cargar docentes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los docentes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCrearDocente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.nombres || !formData.apellidos || !formData.email) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        })
        return
      }

      await docentesService.create({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        estadoActivo: formData.estadoActivo,
      })

      toast({
        title: "Éxito",
        description: "Docente creado correctamente",
      })

      setFormData({ nombres: "", apellidos: "", email: "", estadoActivo: true })
      setOpenDialog(false)
      cargarDocentes()
    } catch (error) {
      console.error("Error al crear docente:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el docente",
        variant: "destructive",
      })
    }
  }

  const handleVerPerfil = (docente: Docente) => {
    setSelectedDocente(docente)
    setViewDialog(true)
  }

  const handleEditarDocente = (docente: Docente) => {
    setSelectedDocente(docente)
    setFormData({
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      email: docente.email,
      estadoActivo: docente.estadoActivo,
    })
    setEditDialog(true)
  }

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedDocente) return

      if (!formData.nombres || !formData.apellidos || !formData.email) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        })
        return
      }

      await docentesService.update(selectedDocente.id, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        estadoActivo: formData.estadoActivo,
      })

      toast({
        title: "Éxito",
        description: "Docente actualizado correctamente",
      })

      setEditDialog(false)
      setFormData({ nombres: "", apellidos: "", email: "", estadoActivo: true })
      cargarDocentes()
    } catch (error) {
      console.error("Error al editar docente:", error)
      toast({
        title: "Error",
        description: "No se pudo editar el docente",
        variant: "destructive",
      })
    }
  }

  const handleEnviarEmail = (docente: Docente) => {
    setSelectedDocente(docente)
    setEmailData({ asunto: "", mensaje: "" })
    setEmailDialog(true)
  }

  const handleEnviarEmailConfirmado = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!selectedDocente) return

      if (!emailData.asunto || !emailData.mensaje) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        })
        return
      }

      await docentesService.sendEmail({
        destinatario: selectedDocente.email,
        asunto: emailData.asunto,
        mensaje: emailData.mensaje,
      })

      toast({
        title: "Éxito",
        description: "Email enviado correctamente",
      })

      setEmailDialog(false)
      setEmailData({ asunto: "", mensaje: "" })
    } catch (error) {
      console.error("Error al enviar email:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el email",
        variant: "destructive",
      })
    }
  }

  const filteredDocentes = docentes.filter((docente) =>
    `${docente.nombres} ${docente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <RouteGuard allowedRoles={["ADMIN", "AUDITOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Docentes</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Gestiona la informacion de docentes" : "Consulta la informacion de docentes"}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Docente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Docente</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCrearDocente} className="space-y-4">
                  <div>
                    <label htmlFor="nombres" className="block text-sm font-medium mb-2">
                      Nombres
                    </label>
                    <Input
                      id="nombres"
                      placeholder="Ingresa los nombres"
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData({ ...formData, nombres: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium mb-2">
                      Apellidos
                    </label>
                    <Input
                      id="apellidos"
                      placeholder="Ingresa los apellidos"
                      value={formData.apellidos}
                      onChange={(e) =>
                        setFormData({ ...formData, apellidos: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingresa el email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="create-estado" className="text-sm font-medium">
                      Estado
                    </Label>
                    <Switch
                      id="create-estado"
                      checked={formData.estadoActivo}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, estadoActivo: checked })
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Crear</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Docentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{docentes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {docentes.filter((d) => d.estadoActivo).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">
                {docentes.filter((d) => !d.estadoActivo).length}
              </p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimiento Prom.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {docentes.length > 0
                  ? Math.round(
                      docentes.reduce((sum, d) => sum + (d.cumplimiento || 0), 0) /
                        docentes.length
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card> */}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Docentes</CardTitle>
            <CardDescription>
              Todos los docentes registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar docente..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : filteredDocentes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay docentes para mostrar</p>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Docente</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Asignaturas</TableHead>
                      <TableHead className="hidden sm:table-cell">Visitas</TableHead>
                      <TableHead>Estado</TableHead>
                      {isAdmin && <TableHead className="w-[60px]">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocentes.map((docente) => (
                      <TableRow key={docente.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">
                                {docente.nombres[0]}{docente.apellidos[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{docente.nombres} {docente.apellidos}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{docente.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">{docente.email}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {docente.asignaturas && docente.asignaturas.slice(0, 2).map((asig, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {asig}
                              </Badge>
                            ))}
                            {docente.asignaturas && docente.asignaturas.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{docente.asignaturas.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="font-medium">{docente.visitas || 0}</p>
                            <p className="text-xs text-muted-foreground">{docente.cumplimiento || 0}% cumpl.</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {docente.estadoActivo ? (
                            <Badge className="bg-success text-success-foreground">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleVerPerfil(docente)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditarDocente(docente)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEnviarEmail(docente)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Enviar correo
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Ver Perfil */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Perfil del Docente</DialogTitle>
                <button
                  onClick={() => setViewDialog(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogHeader>
            {selectedDocente && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {selectedDocente.nombres[0]}{selectedDocente.apellidos[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{selectedDocente.nombres} {selectedDocente.apellidos}</p>
                    <p className="text-sm text-muted-foreground">{selectedDocente.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{selectedDocente.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <div className="mt-1">
                      {selectedDocente.estadoActivo ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Visitas</label>
                    <p className="text-sm">{selectedDocente.visitas || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cumplimiento</label>
                    <p className="text-sm">{selectedDocente.cumplimiento || 0}%</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Editar */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Docente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div>
                <label htmlFor="edit-nombres" className="block text-sm font-medium mb-2">
                  Nombres
                </label>
                <Input
                  id="edit-nombres"
                  placeholder="Ingresa los nombres"
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-apellidos" className="block text-sm font-medium mb-2">
                  Apellidos
                </label>
                <Input
                  id="edit-apellidos"
                  placeholder="Ingresa los apellidos"
                  value={formData.apellidos}
                  onChange={(e) =>
                    setFormData({ ...formData, apellidos: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Ingresa el email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-estado" className="text-sm font-medium">
                  Estado
                </Label>
                <Switch
                  id="edit-estado"
                  checked={formData.estadoActivo}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, estadoActivo: checked })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Enviar Email */}
        <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Correo</DialogTitle>
            </DialogHeader>
            {selectedDocente && (
              <form onSubmit={handleEnviarEmailConfirmado} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Para</label>
                  <p className="text-sm font-medium mt-1">{selectedDocente.email}</p>
                </div>
                <div>
                  <label htmlFor="email-asunto" className="block text-sm font-medium mb-2">
                    Asunto
                  </label>
                  <Input
                    id="email-asunto"
                    placeholder="Ingresa el asunto"
                    value={emailData.asunto}
                    onChange={(e) =>
                      setEmailData({ ...emailData, asunto: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email-mensaje" className="block text-sm font-medium mb-2">
                    Mensaje
                  </label>
                  <Textarea
                    id="email-mensaje"
                    placeholder="Escribe tu mensaje aquí..."
                    value={emailData.mensaje}
                    onChange={(e) =>
                      setEmailData({ ...emailData, mensaje: e.target.value })
                    }
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEmailDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Enviar</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  )
}
