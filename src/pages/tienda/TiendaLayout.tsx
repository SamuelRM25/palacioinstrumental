import { useEffect, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCrm } from '../../store/crmStore'
import { CabeceraTienda } from '../../components/tienda/CabeceraTienda'
import { PieTienda } from '../../components/tienda/PieTienda'

export function TiendaLayout({ children }: { children?: ReactNode }) {
  const config = useCrm((s) => s.config)
  const ubicacion = useLocation()

  useEffect(() => {
    document.title = `${config.nombre} · Instrumentos y audio profesional`
  }, [config.nombre])

  // En una SPA el navegador no desplaza solo al llegar a un ancla.
  useEffect(() => {
    if (!ubicacion.hash) return
    const destino = document.getElementById(ubicacion.hash.slice(1))
    if (destino) {
      destino.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [ubicacion.pathname, ubicacion.hash])

  return (
    <div data-tienda className="flex min-h-screen flex-col bg-white">
      <CabeceraTienda />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <PieTienda />
    </div>
  )
}
