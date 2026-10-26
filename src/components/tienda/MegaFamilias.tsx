import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrm } from '../../store/crmStore'
import { CATEGORIAS } from '../../data/config'
import { conteoPorFamilia, precioDesde } from '../../lib/tienda'
import { monedaCorta } from '../../lib/format'
import { IlustracionProducto } from './IlustracionProducto'

/**
 * Botón "Instrumentos" de la cabecera y su desplegable con las doce
 * familias, cada una con su cantidad de artículos y precio de entrada.
 * Se cierra al pulsar fuera, con Escape o al elegir una familia.
 */
export function MegaFamilias() {
  const productos = useCrm((s) => s.productos)
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const conteos = useMemo(() => conteoPorFamilia(productos), [productos])

  useEffect(() => {
    if (!abierto) return
    const alPulsar = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    const alEscapar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alPulsar)
    document.addEventListener('keydown', alEscapar)
    return () => {
      document.removeEventListener('mousedown', alPulsar)
      document.removeEventListener('keydown', alEscapar)
    }
  }, [abierto])

  const cerrar = () => setAbierto(false)

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="mega-familias"
        className={`flex h-12 items-center gap-2 text-[13px] font-semibold tracking-wide transition-colors ${
          abierto ? 'text-acento-2' : 'text-texto hover:text-acento-2'
        }`}
      >
        Instrumentos
        <svg
          aria-hidden
          viewBox="0 0 12 8"
          className={`size-2.5 text-texto-4 transition-transform ${abierto ? 'rotate-180' : ''}`}
        >
          <path
            d="M1 1.5 6 6.5l5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {abierto ? (
        <div
          id="mega-familias"
          className="animate-fade absolute top-full left-0 z-50 w-[min(58rem,90vw)] rounded-b-xl border border-t-0 border-borde bg-white p-6 shadow-xl"
        >
          <ul className="grid grid-cols-4 gap-x-6 gap-y-5">
            {CATEGORIAS.map((familia) => (
              <li key={familia.id}>
                <Link
                  to={`/catalogo?categoria=${familia.id}`}
                  onClick={cerrar}
                  className="group flex items-center gap-3"
                >
                  <span className="size-12 shrink-0 overflow-hidden rounded-md">
                    <IlustracionProducto
                      categoria={familia.id}
                      sku={`MENU-${familia.id}`}
                      className="h-full w-full"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-texto group-hover:text-acento-2">
                      {familia.nombre}
                    </span>
                    <span className="codigo-web block text-texto-4">
                      {conteos[familia.id] ?? 0} art. · desde{' '}
                      {monedaCorta(precioDesde(productos, familia.id))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-borde pt-4">
            <p className="text-[13px] text-texto-3">
              {productos.length} referencias · desde {monedaCorta(precioDesde(productos))}
            </p>
            <Link
              to="/catalogo"
              onClick={cerrar}
              className="text-[13px] font-semibold text-acento-2 hover:underline"
            >
              Ver todo el catálogo →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
