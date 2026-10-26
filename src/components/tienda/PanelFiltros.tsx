import { ChevronDown } from 'lucide-react'
import type { Producto } from '../../types'
import { CATEGORIAS } from '../../data/config'
import {
  marcasConConteo,
  RANGOS_PRECIO,
  type FiltrosCatalogo,
} from '../../lib/tienda'

interface Props {
  productos: Producto[]
  filtros: FiltrosCatalogo
  onCambio: (cambio: Partial<FiltrosCatalogo>) => void
  onLimpiar: () => void
  /** Oculta la sección de familia cuando ya se filtró por una. */
  ocultarFamilia?: boolean
}

function Seccion({
  titulo,
  children,
  abierto = true,
}: {
  titulo: string
  children: React.ReactNode
  abierto?: boolean
}) {
  return (
    <details open={abierto} className="group border-b border-borde py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[13.5px] font-semibold text-texto">
        {titulo}
        <ChevronDown
          className="size-4 shrink-0 text-texto-4 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <fieldset className="mt-3.5 min-w-0">
        <legend className="sr-only">{titulo}</legend>
        {children}
      </fieldset>
    </details>
  )
}

function Casilla({
  marcado,
  onCambio,
  etiqueta,
  conteo,
}: {
  marcado: boolean
  onCambio: (marcado: boolean) => void
  etiqueta: string
  conteo?: number
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13.5px] text-texto-2 transition-colors hover:text-texto">
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => onCambio(e.target.checked)}
        className="size-4 shrink-0 cursor-pointer rounded-xs border-borde-2 accent-acento"
      />
      <span className="flex-1">{etiqueta}</span>
      {conteo !== undefined ? (
        <span className="codigo-web text-texto-4">{conteo}</span>
      ) : null}
    </label>
  )
}

export function PanelFiltros({
  productos,
  filtros,
  onCambio,
  onLimpiar,
  ocultarFamilia = false,
}: Props) {
  const conteos = new Map<string, number>()
  for (const familia of CATEGORIAS) {
    conteos.set(
      familia.id,
      productos.filter((p) => p.categoria === familia.id).length,
    )
  }

  // Las marcas se cuentan dentro de la familia activa: en Guitarras no
  // tiene sentido ofrecer Pioneer DJ.
  const porMarca = marcasConConteo(
    filtros.familia === 'todas'
      ? productos
      : productos.filter((p) => p.categoria === filtros.familia),
  )

  return (
    <div>
      {!ocultarFamilia ? (
        <Seccion titulo="Familia">
          <ul className="-my-1">
            <li>
              <Casilla
                etiqueta="Todas las familias"
                marcado={filtros.familia === 'todas'}
                onCambio={() => onCambio({ familia: 'todas' })}
                conteo={productos.length}
              />
            </li>
            {CATEGORIAS.map((familia) => (
              <li key={familia.id}>
                <Casilla
                  etiqueta={familia.nombre}
                  marcado={filtros.familia === familia.id}
                  onCambio={() => onCambio({ familia: familia.id })}
                  conteo={conteos.get(familia.id) ?? 0}
                />
              </li>
            ))}
          </ul>
        </Seccion>
      ) : null}

      <Seccion titulo="Marca">
        <ul className="-my-1 max-h-64 overflow-y-auto pr-1">
          {porMarca.map(({ marca, n }) => (
            <li key={marca}>
              <Casilla
                etiqueta={marca}
                marcado={filtros.marca === marca}
                onCambio={(marcado) => onCambio({ marca: marcado ? marca : '' })}
                conteo={n}
              />
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Precio">
        <ul className="-my-1">
          {RANGOS_PRECIO.map((rango) => (
            <li key={rango.id}>
              <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13.5px] text-texto-2 transition-colors hover:text-texto">
                <input
                  type="radio"
                  name="rango-precio"
                  checked={filtros.rango === rango.id}
                  onChange={() => onCambio({ rango: rango.id })}
                  className="size-4 shrink-0 cursor-pointer accent-acento"
                />
                <span>{rango.etiqueta}</span>
              </label>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo="Disponibilidad">
        <Casilla
          etiqueta="Sólo con existencias"
          marcado={filtros.solo}
          onCambio={(marcado) => onCambio({ solo: marcado })}
        />
      </Seccion>

      <button
        type="button"
        onClick={onLimpiar}
        className="mt-4 w-full rounded-md border border-borde-2 px-4 py-2.5 text-[13px] font-semibold text-texto-2 transition-colors hover:border-texto hover:text-texto"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
