import type { ReactNode } from 'react'

interface Props<T extends string> {
  valor: T
  onChange: (v: T) => void
  opciones: { valor: T; etiqueta: string; conteo?: number }[]
  etiqueta?: string
  className?: string
}

export function Tabs<T extends string>({
  valor,
  onChange,
  opciones,
  etiqueta,
  className = '',
}: Props<T>) {
  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className={`flex flex-wrap items-center gap-1 border-b border-rule ${className}`}
    >
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            role="tab"
            type="button"
            aria-selected={activo}
            onClick={() => onChange(o.valor)}
            className={`label-tech -mb-px border-b-2 px-3 py-2 transition-colors duration-150 ${
              activo
                ? 'border-oxblood text-oxblood'
                : 'border-transparent text-ink-3 hover:border-rule-2 hover:text-ink'
            }`}
          >
            {o.etiqueta}
            {o.conteo !== undefined ? (
              <span className="ml-1.5 font-mono text-[10px] text-ink-4">
                {o.conteo}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function Panel({ children }: { children: ReactNode }) {
  return (
    <div role="tabpanel" className="animate-fade pt-4">
      {children}
    </div>
  )
}
