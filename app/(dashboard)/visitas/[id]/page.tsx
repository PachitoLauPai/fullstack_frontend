import VisitaDetalleClient from "./VisitaDetalleClient"

export function generateStaticParams() {
  return [] // Indica a Next.js (durante export estático) que no pre-genere rutas fijas
}

export default function Page() {
  return <VisitaDetalleClient />
}