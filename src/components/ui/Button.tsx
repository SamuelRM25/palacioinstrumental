import type { ComponentProps, ReactNode } from 'react'

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brass'
type Tamano = 'sm' | 'md'

interface Props extends ComponentProps<'button'> {
  variante?: Variante
  tamano?: Tamano
  children: ReactNode
}

const ESTILOS: Record<Variante, string> = {
  primary:
    'bg-oxblood text-paper border border-oxblood hover:bg-oxblood-hi hover:border-oxblood-hi',
  secondary:
    'bg-transparent text-ink border border-rule-2 hover:border-ink hover:bg-paper-2',
  ghost:
    'bg-transparent text-ink-2 border border-transparent hover:text-ink hover:bg-paper-2',
  danger:
    'bg-transparent text-oxblood border border-oxblood/40 hover:bg-oxblood hover:text-paper hover:border-oxblood',
  brass:
    'bg-brass-soft text-brass-ink border border-brass/50 hover:bg-brass hover:text-paper hover:border-brass',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-7 px-2.5 text-[10px]',
  md: 'h-9 px-3.5 text-[11px]',
}

export function Button({
  variante = 'secondary',
  tamano = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`label-tech inline-flex items-center justify-center gap-1.5 rounded-xs transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${ESTILOS[variante]} ${TAMANOS[tamano]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

interface IconButtonProps extends ComponentProps<'button'> {
  etiqueta: string
  children: ReactNode
}

export function IconButton({
  etiqueta,
  children,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={etiqueta}
      title={etiqueta}
      className={`inline-flex size-8 items-center justify-center rounded-xs border border-transparent text-ink-3 transition-colors duration-150 hover:border-rule-2 hover:bg-paper-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
