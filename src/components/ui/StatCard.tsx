import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface Props {
  etiqueta: string
  valor: ReactNode
  /** Variación relativa, si aplica. */
  variacion?: { valor: string; direccion: 'sube' | 'baja' | 'igual' }
  pie?: ReactNode
  acento?: 'oxblood' | 'brass' | 'pine' | 'none'
}

const ACENTOS = {
  oxblood: 'before:bg-oxblood',
  brass: 'before:bg-brass',
  pine: 'before:bg-pine',
  none: 'before:bg-rule',
}

export function StatCard({
  etiqueta,
  valor,
  variacion,
  pie,
  acento = 'none',
}: Props) {
  const dir = variacion?.direccion ?? 'igual'
  return (
    <div
      className={`relative overflow-hidden border border-rule bg-paper-2 px-3.5 py-3 before:absolute before:inset-x-0 before:top-0 before:h-[2px] ${ACENTOS[acento]}`}
    >
      <p className="label-tech text-ink-4">{etiqueta}</p>
      <p className="mt-1.5 font-display text-[26px] leading-none font-semibold tracking-tight text-ink">
        {valor}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {variacion ? (
          <span
            className={`label-mono inline-flex items-center gap-0.5 ${
              dir === 'sube'
                ? 'text-pine'
                : dir === 'baja'
                  ? 'text-oxblood'
                  : 'text-ink-4'
            }`}
          >
            {dir === 'sube' ? (
              <ArrowUp className="size-3" aria-hidden />
            ) : dir === 'baja' ? (
              <ArrowDown className="size-3" aria-hidden />
            ) : null}
            {variacion.valor}
          </span>
        ) : null}
        {pie ? <span className="text-[11px] text-ink-4">{pie}</span> : null}
      </div>
    </div>
  )
}
