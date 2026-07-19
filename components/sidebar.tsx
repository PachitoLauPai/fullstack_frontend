"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth, ROLE_PERMISSIONS, UserRole } from "@/lib/auth-context"
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Building2,
  BookOpen,
  FileBarChart,
  Settings,
  Menu,
  X,
  ChevronLeft,
  UserCheck,
  Shield,
  AlertCircle,
  LogOut,
  User,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "AUDITOR", "DOCENTE"] },
  { name: "Visitas", href: "/visitas", icon: ClipboardCheck, roles: ["ADMIN", "AUDITOR", "DOCENTE"] },
  { name: "Requerimientos", href: "/requerimientos", icon: AlertCircle, roles: ["DOCENTE"] },
  { name: "Docentes", href: "/docentes", icon: Users, roles: ["AUDITOR", "ADMIN"] },
  { name: "Responsables", href: "/responsables", icon: UserCheck, roles: ["ADMIN"] },
  { name: "Asignaturas", href: "/asignaturas", icon: BookOpen, roles: ["ADMIN"] },
  { name: "Sedes", href: "/sedes", icon: Building2, roles: ["ADMIN"] },
  { name: "Reportes", href: "/reportes", icon: FileBarChart, roles: ["ADMIN"] },
  { name: "Usuarios", href: "/usuarios", icon: Shield, roles: ["ADMIN"] },
  { name: "Configuracion", href: "/configuracion", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  // Filtrar navegacion segun el rol del usuario
  const filteredNavigation = navigation.filter(item =>
    user && item.roles.includes(user.rol)
  )

  const getRoleLabel = (role: UserRole) => {
    return ROLE_PERMISSIONS[role]?.label || role
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400"
      case "AUDITOR":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "DOCENTE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
            <Image
              src="/iconoutp.jpg"
              alt="Logo UTP"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">Visitas Inopinadas</span>
              <span className="text-xs text-sidebar-foreground/60 truncate">Sistema de Control</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <div className="hidden lg:block p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              isCollapsed && "px-2"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
            {!isCollapsed && <span className="ml-2">Contraer</span>}
          </Button>
        </div>

        {/* User info with dropdown */}
        <div className={cn(
          "p-4 border-t border-sidebar-border",
          isCollapsed && "px-2"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-sidebar-accent/50 transition-colors text-left",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {user?.nombre} {user?.apellido}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded w-fit",
                      getRoleBadgeColor(user?.rol || "DOCENTE")
                    )}>
                      {getRoleLabel(user?.rol || "DOCENTE")}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
