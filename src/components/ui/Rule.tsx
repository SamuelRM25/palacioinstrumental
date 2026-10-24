import type { ReactNode } from 'react'

/**
 * Divisor del sistema visual: hairline de diapasón con incrustación de
 * punto. Reemplaza a las separaciones por sombra o por bloques grises.
 */
export function Regla({
  eyebrow,
  titulo,
  acciones,
  className = '',
}: {
  eyebrow?: ReactNode
  titulo?: ReactNode
  acciones?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? <p className="label-tech text-ink-4">{eyebrow}</p> : null}
        {titulo ? (
          <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">
            {titulo}
          </h2>
        ) : null}
      </div>
      {acciones ? <div className="flex shrink-0 items-center gap-2">{acciones}</div> : null}
    </div>
  )
}

export function Trastes({
  className = '',
  inlay = false,
}: {
  className?: string
  inlay?: boolean
}) {
  return (
    <div className={`relative h-px w-full bg-rule ${className}`}>
      {inlay ? (
        <span
          aria-hidden
          className="absolute top-1/2 left-[38%] size-1.5 -translate-y-1/2 rounded-full bg-brass"
        />
      ) : null}
    </div>
  )
}
