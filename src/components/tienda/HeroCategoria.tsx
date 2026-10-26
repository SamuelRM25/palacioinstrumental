import type { Categoria } from '../../types'
import { IlustracionProducto } from './IlustracionProducto'

/** Portada de una familia en el catálogo: nombre, conteo y su escena de estudio. */
export function HeroCategoria({
  familia,
  total,
}: {
  familia: Categoria
  total: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-borde bg-fondo-2">
      <div className="grid items-center sm:grid-cols-[1fr_16rem]">
        <div className="p-7 sm:p-10">
          <p className="label-web text-acento-2">Familia</p>
          <p className="mt-3 font-sora text-[26px] leading-tight font-extrabold tracking-tight sm:text-[32px]">
            {familia.nombre}
          </p>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-texto-3">
            {total} {total === 1 ? 'referencia' : 'referencias'} con ficha técnica
            completa, disponibilidad al día y precio de cada cuota.
          </p>
        </div>
        <div className="hidden h-full sm:block">
          <IlustracionProducto
            categoria={familia.id}
            sku={`HERO-${familia.id}`}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  )
}
