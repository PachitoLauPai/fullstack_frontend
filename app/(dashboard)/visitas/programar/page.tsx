"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { ProgramaVisitaForm } from "@/components/visitas/programa-visita-form"
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

export default function ProgramarVisitaPage() {
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
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Modal de confirmación */}
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abandonar sin guardar</AlertDialogTitle>
              <AlertDialogDescription>
                Tienes cambios sin guardar. Si sales ahora, se perderá el formulario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsModalOpen(false)}>
                Quedarme
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLeave}>
                Salir y descartar cambios
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Programar Visita Inopinada
            </h1>
            <p className="text-muted-foreground">
              Asigna una nueva visita a un evaluador para supervisar a un docente
            </p>
          </div>
        </div>

        {/* Form */}
        <ProgramaVisitaForm onDirtyChange={setHasChanges} />
      </div>
    </RouteGuard>
  )
}
