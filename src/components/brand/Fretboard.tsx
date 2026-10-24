import { useEffect, useRef } from 'react'

export interface TrasteOpcion {
  valor: string
  etiqueta: string
  conteo?: number
}

interface Props {
  opciones: TrasteOpcion[]
  valor: string
  onChange: (valor: string) => void
  etiqueta?: string
  className?: string
}

/** Ancho mínimo de un traste. Define el desplazamiento horizontal. */
const ANCHO_TRASTE = '4.75rem'

/**
 * "El diapasón": la navegación por familias de instrumento funciona como un
 * diapasón real. Cada familia es un traste; el capo de latón se desplaza
 * hasta la posición activa. Es la única pieza que se mueve en toda la app.
 *
 * Con muchas familias el diapasón se desplaza en horizontal, y el capo
 * sigue al traste activo aunque quede fuera de vista.
 */
export function Fretboard({
  opciones,
  valor,
  onChange,
  etiqueta = 'Familias de instrumento',
  className = '',
}: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const carrusel = useRef<HTMLDivElement>(null)

  const indice = opciones.findIndex((o) => o.valor === valor)
  /** -1 cuando la selección no corresponde a un traste (p. ej. "todas"). */
  const activo = indice

  useEffect(() => {
    if (activo < 0) return
    const cont = carrusel.current
    const btn = refs.current[activo]
    if (!cont || !btn) return
    const destino = btn.offsetLeft - cont.clientWidth / 2 + btn.offsetWidth / 2
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cont.scrollTo({ left: Math.max(0, destino), behavior: suave ? 'smooth' : 'auto' })
  }, [activo, opciones.length])

  const mover = (delta: number) => {
    const base = activo < 0 ? 0 : activo
    const siguiente = Math.min(opciones.length - 1, Math.max(0, base + delta))
    onChange(opciones[siguiente].valor)
    refs.current[siguiente]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      mover(1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      mover(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onChange(opciones[0].valor)
      refs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      onChange(opciones[opciones.length - 1].valor)
      refs.current[opciones.length - 1]?.focus()
    }
  }

  const n = opciones.length
  // Sin traste activo el capo descansa sobre la cejuela.
  const capoPos = activo < 0 ? 0 : ((activo + 0.5) / n) * 100

  return (
    <div className={className}>
      <div
        ref={carrusel}
        className="relative overflow-x-auto overflow-y-hidden scrollbar-thin"
      >
        <div
          className="relative"
          style={{ minWidth: `calc(${n} * ${ANCHO_TRASTE})` }}
        >
          <div
            role="tablist"
            aria-label={etiqueta}
            onKeyDown={onKeyDown}
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(${ANCHO_TRASTE}, 1fr))`,
            }}
          >
            {opciones.map((o, i) => {
              const esActivo = o.valor === valor
              return (
                <button
                  key={o.valor}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  role="tab"
                  type="button"
                  aria-selected={esActivo}
                  tabIndex={esActivo ? 0 : -1}
                  onClick={() => onChange(o.valor)}
                  className={`label-tech group flex min-w-0 flex-col items-center gap-0.5 px-1 pb-2 transition-colors duration-150 ${
                    esActivo ? 'text-oxblood' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <span className="truncate">{o.etiqueta}</span>
                  {o.conteo !== undefined ? (
                    <span className="font-mono text-[9.5px] leading-none text-ink-4">
                      {o.conteo}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Diapasón: cuerdas horizontales, trastes verticales, capo de latón */}
          <div className="relative h-9" aria-hidden>
            {/* Cuerdas */}
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className="absolute inset-x-0 h-px bg-rule"
                style={{ top: 11 + s * 3 }}
              />
            ))}
            {/* Trastes */}
            {opciones.map((o, i) => {
              const esActivo = i === activo
              return (
                <div
                  key={o.valor}
                  className={`absolute top-2 bottom-1 w-px transition-colors duration-200 ${
                    esActivo ? 'bg-brass' : 'bg-rule'
                  }`}
                  style={{ left: `${(i / n) * 100}%` }}
                />
              )
            })}
            {/* Nut (la cejuela, extremo izquierdo) */}
            <div className="absolute top-1 bottom-1 left-0 w-[3px] bg-oxblood" />

            {/* Capo */}
            <div
              className="absolute top-0 transition-[left] duration-300 ease-out"
              style={
                activo < 0
                  ? { left: 0, transform: 'translateX(0)' }
                  : { left: `${capoPos}%`, transform: 'translateX(-50%)' }
              }
            >
              <svg width="12" height="34" viewBox="0 0 12 34" fill="none">
                <rect x="1" y="0" width="10" height="26" rx="2" fill="#C99E4C" />
                <rect x="1" y="0" width="10" height="6" rx="2" fill="#E0BC72" />
                <rect x="4" y="24" width="4" height="9" rx="1.5" fill="#8A6A2E" />
                <circle cx="6" cy="4.5" r="1.4" fill="#8A6A2E" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
