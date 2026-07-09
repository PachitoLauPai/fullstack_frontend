import EditarVisitaClient from "./EditarVisitaClient"

export function generateStaticParams() {
  return [{ id: "1" }] // Genera una ruta dummy para pasar la validación estática de Next.js
}

export default function Page() {
  return <EditarVisitaClient />
}
