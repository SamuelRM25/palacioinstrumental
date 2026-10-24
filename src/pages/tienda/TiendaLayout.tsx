import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { Logo } from '../../components/brand/Logo'
import { IconButton } from '../../components/ui/Button'
import { useCart } from '../../store/cartStore'
import { useCrm } from '../../store/crmStore'
import { CATEGORIAS } from '../../data/config'

const ENLACES = [
  { to: '/tienda/catalogo', etiqueta: 'Instrumentos' },
  { to: '/tienda#familias', etiqueta: 'Familias' },
  { to: '/tienda#transparencia', etiqueta: 'Cómo comprar' },
  { to: '/tienda#contacto', etiqueta: 'Contacto' },
]

export function TiendaLayout() {
  const config = useCrm((s) => s.config)
  const lineas = useCart((s) => s.lineas)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const ubicacion = useLocation()

  const unidades = lineas.reduce((a, l) => a + l.cantidad, 0)

  // Al cambiar de ruta se cierra el menú móvil, en tiempo de render.
  const [prevPath, setPrevPath] = useState(ubicacion.pathname)
  if (ubicacion.pathname !== prevPath) {
    setPrevPath(ubicacion.pathname)
    setMenuAbierto(false)
  }

  useEffect(() => {
    document.title = `${config.nombre} · Instrumentos y audio profesional`
  }, [config.nombre])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Franja de datos de la tienda */}
      <div className="border-b border-rule bg-ink px-4 py-1.5 text-paper sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <p className="label-mono text-paper-3">{config.direccion}</p>
          <p className="label-mono text-paper-3">
            {config.telefono} · {config.horarios}
          </p>
        </div>
      </div>

      {/* Cabecera */}
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/94 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-8">
          <Link to="/tienda" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" aria-hidden className="size-10 object-contain" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
                {config.nombre}
              </span>
              <span className="label-tech mt-1 text-ink-4">{config.lema}</span>
            </span>
          </Link>

          <nav aria-label="Navegación de la tienda" className="ml-auto hidden md:block">
            <ul className="flex items-center gap-6">
              {ENLACES.map((e) => (
                <li key={e.etiqueta}>
                  <NavLink
                    to={e.to}
                    className={({ isActive }) =>
                      `label-tech transition-colors hover:text-oxblood ${
                        isActive ? 'text-oxblood' : 'text-ink-2'
                      }`
                    }
                  >
                    {e.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              to="/tienda/catalogo"
              aria-label="Buscar instrumentos"
              className="hidden size-8 items-center justify-center rounded-xs border border-transparent text-ink-3 transition-colors hover:border-rule-2 hover:bg-paper-2 hover:text-ink sm:inline-flex"
            >
              <Search className="size-4" aria-hidden />
            </Link>
            <Link
              to="/tienda/carrito"
              className="label-tech relative inline-flex h-9 items-center gap-2 rounded-xs border border-rule-2 px-3 text-ink transition-colors hover:border-ink"
            >
              <ShoppingBag className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Carrito</span>
              <span className="inline-flex min-w-4 items-center justify-center rounded-xs bg-oxblood px-1 font-mono text-[10px] text-paper">
                {unidades}
              </span>
            </Link>
            <IconButton
              etiqueta="Abrir menú"
              onClick={() => setMenuAbierto(true)}
              className="md:hidden"
            >
              <Menu className="size-4" />
            </IconButton>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {menuAbierto ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-ink/45"
          />
          <nav className="animate-fade absolute inset-x-0 top-0 border-b border-rule bg-paper px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo variante="marca" alto={28} />
              <IconButton etiqueta="Cerrar menú" onClick={() => setMenuAbierto(false)}>
                <X className="size-4" />
              </IconButton>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {ENLACES.map((e) => (
                <li key={e.etiqueta}>
                  <Link
                    to={e.to}
                    onClick={() => setMenuAbierto(false)}
                    className="label-tech text-ink-2"
                  >
                    {e.etiqueta}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/tienda/carrito"
                  onClick={() => setMenuAbierto(false)}
                  className="label-tech text-ink-2"
                >
                  Carrito ({unidades})
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Pie */}
      <footer id="contacto" className="border-t border-rule bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-8 md:grid-cols-4">
          <div>
            <img src="/logo.png" alt="" aria-hidden className="size-12 object-contain invert" />
            <p className="mt-3 font-display text-[16px] font-semibold">{config.nombre}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-paper-3">
              {config.lema}. Instrumentos de las mejores marcas, asesoría técnica
              honesta y garantía real.
            </p>
          </div>

          <div>
            <p className="label-tech text-brass-hi">Contacto</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-paper-3">
              <li>
                <a href={`tel:${config.telefono}`} className="hover:text-paper">
                  {config.telefono}
                </a>
              </li>
              <li>
                <a href={`mailto:${config.email}`} className="hover:text-paper">
                  {config.email}
                </a>
              </li>
              <li className="leading-relaxed">{config.direccion}</li>
              <li className="leading-relaxed">{config.horarios}</li>
            </ul>
          </div>

          <div>
            <p className="label-tech text-brass-hi">Familias</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px] text-paper-3">
              {CATEGORIAS.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/tienda/catalogo?categoria=${c.id}`}
                    className="hover:text-paper"
                  >
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-tech text-brass-hi">Comprar</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-paper-3">
              <li>
                <Link to="/tienda/catalogo" className="hover:text-paper">
                  Todo el catálogo
                </Link>
              </li>
              <li>
                <Link to="/tienda#transparencia" className="hover:text-paper">
                  Cuotas y formas de pago
                </Link>
              </li>
              <li>
                <Link to="/tienda/catalogo?solo=disponibles" className="hover:text-paper">
                  Disponibles ahora
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-paper">
                  Workspace de ventas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-8">
            <p className="label-mono text-paper-3">
              © {new Date().getFullYear()} {config.nombre}. Todos los derechos
              reservados.
            </p>
            <p className="label-mono text-paper-3">
              Demo en desarrollo · no es una factura fiscal
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
