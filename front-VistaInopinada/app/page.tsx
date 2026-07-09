<<<<<<< Updated upstream
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect("/login")
=======
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirige al login si no estamos en modo export
    if (typeof window !== 'undefined' && !window.location.pathname.includes('index.html')) {
      router.replace("/login")
    }
  }, [router])

  return <div /> // Renderiza un div vacío mientras redirige
>>>>>>> Stashed changes
}
