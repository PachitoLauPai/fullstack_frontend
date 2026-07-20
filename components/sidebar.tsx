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
  { name: "Docentes", href: "/docentes", icon: Users, roles: ["AUDITOR"] },
  { name: "Responsables", href: "/responsables", icon: UserCheck, roles: [] },
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
          "fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-[#0a1128] via-[#0f1d43] to-[#0a1128] text-white border-r border-[#1e293b]/40 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-[#1e293b]/40",
          isCollapsed ? "justify-center" : "gap-3"
        )}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-slate-100/10 shadow-sm flex items-center justify-center p-1">
            <Image
              src="/iconoutp.jpg"
              alt="Logo UTP"
              width={32}
              height={32}
              className="object-contain w-full h-full rounded-full"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wide text-white">Visitas Inopinadas</span>
              <span className="text-[10px] font-semibold tracking-wider text-[#ff003c] uppercase">Sistema de Control</span>
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
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-[#ff003c]/20 to-[#ff003c]/2 text-white border-l-4 border-[#ff003c]"
                    : "text-slate-300 hover:bg-slate-800/40 hover:text-white",
                  isCollapsed && "justify-center px-2 border-l-0"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-[#ff003c]" : "text-slate-400 group-hover:text-white"
                )} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse button - desktop only */}
        <div className="hidden lg:block p-2 border-t border-[#1e293b]/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "w-full text-slate-300 hover:text-white hover:bg-slate-800/40",
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
          "p-4 border-t border-[#1e293b]/40",
          isCollapsed && "px-2"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg p-2 hover:bg-slate-800/40 transition-colors text-left",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold truncate text-white">
                      {user?.nombre} {user?.apellido}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded w-fit uppercase tracking-wider",
                      getRoleBadgeColor(user?.rol || "DOCENTE")
                    )}>
                      {getRoleLabel(user?.rol || "DOCENTE")}
                    </span>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0a1128] border border-[#1e293b]/60 text-white">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{user?.nombre} {user?.apellido}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-[#1e293b]/60" />
              <DropdownMenuItem asChild className="focus:bg-slate-800 focus:text-white">
                <Link href="/perfil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e293b]/60" />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
