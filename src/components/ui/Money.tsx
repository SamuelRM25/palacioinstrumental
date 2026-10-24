import { numero } from '../../lib/format'

interface Props {
  valor: number
  /** Muestra el signo negativo cuando corresponde. */
  conSigno?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const TAMANOS = {
  sm: 'text-[12px]',
  md: 'text-[13px]',
  lg: 'text-[15px]',
}

/**
 * Importe en quetzales. El número va en monoespaciada y la moneda en el
 * mismo bloque, para que las columnas de dinero queden alineadas.
 */
export function Money({ valor, conSigno, className = '', size = 'md' }: Props) {
  const negativo = valor < 0
  const abs = Math.abs(valor)
  return (
    <span
      className={`font-mono tabular-nums ${TAMANOS[size]} ${className}`}
      title={`Q ${numero(abs)}`}
    >
      {conSigno && negativo ? '−' : ''}
      <span className="text-ink-4">Q</span>
      <span className={negativo ? 'text-oxblood' : undefined}>
        {numero(abs)}
      </span>
    </span>
  )
}
