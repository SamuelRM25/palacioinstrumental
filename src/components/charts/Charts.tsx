import { monedaCompakta } from '../../lib/format'

export interface PuntoBarra {
  etiqueta: string
  valor: number
  /** Marca secundaria dentro de la misma barra (p. ej. cerradas). */
  anidado?: number
}

interface BarrasProps {
  datos: PuntoBarra[]
  alto?: number
  color?: 'oxblood' | 'brass' | 'pine'
  formato?: (n: number) => string
  className?: string
}

const COLORES = {
  oxblood: 'bg-oxblood',
  brass: 'bg-brass',
  pine: 'bg-pine',
}

const REJILLAS = {
  oxblood: 'bg-oxblood/20',
  brass: 'bg-brass/25',
  pine: 'bg-pine/20',
}

/** Barras verticales en CSS: texto nítido y responsive sin SVG. */
export function BarrasVerticales({
  datos,
  alto = 150,
  color = 'oxblood',
  formato = monedaCompakta,
  className = '',
}: BarrasProps) {
  const max = Math.max(...datos.map((d) => d.valor), 1)

  return (
    <div className={className}>
      <div
        aria-hidden
        className="flex items-end gap-1.5 border-b border-rule"
        style={{ height: alto }}
      >
        {datos.map((d) => {
          const pct = (d.valor / max) * 100
          const pctAnidado = d.anidado !== undefined ? (d.anidado / max) * 100 : 0
          return (
            <div key={d.etiqueta} className="group flex h-full flex-1 flex-col justify-end">
              <span className="sr-only">
                {d.etiqueta}: {formato(d.valor)}
              </span>
              <div aria-hidden className="relative flex-1">
                {/* Barra clara: monto total de la semana */}
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-t-xs ${REJILLAS[color]} transition-[height] duration-500`}
                  style={{ height: `${Math.max(pct, d.valor > 0 ? 2 : 0)}%` }}
                />
                {/* Barra sólida: monto ya cerrado */}
                {d.anidado !== undefined && d.anidado > 0 ? (
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-t-xs ${COLORES[color]} transition-[height] duration-500`}
                    style={{ height: `${Math.max(pctAnidado, 1.5)}%` }}
                  />
                ) : null}
                <span className="pointer-events-none absolute -top-5 left-1/2 hidden -translate-x-1/2 rounded-xs border border-rule bg-ink px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-paper group-hover:block">
                  {formato(d.valor)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      <div aria-hidden className="mt-1.5 flex gap-1.5">
        {datos.map((d) => (
          <div
            key={d.etiqueta}
            className="flex-1 text-center font-mono text-[9.5px] text-ink-4"
          >
            {d.etiqueta}
          </div>
        ))}
      </div>
    </div>
  )
}

interface BarrasHProps {
  datos: { etiqueta: string; valor: number; detalle?: string }[]
  color?: 'oxblood' | 'brass' | 'pine'
  formato?: (n: number) => string
  className?: string
}

/** Barras horizontales con etiqueta a la izquierda y valor a la derecha. */
export function BarrasHorizontales({
  datos,
  color = 'oxblood',
  formato = monedaCompakta,
  className = '',
}: BarrasHProps) {
  const max = Math.max(...datos.map((d) => d.valor), 1)

  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {datos.map((d) => (
        <li key={d.etiqueta} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-2">
          <span className="label-tech truncate text-ink-3" title={d.etiqueta}>
            {d.etiqueta}
          </span>
          <span className="relative h-2.5 overflow-hidden rounded-xs bg-paper-3">
            <span
              className={`absolute inset-y-0 left-0 rounded-xs ${COLORES[color]}`}
              style={{ width: `${(d.valor / max) * 100}%` }}
            />
          </span>
          <span className="font-mono text-[11px] tabular-nums text-ink">
            {formato(d.valor)}
            {d.detalle ? (
              <span className="ml-1.5 text-ink-4">{d.detalle}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

interface EmbudoProps {
  etapas: { id: string; nombre: string; conteo: number; monto: number; conversion: number }[]
  className?: string
}

/**
 * Embudo de conversión. Cada barra se estrecha con la etapa y el
 * porcentaje de paso va al lateral, para que el dato no dependa del color.
 */
export function Embudo({ etapas, className = '' }: EmbudoProps) {
  const max = Math.max(...etapas.map((e) => e.conteo), 1)

  return (
    <ol className={`flex flex-col gap-1.5 ${className}`}>
      {etapas.map((e, i) => {
        const ancho = Math.max((e.conteo / max) * 100, e.conteo > 0 ? 12 : 4)
        return (
          <li key={e.id} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2">
            <span className="label-tech truncate text-ink-3">{e.nombre}</span>
            <span className="relative h-6">
              <span
                className="absolute inset-y-0 left-0 bg-oxblood/85 transition-[width] duration-500"
                style={{ width: `${ancho}%` }}
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 font-mono text-[10.5px] text-paper">
                {e.conteo}
              </span>
            </span>
            <span className="text-right font-mono text-[10.5px] text-ink-3">
              {i === 0 ? '—' : `${Math.round(e.conversion)}%`}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
