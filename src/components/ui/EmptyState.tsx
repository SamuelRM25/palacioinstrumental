import type { ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  titulo: string
  descripcion?: string
  icono?: ReactNode
  accion?: { etiqueta: string; onClick: () => void; variante?: 'primary' | 'secondary' }
  className?: string
}

export function EmptyState({
  titulo,
  descripcion,
  icono,
  accion,
  className = '',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
    >
      {icono ? (
        <div
          aria-hidden
          className="mb-3 flex size-10 items-center justify-center rounded-xs border border-rule bg-paper text-ink-4"
        >
          {icono}
        </div>
      ) : null}
      <h3 className="label-tech text-ink">{titulo}</h3>
      {descripcion ? (
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-ink-3">
          {descripcion}
        </p>
      ) : null}
      {accion ? (
        <Button
          variante={accion.variante ?? 'secondary'}
          onClick={accion.onClick}
          className="mt-4"
        >
          {accion.etiqueta}
        </Button>
      ) : null}
    </div>
  )
}
