import type { ReactElement } from 'react'
import type { CategoriaId } from '../../types'

/**
 * Glifos line-art por familia de instrumento. Dibujados como celdas de un
 * catálogo técnico: no son fotos de producto, son esquemas. Así el catálogo
 * se ve deliberado sin inventar material gráfico que no existe.
 */

interface Props {
  categoria: CategoriaId
  className?: string
  /** `trazo` para glifos sobre papel, `solido` para el panel oxblood. */
  variante?: 'trazo' | 'solido'
}

const trazo = 'currentColor'

const GLIFOS: Record<CategoriaId, ReactElement> = {
  guitarras: (
    <>
      <path d="M9.2 14.8 6.8 17.2a2.6 2.6 0 0 1-3.7-3.7l2.4-2.4" />
      <path d="M8.4 15.6 6 18" />
      <path d="M9.2 14.8a2.4 2.4 0 1 1 3.4-3.4 2.4 2.4 0 0 1-3.4 3.4Z" />
      <path d="M11.4 12.6 19 5" />
      <path d="M17 4.2 19.8 7" />
      <path d="M18 3.2 20.8 6" />
    </>
  ),
  bajos: (
    <>
      <path d="M8.6 15.4 6.4 17.6a2.3 2.3 0 0 1-3.3-3.3l2.2-2.2" />
      <path d="M9 15a2.4 2.4 0 1 1 3.4-3.4A2.4 2.4 0 0 1 9 15Z" />
      <path d="M10.8 13.2 19 5" />
      <path d="M17.4 3.4 20.4 6.4" />
      <path d="M18.6 2.2 21.6 5.2" />
    </>
  ),
  teclados: (
    <>
      <rect x="2.5" y="7.5" width="19" height="9" rx="1" />
      <path d="M6 7.5v6M9 7.5v6M12 7.5v6M15 7.5v6M18 7.5v6" />
      <path d="M7.5 7.5v3.5M13.5 7.5v3.5M10.5 7.5v3.5M16.5 7.5v3.5" />
    </>
  ),
  bateria: (
    <>
      <ellipse cx="12" cy="7" rx="6.5" ry="2.6" />
      <path d="M5.5 7v10M18.5 7v10" />
      <ellipse cx="12" cy="17" rx="6.5" ry="2.6" />
      <path d="M8 5.2v2.2M16 5.2v2.2M8 16.6v2.2M16 16.6v2.2" />
    </>
  ),
  amplificadores: (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="1.2" />
      <circle cx="12" cy="13.5" r="4" />
      <circle cx="12" cy="13.5" r="1" />
      <path d="M7 8h1M10 8h1M13 8h1M16 8h1" />
    </>
  ),
  audio: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.2" />
      <circle cx="12" cy="11.5" r="5" />
      <circle cx="12" cy="11.5" r="1.6" />
      <path d="M7 18.5h10" />
    </>
  ),
  grabacion: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="1.2" />
      <circle cx="8" cy="12" r="2.2" />
      <path d="M13 10.5h5M13 13.5h5" />
      <path d="M12 17v2.5M9.5 19.5h5" />
    </>
  ),
  microfonos: (
    <>
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M7 9.5v1.5a5 5 0 0 0 10 0V9.5" />
      <path d="M12 16v3.5M8.5 19.5h7" />
    </>
  ),
  'cables-cuerdas': (
    <>
      <path d="M4 17c3.5 0 3.5-4 7-4s3.5 4 7 4" />
      <path d="M4 13c3.5 0 3.5-4 7-4s3.5 4 7 4" />
      <circle cx="20.5" cy="8.5" r="1.6" />
      <path d="M20.5 10.1v3.4" />
    </>
  ),
  dj: (
    <>
      <circle cx="9" cy="14" r="5.5" />
      <circle cx="9" cy="14" r="1.4" />
      <path d="M15.5 6.5 20 9.5" />
      <circle cx="20" cy="9.8" r="1.5" />
      <path d="M4 8.5h6M4 11.5h4" />
    </>
  ),
  accesorios: (
    <>
      <rect x="4" y="6.5" width="16" height="11" rx="1.2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M14 9.5h3M14 12.5h3" />
      <path d="M8 6.5V4.5h8v2" />
    </>
  ),
  vientos: (
    <>
      <path d="M7 4.5h9.5l-2 4h-5.5Z" />
      <path d="M9 8.5v9.5a2.5 2.5 0 0 0 5 0v-4" />
      <path d="M14 14h3.5a2 2 0 0 0 0-4H14" />
    </>
  ),
}

export function InstrumentIcon({
  categoria,
  className = '',
  variante = 'trazo',
}: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={trazo}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={
        variante === 'solido' ? { color: 'currentColor' } : undefined
      }
    >
      {GLIFOS[categoria]}
    </svg>
  )
}
