import EditarVisitaClient from "./EditarVisitaClient"

export function generateStaticParams() {
  return [] // Indica a Next.js (durante export estático) que no pre-genere rutas fijas
}

export default function Page() {
  return <EditarVisitaClient />
}
