import { useEffect, type ReactNode } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
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

/** Títulos del workspace, por la última hoja de la ruta. */
const TITULOS: Record<string, { titulo: string; eyebrow: string }> = {
  panel: { titulo: 'Panel', eyebrow: 'Resumen del día' },
  pipeline: { titulo: 'Pipeline de cotizaciones', eyebrow: 'Embudo de ventas' },
  cotizador: { titulo: 'Cotizador', eyebrow: 'Construir una cotización' },
  cotizaciones: { titulo: 'Cotizaciones', eyebrow: 'Historial' },
  clientes: { titulo: 'Clientes', eyebrow: 'Cartera' },
  inventario: { titulo: 'Inventario', eyebrow: 'Existencias y precios' },
  configuracion: { titulo: 'Configuración', eyebrow: 'Datos de la tienda' },
}

function hojaDeRuta(pathname: string): string {
  const partes = pathname.split('/').filter(Boolean)
  if (partes[0] === 'crm') return partes[1] ?? 'panel'
  if (partes[0] === 'clientes') return 'clientes'
  return partes[partes.length - 1] ?? 'panel'
}

function Workspace({ children }: { children?: ReactNode }) {
  const ubicacion = useLocation()
  const meta = TITULOS[hojaDeRuta(ubicacion.pathname)] ?? TITULOS.panel

  useEffect(() => {
    document.title = `${meta.titulo} · Workspace de ventas`
  }, [meta.titulo])

  return (
    <AppShell titulo={meta.titulo} eyebrow={meta.eyebrow}>
      {children ?? <Outlet />}
    </AppShell>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ── Tienda pública: la raíz del sitio ──────────────────────── */}
        <Route path="/" element={<TiendaLayout />}>
          <Route index element={<TiendaHome />} />
          <Route path="catalogo" element={<TiendaCatalogo />} />
          <Route path="producto/:id" element={<TiendaProducto />} />
          <Route path="carrito" element={<TiendaCarrito />} />
        </Route>

        {/* La cotización que ve el cliente, compartible por enlace */}
        <Route path="/cotizacion/:id" element={<CotizacionPublica />} />

        {/* ── Workspace de ventas: lo que ve el equipo ───────────────── */}
        <Route path="/crm" element={<Workspace />}>
          <Route index element={<Panel />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="cotizador" element={<Cotizador />} />
          <Route path="cotizaciones" element={<Cotizaciones />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/:id" element={<ClienteDetalle />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* ── Rutas anteriores del workspace ─────────────────────────── */}
        {/* Se sirven el mismo contenido en su ruta original en lugar de
            redirigir: un <Navigate> devuelve null en el primer render y
            deja un flash en blanco al entrar directo por URL. */}
        <Route path="/pipeline" element={<Workspace><Pipeline /></Workspace>} />
        <Route path="/cotizador" element={<Workspace><Cotizador /></Workspace>} />
        <Route path="/cotizaciones" element={<Workspace><Cotizaciones /></Workspace>} />
        <Route path="/clientes" element={<Workspace><Clientes /></Workspace>} />
        <Route
          path="/clientes/:id"
          element={<Workspace><ClienteDetalle /></Workspace>}
        />
        <Route path="/inventario" element={<Workspace><Inventario /></Workspace>} />
        <Route
          path="/configuracion"
          element={<Workspace><Configuracion /></Workspace>}
        />

        {/* ── Rutas anteriores de la tienda ─────────────────────────── */}
        <Route path="/tienda" element={<TiendaLayout><TiendaHome /></TiendaLayout>} />
        <Route
          path="/tienda/catalogo"
          element={<TiendaLayout><TiendaCatalogo /></TiendaLayout>}
        />
        <Route
          path="/tienda/producto/:id"
          element={<TiendaLayout><TiendaProducto /></TiendaLayout>}
        />
        <Route
          path="/tienda/carrito"
          element={<TiendaLayout><TiendaCarrito /></TiendaLayout>}
        />

        {/* Cualquier URL desconocida muestra la tienda, sin flash intermedio */}
        <Route path="*" element={<TiendaLayout><TiendaHome /></TiendaLayout>} />
      </Routes>
    </ToastProvider>
  )
}
