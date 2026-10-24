import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import Panel from './pages/Panel'
import Pipeline from './pages/Pipeline'
import Cotizador from './pages/Cotizador'
import Cotizaciones from './pages/Cotizaciones'
import Clientes from './pages/Clientes'
import ClienteDetalle from './pages/ClienteDetalle'
import Inventario from './pages/Inventario'
import Configuracion from './pages/Configuracion'
import CotizacionPublica from './pages/CotizacionPublica'
import { TiendaLayout } from './pages/tienda/TiendaLayout'
import TiendaHome from './pages/tienda/TiendaHome'
import TiendaCatalogo from './pages/tienda/TiendaCatalogo'
import TiendaProducto from './pages/tienda/TiendaProducto'
import TiendaCarrito from './pages/tienda/TiendaCarrito'

const TITULOS: Record<string, { titulo: string; eyebrow: string }> = {
  '/': { titulo: 'Panel', eyebrow: 'Resumen del día' },
  '/pipeline': { titulo: 'Pipeline de cotizaciones', eyebrow: 'Embudo de ventas' },
  '/cotizador': { titulo: 'Cotizador', eyebrow: 'Construir una cotización' },
  '/cotizaciones': { titulo: 'Cotizaciones', eyebrow: 'Historial' },
  '/clientes': { titulo: 'Clientes', eyebrow: 'Cartera' },
  '/inventario': { titulo: 'Inventario', eyebrow: 'Existencias y precios' },
  '/configuracion': { titulo: 'Configuración', eyebrow: 'Datos de la tienda' },
}

function Workspace() {
  const ubicacion = useLocation()
  const meta = TITULOS[ubicacion.pathname] ?? {
    titulo: 'Ficha de cliente',
    eyebrow: 'Cartera',
  }

  useEffect(() => {
    document.title = `${meta.titulo} · Palacio Instrumental`
  }, [meta.titulo])

  return (
    <AppShell titulo={meta.titulo} eyebrow={meta.eyebrow}>
      <Outlet />
    </AppShell>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Superficie que ve el cliente: sin el chrome del CRM */}
        <Route path="/cotizacion/:id" element={<CotizacionPublica />} />

        {/* Tienda pública */}
        <Route path="/tienda" element={<TiendaLayout />}>
          <Route index element={<TiendaHome />} />
          <Route path="catalogo" element={<TiendaCatalogo />} />
          <Route path="producto/:id" element={<TiendaProducto />} />
          <Route path="carrito" element={<TiendaCarrito />} />
        </Route>

        <Route element={<Workspace />}>
          <Route path="/" element={<Panel />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/cotizador" element={<Cotizador />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<ClienteDetalle />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
