import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Filete superior de color, para distinguir bloques sin sombras. */
  acento?: 'oxblood' | 'brass' | 'pine' | 'none'
}

const ACENTOS = {
  oxblood: 'before:bg-oxblood',
  brass: 'before:bg-brass',
  pine: 'before:bg-pine',
  none: 'before:bg-transparent',
}

export function Card({ children, className = '', acento = 'none' }: CardProps) {
  return (
    <section
      className={`relative border border-rule bg-paper-2 rounded-xs before:absolute before:inset-x-0 before:top-0 before:h-[2px] ${ACENTOS[acento]} ${className}`}
    >
      {children}
    </section>
  )
}

interface CardHeaderProps {
  titulo: ReactNode
  eyebrow?: ReactNode
  descripcion?: ReactNode
  acciones?: ReactNode
  className?: string
}

export function CardHeader({
  titulo,
  eyebrow,
  descripcion,
  acciones,
  className = '',
}: CardHeaderProps) {
  return (
    <header
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-rule px-4 py-3 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="label-tech mb-1 text-ink-4">{eyebrow}</p>
        ) : null}
        <h2 className="label-tech text-ink">{titulo}</h2>
        {descripcion ? (
          <p className="mt-1 text-[12px] leading-snug text-ink-3">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex shrink-0 items-center gap-2">{acciones}</div> : null}
    </header>
  )
}

export function CardBody({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`px-4 py-3.5 ${className}`}>{children}</div>
}
