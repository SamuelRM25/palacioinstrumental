import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { ORDENES } from '../../lib/tienda'
import { Selector } from './Piezas'

interface Props {
  total: number
  mostrados: number
  orden: string
  onOrden: (orden: string) => void
  vista: 'cuadricula' | 'lista'
  onVista: (vista: 'cuadricula' | 'lista') => void
  onAbrirFiltros: () => void
  filtrosActivos: number
}

export function BarraCatalogo({
  total,
  mostrados,
  orden,
  onOrden,
  vista,
  onVista,
  onAbrirFiltros,
  filtrosActivos,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-y border-borde py-3">
      <p className="label-web text-texto-4">
        {mostrados} de {total} referencias
      </p>

      <button
        type="button"
        onClick={onAbrirFiltros}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-borde-2 px-3.5 text-[13px] font-semibold text-texto lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtros
        {filtrosActivos > 0 ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-acento text-[11px] font-bold text-texto">
            {filtrosActivos}
          </span>
        ) : null}
      </button>

      <div className="ml-auto flex items-center gap-3">
        <label className="hidden items-center gap-2 sm:flex">
          <span className="label-web text-texto-4">Ordenar por</span>
          <Selector
            value={orden}
            onChange={(e) => onOrden(e.target.value)}
            className="h-10 w-48 text-[13px]"
            aria-label="Ordenar resultados"
          >
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
              </option>
            ))}
          </Selector>
        </label>

        <div className="hidden items-center rounded-md border border-borde-2 sm:flex">
          <button
            type="button"
            onClick={() => onVista('cuadricula')}
            aria-label="Ver en cuadrícula"
            aria-pressed={vista === 'cuadricula'}
            className={`inline-flex size-10 items-center justify-center rounded-l-md transition-colors ${
              vista === 'cuadricula'
                ? 'bg-texto text-white'
                : 'text-texto-3 hover:bg-fondo-2 hover:text-texto'
            }`}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onVista('lista')}
            aria-label="Ver en lista"
            aria-pressed={vista === 'lista'}
            className={`inline-flex size-10 items-center justify-center rounded-r-md transition-colors ${
              vista === 'lista'
                ? 'bg-texto text-white'
                : 'text-texto-3 hover:bg-fondo-2 hover:text-texto'
            }`}
          >
            <List className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <label className="flex w-full items-center gap-2 sm:hidden">
        <span className="label-web text-texto-4">Ordenar</span>
        <Selector
          value={orden}
          onChange={(e) => onOrden(e.target.value)}
          className="h-10 flex-1 text-[13px]"
          aria-label="Ordenar resultados"
        >
          {ORDENES.map((o) => (
            <option key={o.id} value={o.id}>
              {o.etiqueta}
            </option>
          ))}
        </Selector>
      </label>
    </div>
  )
}
