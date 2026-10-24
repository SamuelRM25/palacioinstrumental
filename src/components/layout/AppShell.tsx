import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Boxes,
  Calculator,
  FileText,
  Gauge,
  Menu,
  Search,
  Settings,
  Store,
  Users,
  Workflow,
  X,
} from 'lucide-react'
import { Logo } from '../brand/Logo'
import { IconButton } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { CommandPalette } from './CommandPalette'
import { useCrm } from '../../store/crmStore'

interface Enlace {
  to: string
  etiqueta: string
  icono: ReactNode
  exacto?: boolean
}

const ENLACES: Enlace[] = [
  { to: '/', etiqueta: 'Panel', icono: <Gauge className="size-4" />, exacto: true },
  { to: '/pipeline', etiqueta: 'Pipeline', icono: <Workflow className="size-4" /> },
  { to: '/cotizador', etiqueta: 'Cotizador', icono: <Calculator className="size-4" /> },
  { to: '/cotizaciones', etiqueta: 'Cotizaciones', icono: <FileText className="size-4" /> },
  { to: '/clientes', etiqueta: 'Clientes', icono: <Users className="size-4" /> },
  { to: '/inventario', etiqueta: 'Inventario', icono: <Boxes className="size-4" /> },
  { to: '/configuracion', etiqueta: 'Configuración', icono: <Settings className="size-4" /> },
]

function NavItems({ onNavegar }: { onNavegar?: () => void }) {
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-0.5">
      {ENLACES.map((e) => (
        <NavLink
          key={e.to}
          to={e.to}
          end={e.exacto}
          onClick={onNavegar}
          className={({ isActive }) =>
            `group relative flex items-center gap-2.5 py-2 pr-2 pl-3 transition-colors duration-150 ${
              isActive
                ? 'text-oxblood'
                : 'text-ink-3 hover:bg-paper-3/70 hover:text-ink'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* El capo: marca de latón sobre la sección activa */}
              <span
                aria-hidden
                className={`absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-xs transition-colors duration-150 ${
                  isActive ? 'bg-brass' : 'bg-transparent'
                }`}
              />
              <span aria-hidden className={isActive ? 'text-oxblood' : 'text-ink-4'}>
                {e.icono}
              </span>
              <span className="label-tech">{e.etiqueta}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Marca({ onCerrar }: { onCerrar?: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-rule px-3 py-3.5">
      <Logo variante="marca" alto={30} />
      {onCerrar ? (
        <IconButton etiqueta="Cerrar menú" onClick={onCerrar}>
          <X className="size-4" />
        </IconButton>
      ) : null}
    </div>
  )
}

export function AppShell({
  titulo,
  eyebrow,
  acciones,
  children,
}: {
  titulo: string
  eyebrow?: string
  acciones?: ReactNode
  children: ReactNode
}) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [paletaAbierta, setPaletaAbierta] = useState(false)
  const ubicacion = useLocation()
  const config = useCrm((s) => s.config)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletaAbierta((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Al cambiar de ruta se cierra el menú móvil, en tiempo de render.
  const [prevPath, setPrevPath] = useState(ubicacion.pathname)
  if (ubicacion.pathname !== prevPath) {
    setPrevPath(ubicacion.pathname)
    setMenuAbierto(false)
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Navegación de escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-rule bg-paper-2 lg:flex">
        <Marca />
        <div className="flex-1 overflow-y-auto py-3">
          <NavItems />
        </div>
        <div className="border-t border-rule px-3 py-3">
          <Badge tono="brass">Datos de demostración</Badge>
          <p className="mt-2 text-[11px] leading-snug text-ink-4">
            {config.nombre}
            <br />
            {config.telefono}
          </p>
        </div>
      </aside>

      {/* Navegación móvil */}
      {menuAbierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-ink/45"
          />
          <aside className="animate-fade absolute inset-y-0 left-0 flex w-64 flex-col border-r border-rule bg-paper-2">
            <Marca onCerrar={() => setMenuAbierto(false)} />
            <div className="flex-1 overflow-y-auto py-3">
              <NavItems onNavegar={() => setMenuAbierto(false)} />
            </div>
            <div className="border-t border-rule px-3 py-3">
              <Badge tono="brass">Datos de demostración</Badge>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 border-b border-rule bg-paper/92 backdrop-blur-sm">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <IconButton
              etiqueta="Abrir menú"
              onClick={() => setMenuAbierto(true)}
              className="lg:hidden"
            >
              <Menu className="size-4" />
            </IconButton>
            <div className="min-w-0 flex-1">
              {eyebrow ? (
                <p className="label-tech text-ink-4">{eyebrow}</p>
              ) : null}
              <h1 className="label-tech truncate text-ink">{titulo}</h1>
            </div>
            <button
              type="button"
              onClick={() => setPaletaAbierta(true)}
              className="hidden h-8 w-56 items-center gap-2 rounded-xs border border-rule-2 bg-paper-2 px-2.5 text-left transition-colors hover:border-ink-3 sm:flex"
            >
              <Search aria-hidden className="size-3.5 shrink-0 text-ink-4" />
              <span className="flex-1 truncate text-[12px] text-ink-4">
                Buscar…
              </span>
              <kbd className="label-mono shrink-0 text-ink-4">⌘K</kbd>
            </button>
            <IconButton
              etiqueta="Buscar"
              onClick={() => setPaletaAbierta(true)}
              className="sm:hidden"
            >
              <Search className="size-4" />
            </IconButton>
            {acciones ? (
              <div className="flex shrink-0 items-center gap-2">{acciones}</div>
            ) : null}
            <Link
              to="/tienda"
              className="label-tech hidden h-8 items-center gap-1.5 rounded-xs border border-rule-2 px-2.5 text-ink transition-colors hover:border-ink sm:inline-flex"
            >
              <Store className="size-3.5" aria-hidden />
              Tienda
            </Link>
          </div>
        </header>
        <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>

      <CommandPalette abierto={paletaAbierta} onCerrar={() => setPaletaAbierta(false)} />
    </div>
  )
}
