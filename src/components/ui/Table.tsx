import type { ReactNode } from 'react'

export interface ColumnaTabla<T> {
  clave: string
  encabezado: ReactNode
  render: (fila: T) => ReactNode
  /** Alineación de la celda. */
  alinear?: 'izquierda' | 'derecha' | 'centro'
  /** Ancho fijo en píxeles para columnas de datos. */
  ancho?: number
  /** Oculta la columna en pantallas pequeñas. */
  secundaria?: boolean
}

interface Props<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveFila: (fila: T) => string
  onFilaClick?: (fila: T) => void
  filaActiva?: string
  vacio?: ReactNode
}

export function Tabla<T>({
  columnas,
  filas,
  claveFila,
  onFilaClick,
  filaActiva,
  vacio,
}: Props<T>) {
  if (filas.length === 0) {
    return <>{vacio ?? null}</>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-rule">
            {columnas.map((c) => (
              <th
                key={c.clave}
                scope="col"
                style={c.ancho ? { width: c.ancho } : undefined}
                className={`label-tech px-3 py-2 text-ink-4 ${
                  c.alinear === 'derecha'
                    ? 'text-right'
                    : c.alinear === 'centro'
                      ? 'text-center'
                      : 'text-left'
                } ${c.secundaria ? 'hidden md:table-cell' : ''}`}
              >
                {c.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const id = claveFila(fila)
            const activa = filaActiva === id
            return (
              <tr
                key={id}
                onClick={onFilaClick ? () => onFilaClick(fila) : undefined}
                tabIndex={onFilaClick ? 0 : undefined}
                onKeyDown={
                  onFilaClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onFilaClick(fila)
                        }
                      }
                    : undefined
                }
                className={`border-b border-rule/70 transition-colors duration-100 last:border-b-0 ${
                  onFilaClick ? 'cursor-pointer hover:bg-paper-3/60' : ''
                } ${activa ? 'bg-paper-3' : ''}`}
              >
                {columnas.map((c) => (
                  <td
                    key={c.clave}
                    className={`px-3 py-2 align-middle text-[13px] text-ink ${
                      c.alinear === 'derecha'
                        ? 'text-right'
                        : c.alinear === 'centro'
                          ? 'text-center'
                          : 'text-left'
                    } ${c.secundaria ? 'hidden md:table-cell' : ''}`}
                  >
                    {c.render(fila)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
