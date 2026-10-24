import { Link } from 'react-router-dom'
import { InstrumentIcon } from '../brand/InstrumentIcon'
import { Money } from '../ui/Money'
import { Badge } from '../ui/Badge'
import { CATEGORIAS } from '../../data/config'
import type { Producto } from '../../types'

interface Props {
  producto: Producto
  onAgregar?: (producto: Producto) => void
  /** Oculta el botón de agregar (variante de catálogo denso). */
  pasivo?: boolean
}

const nombreCategoria = (id: string) =>
  CATEGORIAS.find((c) => c.id === id)?.nombre ?? id

/**
 * "Ficha" de producto: celda de catálogo técnico con el glifo de la familia,
 * la referencia, dos especificaciones y el precio. Sin foto de relleno — el
 * glifo y la referencia hacen el trabajo de identificación.
 */
export function FichaProducto({ producto, onAgregar, pasivo }: Props) {
  const disponible = producto.stock - producto.reservado
  const agotado = disponible <= 0
  const pocas = !agotado && disponible <= 2

  return (
    <article className="group flex flex-col border border-rule bg-paper-2 transition-colors duration-150 hover:border-ink-3 focus-within:border-ink-3">
      {/* Celda técnica: glifo + referencia */}
      <div className="flex items-center justify-between gap-2 border-b border-rule px-3 py-2">
        <span className="flex items-center gap-2 text-ink-4">
          <InstrumentIcon
            categoria={producto.categoria}
            className="size-5 shrink-0"
          />
          <span className="label-mono text-ink-3">{producto.sku}</span>
        </span>
        {agotado ? (
          <Badge tono="oxblood">Agotado</Badge>
        ) : pocas ? (
          <Badge tono="amber">Últimas {disponible}</Badge>
        ) : (
          <Badge tono="pine">Disponible</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 py-3">
        <p className="label-tech text-ink-4">{producto.marca}</p>
        <h3 className="mt-1 text-[14px] leading-snug font-semibold text-ink">
          <Link to={`/producto/${producto.id}`} className="hover:underline hover:underline-offset-2">
            {producto.nombre}
          </Link>
        </h3>

        <ul className="mt-2 flex flex-col gap-0.5">
          {producto.specs.slice(0, 2).map((s) => (
            <li key={s.etiqueta} className="label-mono truncate text-ink-4">
              {s.etiqueta}: {s.valor}
            </li>
          ))}
        </ul>

        <p className="label-mono mt-2 text-ink-4">
          {nombreCategoria(producto.categoria)}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-rule px-3 py-2.5">
        <Money valor={producto.precio} size="md" />
        {!pasivo && !agotado && onAgregar ? (
          <button
            type="button"
            onClick={() => onAgregar(producto)}
            className="label-tech rounded-xs border border-rule-2 px-2.5 py-1 text-ink-3 transition-colors duration-150 hover:border-oxblood hover:bg-oxblood hover:text-paper"
          >
            Agregar
          </button>
        ) : (
          <Link
            to={`/producto/${producto.id}`}
            className="label-tech rounded-xs border border-rule-2 px-2.5 py-1 text-ink-3 transition-colors duration-150 hover:border-ink hover:text-ink"
          >
            {agotado ? 'Ver ficha' : 'Ver ficha'}
          </Link>
        )}
      </div>
    </article>
  )
}
