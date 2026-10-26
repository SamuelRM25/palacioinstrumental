import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCrm } from '../../store/crmStore'
import { CATEGORIAS } from '../../data/config'
import { conteoPorFamilia } from '../../lib/tienda'

/**
 * La firma de la tienda.
 *
 * En lugar de una foto de stock, el hero abre con la forma real del
 * catálogo: doce barras —una por familia— cuya altura codifica
 * cuántos artículos hay de cada una. Cada barra es un filtro: lleva
 * al catálogo de esa familia.
 *
 * Un medidor de VU, que es lo que es un amplificador.
 */
export function MedidorFamilias({ className = '' }: { className?: string }) {
  const productos = useCrm((s) => s.productos)
  const conteos = useMemo(() => conteoPorFamilia(productos), [productos])

  const maximo = Math.max(1, ...Object.values(conteos))
  const total = productos.length

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-web text-white/45">
          {CATEGORIAS.length} familias · {total} referencias
        </p>
        <p className="label-web text-acento">Toca una barra para filtrar</p>
      </div>

      <ul className="mt-4 flex h-36 items-end gap-1.5 sm:h-44 sm:gap-2">
        {CATEGORIAS.map((familia) => {
          const conteo = conteos[familia.id] ?? 0
          const proporcion = conteo / maximo
          return (
            <li
              key={familia.id}
              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
            >
              <Link
                to={`/catalogo?categoria=${familia.id}`}
                className="group/bar flex h-full flex-col justify-end rounded-t-sm focus-visible:outline-2"
                aria-label={`${familia.nombre}: ${conteo} artículos`}
                title={`${familia.nombre} · ${conteo} artículos`}
              >
                <span className="codigo-web mb-1.5 text-center text-white/45 transition-colors group-hover/bar:text-acento">
                  {conteo}
                </span>
                <span
                  className="w-full rounded-t-sm bg-white/12 transition-all duration-300 group-hover/bar:bg-acento"
                  style={{ height: `${Math.max(8, proporcion * 100)}%` }}
                >
                  <span className="block h-full w-full rounded-t-sm bg-gradient-to-t from-acento/55 to-acento/0" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <ul className="mt-2 grid grid-cols-12 gap-1.5 sm:gap-2">
        {CATEGORIAS.map((familia) => (
          <li key={familia.id} className="min-w-0">
            <Link
              to={`/catalogo?categoria=${familia.id}`}
              title={`${familia.nombre} · ${conteos[familia.id] ?? 0} artículos`}
              aria-label={familia.nombre}
              className="label-web block overflow-hidden text-center text-[9px] tracking-[0.08em] whitespace-nowrap text-white/50 transition-colors hover:text-acento sm:text-[10px]"
            >
              {/* Rótulo de canal, como en una consola: tres letras. */}
              {familia.corto.slice(0, 3)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
