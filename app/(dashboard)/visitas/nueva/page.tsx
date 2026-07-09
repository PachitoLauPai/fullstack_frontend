"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { VisitaForm } from "@/components/visitas/visita-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export default function NuevaVisitaPage() {
  const router = useRouter()
  const [hasChanges, setHasChanges] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBack = () => {
    if (hasChanges) {
      setIsModalOpen(true)
      return
    }

    router.push("/visitas")
  }

  const handleConfirmLeave = () => {
    setIsModalOpen(false)
    router.push("/visitas")
  }

  return (
    <RouteGuard allowedRoles={["AUDITOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abandonar sin guardar</AlertDialogTitle>
              <AlertDialogDescription>
                Tienes cambios sin guardar en esta visita. Si sales ahora, se perderá todo el progreso.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsModalOpen(false)}>
                Quedarme
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLeave}>
                Salir y perder progreso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Nueva Visita Inopinada</h1>
            <p className="text-muted-foreground">
              Complete el formulario para registrar una nueva visita
            </p>
          </div>
        </div>

        {/* Form */}
        <VisitaForm onDirtyChange={setHasChanges} />
      </div>
    </RouteGuard>
  )
}
