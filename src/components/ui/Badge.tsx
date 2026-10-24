import type { ReactNode } from 'react'
import type { Etapa } from '../../types'
import { ETAPA_INFO } from '../../data/config'

type Tono = 'ink' | 'muted' | 'oxblood' | 'brass' | 'pine' | 'amber'

const TONOS: Record<Tono, string> = {
  ink: 'bg-ink/8 text-ink border-ink/20',
  muted: 'bg-paper-3 text-ink-3 border-rule-2',
  oxblood: 'bg-oxblood-soft text-oxblood border-oxblood/25',
  brass: 'bg-brass-soft text-brass-ink border-brass/40',
  pine: 'bg-pine-soft text-pine border-pine/25',
  amber: 'bg-amber-soft text-amber border-amber/30',
}

interface Props {
  tono?: Tono
  children: ReactNode
  className?: string
}

export function Badge({ tono = 'muted', children, className = '' }: Props) {
  return (
    <span
      className={`label-tech inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 whitespace-nowrap ${TONOS[tono]} ${className}`}
    >
      {children}
    </span>
  )
}

export function EtapaBadge({ etapa, className = '' }: { etapa: Etapa; className?: string }) {
  const info = ETAPA_INFO[etapa]
  const tono: Tono =
    etapa === 'cerrada'
      ? 'oxblood'
      : etapa === 'aprobada'
        ? 'pine'
        : etapa === 'negociando'
          ? 'amber'
          : etapa === 'enviada'
            ? 'brass'
            : etapa === 'perdida'
              ? 'muted'
              : 'ink'
  return (
    <Badge tono={tono} className={className}>
      {info?.nombre ?? etapa}
    </Badge>
  )
}

/** Punto de estado: siempre acompañado de texto, nunca informativo solo. */
export function Punto({ tono = 'pine' }: { tono?: 'pine' | 'amber' | 'oxblood' | 'muted' }) {
  const color =
    tono === 'pine'
      ? 'bg-pine'
      : tono === 'amber'
        ? 'bg-amber'
        : tono === 'oxblood'
          ? 'bg-oxblood'
          : 'bg-ink-4'
  return <span aria-hidden className={`inline-block size-1.5 rounded-full ${color}`} />
}
