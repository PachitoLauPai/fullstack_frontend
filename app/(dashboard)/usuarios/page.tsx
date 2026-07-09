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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  UserCheck,
  GraduationCap,
  Mail,
  Key,
  Eye,
  EyeOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usuariosService, type Usuario } from "@/services/usuarios.service"
import { docentesService, type Docente } from "@/services/docentes.service"
import { responsablesService, type Responsable } from "@/services/responsables.service"
import { Spinner } from "@/components/ui/spinner"

const rolesInfo = {
  ADMIN: {
    label: "Administrador",
    icon: Shield,
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  },
  AUDITOR: {
    label: "Auditor",
    icon: UserCheck,
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  DOCENTE: {
    label: "Docente",
    icon: GraduationCap,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
}

const roleIdByValue = {
  ADMIN: 1,
  AUDITOR: 2,
  DOCENTE: 3,
} as const

type RoleValue = keyof typeof roleIdByValue

const initialFormState = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  rol: "",
  id_docente: "",
  id_responsable: "",
  estado: true,
}

export default function UsuariosPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <UsuariosContent />
    </RouteGuard>
  )
}

function UsuariosContent() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState({ ...initialFormState })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        const [usuariosData, docentesData, responsablesData] = await Promise.all([
          usuariosService.getAll(),
          docentesService.getActivos(),
          responsablesService.getActivos(),
        ])

        setUsuarios(usuariosData)
        setDocentes(docentesData)
        setResponsables(responsablesData)
      } catch (error) {
        console.error("Error cargando usuarios, docentes o responsables:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios, docentes o responsables.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const resetForm = () => {
    setFormData({ ...initialFormState })
    setSelectedUsuario(null)
    setShowPassword(false)
  }

  const handleNewDialogOpenChange = (open: boolean) => {
    setNewDialogOpen(open)
    if (!open) resetForm()
  }

  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) resetForm()
  }

  const handleRolChange = (valor: string) => {
    setFormData((prev) => ({
      ...prev,
      rol: valor,
      id_docente: valor === "DOCENTE" ? prev.id_docente : "",
      id_responsable: valor === "AUDITOR" ? prev.id_responsable : "",
    }))
  }

  const buildUsuarioPayload = (isUpdate = false) => {
    const idDocente = formData.rol === "DOCENTE"
      ? formData.id_docente
        ? Number(formData.id_docente)
        : null
      : null

    const idResponsable = formData.rol === "AUDITOR"
      ? formData.id_responsable
        ? Number(formData.id_responsable)
        : null
      : null

    return {
      email: formData.email,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      password: formData.password || undefined,
      idRol: roleIdByValue[formData.rol as RoleValue],
      idDocente,
      idResponsable,
      estado: isUpdate ? formData.estado : undefined,
    }
  }

  const handleCrearUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.nombres || !formData.apellidos || !formData.email || !formData.rol) {
      toast({
        title: "Error",
        description: "Completa nombres, apellidos, correo y rol.",
        variant: "destructive",
      })
      return
    }

    if (formData.rol === "DOCENTE" && !formData.id_docente) {
      toast({
        title: "Error",
        description: "Selecciona un docente para este usuario.",
        variant: "destructive",
      })
      return
    }

    if (formData.rol === "AUDITOR" && !formData.id_responsable) {
      toast({
        title: "Error",
        description: "Selecciona un responsable para este usuario.",
        variant: "destructive",
      })
      return
    }

    try {
      const nuevoUsuario = await usuariosService.create(buildUsuarioPayload())
      setUsuarios((current) => [...current, nuevoUsuario])
      toast({ title: "Éxito", description: "Usuario creado correctamente." })
      handleNewDialogOpenChange(false)
    } catch (error) {
      console.error("Error creando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setFormData({
      nombres: usuario.nombres || "",
      apellidos: usuario.apellidos || "",
      email: usuario.email || "",
      password: "",
      rol: usuario.rol || "",
      id_docente: usuario.idDocente?.toString() ?? "",
      id_responsable: usuario.idResponsable?.toString() ?? "",
      estado: usuario.estado ?? true,
    })
    setEditDialogOpen(true)
  }

  const handleActualizarUsuario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUsuario) return

    if (!formData.nombres || !formData.apellidos || !formData.email || !formData.rol) {
      toast({
        title: "Error",
        description: "Completa nombres, apellidos, correo y rol.",
        variant: "destructive",
      })
      return
    }

    if (formData.rol === "DOCENTE" && !formData.id_docente) {
      toast({
        title: "Error",
        description: "Selecciona un docente para este usuario.",
        variant: "destructive",
      })
      return
    }

    if (formData.rol === "AUDITOR" && !formData.id_responsable) {
      toast({
        title: "Error",
        description: "Selecciona un responsable para este usuario.",
        variant: "destructive",
      })
      return
    }

    try {
      const actualizado = await usuariosService.update(selectedUsuario.id, buildUsuarioPayload(true))
      setUsuarios((current) =>
        current.map((usuario) =>
          usuario.id === selectedUsuario.id ? actualizado : usuario
        )
      )
      toast({ title: "Éxito", description: "Usuario actualizado correctamente." })
      handleEditDialogOpenChange(false)
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      })
    }
  }

  const handleEliminarUsuario = async (usuario: Usuario) => {
    const confirmed = window.confirm(`¿Eliminar a ${usuario.nombres} ${usuario.apellidos}?`)
    if (!confirmed) return

    try {
      await usuariosService.delete(usuario.id)
      setUsuarios((current) => current.filter((item) => item.id !== usuario.id))
      toast({ title: "Éxito", description: "Usuario eliminado." })
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      })
    }
  }

  const filteredUsuarios = usuarios.filter((usuario) => {
    const term = searchTerm.toLowerCase()
    return [usuario.nombres, usuario.apellidos, usuario.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term))
      && (filterRol === "todos" || usuario.rol === filterRol)
  })

  const stats = {
    total: usuarios.length,
    admins: usuarios.filter((u) => u.rol === "ADMIN").length,
    auditores: usuarios.filter((u) => u.rol === "AUDITOR").length,
    docentes: usuarios.filter((u) => u.rol === "DOCENTE").length,
    activos: usuarios.filter((u) => u.estado ?? true).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios del Sistema</h1>
          <p className="text-muted-foreground">
            Gestion de usuarios con roles exclusivos (Admin, Auditor, Docente)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={newDialogOpen} onOpenChange={handleNewDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Ingrese los datos del nuevo usuario del sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCrearUsuario} className="space-y-4 py-4">
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
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Correo Electronico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@universidad.edu.pe"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Key className="h-4 w-4 inline mr-1" />
                    Contrasena
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contrasena segura"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol">Rol del Usuario</Label>
                  <Select value={formData.rol} onValueChange={handleRolChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="AUDITOR">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Auditor
                        </div>
                      </SelectItem>
                      <SelectItem value="DOCENTE">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Docente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.rol === "DOCENTE" && (
                  <div className="space-y-2">
                    <Label>Vincular con Docente</Label>
                    <Select
                      value={formData.id_docente}
                      onValueChange={(v) => setFormData({ ...formData, id_docente: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar docente" />
                      </SelectTrigger>
                      <SelectContent>
                        {docentes.map((docente) => (
                          <SelectItem key={docente.id} value={docente.id.toString()}>
                            {docente.nombres} {docente.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.rol === "AUDITOR" && (
                  <div className="space-y-2">
                    <Label>Vincular con Responsable</Label>
                    <Select
                      value={formData.id_responsable}
                      onValueChange={(v) => setFormData({ ...formData, id_responsable: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {responsables.map((responsable) => (
                          <SelectItem key={responsable.id} value={responsable.id.toString()}>
                            {responsable.nombres} {responsable.apellidos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => handleNewDialogOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Usuario</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.activos} activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Auditores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.auditores}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Docentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.docentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.activos}</div>
            <p className="text-xs text-muted-foreground">{stats.total - stats.activos} inactivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuarios
          </CardTitle>
          <CardDescription>
            Administre los usuarios del sistema y sus roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="ADMIN">Administradores</SelectItem>
                <SelectItem value="AUDITOR">Auditores</SelectItem>
                <SelectItem value="DOCENTE">Docentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Vinculacion</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => {
                    const rolInfo = rolesInfo[usuario.rol as keyof typeof rolesInfo] || {
                      label: usuario.rol || "Desconocido",
                      icon: Shield,
                      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                    }
                    const RolIcon = rolInfo.icon
                    return (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="font-medium">
                            {usuario.nombres} {usuario.apellidos}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {usuario.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={rolInfo.color}>
                            <RolIcon className="h-3 w-3 mr-1" />
                            {rolInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {usuario.rol === "DOCENTE" && usuario.nombreDocente
                            ? `Docente: ${usuario.nombreDocente}`
                            : usuario.rol === "AUDITOR" && usuario.nombreResponsable
                            ? `Responsable: ${usuario.nombreResponsable}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.estado ? "default" : "secondary"}>
                            {usuario.estado ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {usuario.createdAt
                            ? new Date(usuario.createdAt).toLocaleDateString("es-PE")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditarUsuario(usuario)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="h-4 w-4 mr-2" />
                                Cambiar contrasena
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleEliminarUsuario(usuario)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos del usuario y enlaces a roles.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleActualizarUsuario} className="space-y-4 py-4">
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
              <Label htmlFor="edit-email">
                <Mail className="h-4 w-4 inline mr-1" />
                Correo Electronico
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="usuario@universidad.edu.pe"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">
                <Key className="h-4 w-4 inline mr-1" />
                Contraseña (opcional)
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Dejar vacío para no cambiar"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol del Usuario</Label>
              <Select value={formData.rol} onValueChange={handleRolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                  <SelectItem value="AUDITOR">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Auditor
                    </div>
                  </SelectItem>
                  <SelectItem value="DOCENTE">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Docente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.rol === "DOCENTE" && (
              <div className="space-y-2">
                <Label>Vincular con Docente</Label>
                <Select
                  value={formData.id_docente}
                  onValueChange={(v) => setFormData({ ...formData, id_docente: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {docentes.map((docente) => (
                      <SelectItem key={docente.id} value={docente.id.toString()}>
                        {docente.nombres} {docente.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.rol === "AUDITOR" && (
              <div className="space-y-2">
                <Label>Vincular con Responsable</Label>
                <Select
                  value={formData.id_responsable}
                  onValueChange={(v) => setFormData({ ...formData, id_responsable: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsables.map((responsable) => (
                      <SelectItem key={responsable.id} value={responsable.id.toString()}>
                        {responsable.nombres} {responsable.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Select
                value={formData.estado ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, estado: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => handleEditDialogOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
