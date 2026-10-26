import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, MessageCircle, ShoppingBag, X } from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { useCart } from '../../store/cartStore'
import { CATEGORIAS } from '../../data/config'
import { MegaFamilias } from './MegaFamilias'

const ENLACES = [
  { to: '/catalogo', etiqueta: 'Todo el catálogo' },
  { to: '/#como-comprar', etiqueta: 'Cómo comprar' },
  { to: '/#transparencia', etiqueta: 'Sin letra pequeña' },
  { to: '/#contacto', etiqueta: 'Contacto' },
]

export function CabeceraTienda() {
  const config = useCrm((s) => s.config)
  const lineas = useCart((s) => s.lineas)
  const navegar = useNavigate()

  const [consulta, setConsulta] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)

  const unidades = lineas.reduce((total, l) => total + l.cantidad, 0)

  const buscar = (evento: React.FormEvent) => {
    evento.preventDefault()
    const texto = consulta.trim()
    navegar(texto ? `/catalogo?q=${encodeURIComponent(texto)}` : '/catalogo')
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Franja de datos */}
      <div className="bg-texto text-white">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <p className="label-web hidden text-white/55 sm:block">{config.direccion}</p>
          <div className="flex flex-1 items-center justify-between gap-5 sm:flex-none sm:justify-end">
            <a
              href={`tel:${config.telefono.replace(/[^\d+]/g, '')}`}
              className="label-web text-white/70 transition-colors hover:text-acento"
            >
              {config.telefono}
            </a>
            <Link
              to="/crm"
              className="label-web hidden text-white/45 transition-colors hover:text-white sm:inline"
            >
              Acceso del equipo
            </Link>
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <div className="border-b border-borde">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:gap-7 sm:px-6">
          {/* El logo completo, tal como está diseñado: la púa se cierra
              con el nombre, así que no se recorta. */}
          <Link to="/" className="flex shrink-0 items-center" aria-label={`${config.nombre}, inicio`}>
            <img
              src="/logo.png"
              alt={config.nombre}
              width={263}
              height={235}
              className="h-14 w-auto object-contain sm:h-16 lg:h-[76px]"
            />
          </Link>

          <form
            onSubmit={buscar}
            role="search"
            className="order-last min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1"
          >
            <div className="relative">
              <input
                type="search"
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Buscar por nombre, marca o referencia…"
                aria-label="Buscar en el catálogo"
                className="h-11 w-full rounded-md border border-borde-2 bg-fondo-2 pl-4 pr-28 text-[14px] text-texto transition-colors placeholder:text-texto-4 hover:border-texto-4 focus:border-acento focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute top-1.5 right-1.5 h-8 rounded-sm bg-acento px-4 text-[12px] font-semibold text-texto transition-colors hover:bg-acento-2 hover:text-white"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
            <a
              href={enlaceWhatsappTienda(config)}
              target="_blank"
              rel="noreferrer"
              aria-label="Escribir por WhatsApp"
              title="Escribir por WhatsApp"
              className="hidden size-11 items-center justify-center rounded-md text-texto-3 transition-colors hover:bg-fondo-2 hover:text-texto sm:inline-flex"
            >
              <MessageCircle className="size-5" />
            </a>
            <Link
              to="/carrito"
              aria-label={`Carrito, ${unidades} artículos`}
              className="relative inline-flex h-11 items-center gap-2 rounded-md border border-borde-2 px-3.5 text-[13px] font-semibold text-texto transition-colors hover:border-texto"
            >
              <ShoppingBag className="size-4.5" aria-hidden />
              <span className="hidden lg:inline">Carrito</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-texto px-1.5 text-[11px] font-bold text-white tabular-nums">
                {unidades}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="inline-flex size-11 items-center justify-center rounded-md text-texto-2 transition-colors hover:bg-fondo-2 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación de categorías */}
      <div className="hidden border-b border-borde bg-white lg:block">
        <div className="mx-auto flex max-w-[1360px] items-center gap-7 px-4 sm:px-6">
          <MegaFamilias />

          <nav aria-label="Secciones" className="flex items-center gap-7">
            {ENLACES.slice(1).map((enlace) => (
              <Link
                key={enlace.to}
                to={enlace.to}
                className="flex h-12 items-center text-[13px] font-semibold tracking-wide text-texto-2 transition-colors hover:text-acento-2"
              >
                {enlace.etiqueta}
              </Link>
            ))}
          </nav>

          <p className="ml-auto flex h-12 items-center text-[13px] text-texto-3">
            Envío gratis desde Q
            {config.envioGratisDesde.toLocaleString('es-GT')} · Hasta{' '}
            {Math.max(...config.mesesCredito)} cuotas
          </p>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
            className="absolute inset-0 bg-texto/50"
          />
          <div className="absolute inset-x-0 top-0 max-h-[92vh] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-borde px-4 py-3">
              <img src="/logo.png" alt={config.nombre} className="h-12 w-auto" />
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="inline-flex size-10 items-center justify-center rounded-md text-texto-2 hover:bg-fondo-2"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-4 py-4">
              <Link
                to="/carrito"
                onClick={() => setMenuAbierto(false)}
                className="mb-4 flex items-center justify-between rounded-md bg-fondo-2 px-4 py-3 text-[14px] font-semibold text-texto"
              >
                Carrito ({unidades} artículos)
              </Link>
              <p className="label-web mb-2 text-texto-4">Instrumentos</p>
              <ul className="mb-4 grid grid-cols-2 gap-1">
                {CATEGORIAS.map((familia) => (
                  <li key={familia.id}>
                    <Link
                      to={`/catalogo?categoria=${familia.id}`}
                      onClick={() => setMenuAbierto(false)}
                      className="block rounded-md px-3 py-2 text-[13.5px] text-texto-2 hover:bg-fondo-2 hover:text-texto"
                    >
                      {familia.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="border-t border-borde pt-3">
                {ENLACES.map((enlace) => (
                  <li key={enlace.to}>
                    <Link
                      to={enlace.to}
                      onClick={() => setMenuAbierto(false)}
                      className="block rounded-md px-3 py-2 text-[13.5px] font-semibold text-texto hover:bg-fondo-2"
                    >
                      {enlace.etiqueta}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/crm"
                    onClick={() => setMenuAbierto(false)}
                    className="block rounded-md px-3 py-2 text-[13.5px] text-texto-4 hover:bg-fondo-2"
                  >
                    Acceso del equipo
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
