import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { Producto } from '../../types'
import { FOTOS } from '../../data/fotos.generated'
import { IlustracionProducto } from './IlustracionProducto'

/* ── botón ─────────────────────────────────────────────────── */

type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'acento'

const VARIANTES_BOTON: Record<VarianteBoton, string> = {
  primario: 'bg-texto text-white hover:bg-texto-2',
  acento: 'bg-acento text-texto hover:bg-acento-2 hover:text-white',
  secundario:
    'bg-white text-texto border border-borde-2 hover:border-texto hover:bg-fondo-2',
  fantasma: 'bg-transparent text-texto-2 hover:bg-fondo-2 hover:text-texto',
}

interface BotonProps extends ComponentProps<'button'> {
  variante?: VarianteBoton
  children: ReactNode
}

export function Boton({
  variante = 'primario',
  className = '',
  children,
  type = 'button',
  ...rest
}: BotonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-[13px] font-semibold tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTES_BOTON[variante]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

interface BotonEnlaceProps extends ComponentProps<typeof Link> {
  variante?: VarianteBoton
  children: ReactNode
}

export function BotonEnlace({
  variante = 'primario',
  className = '',
  children,
  ...rest
}: BotonEnlaceProps) {
  return (
    <Link
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-[13px] font-semibold tracking-wide transition-colors duration-150 ${VARIANTES_BOTON[variante]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}

/* ── precio ────────────────────────────────────────────────── */

interface PrecioProps {
  valor: number
  tamano?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAMANOS_PRECIO = {
  sm: 'text-[13px]',
  md: 'text-[16px]',
  lg: 'text-[30px] sm:text-[34px]',
}

/** "Q 1,234.50" con cifras tabulares para que el catálogo no baile. */
export function Precio({ valor, tamano = 'md', className = '' }: PrecioProps) {
  const formato = new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return (
    <span className={`font-semibold tracking-tight whitespace-nowrap ${TAMANOS_PRECIO[tamano]} ${className}`}>
      <span className="text-texto-4">Q</span>{' '}
      <span className="tabular-nums">{formato.format(valor)}</span>
    </span>
  )
}

/* ── rótulos ───────────────────────────────────────────────── */

export function Etiqueta({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={`label-web text-texto-4 ${className}`}>{children}</span>
}

export function Pastilla({
  children,
  tono = 'neutro',
  className = '',
}: {
  children: ReactNode
  tono?: 'neutro' | 'acento' | 'ok' | 'alerta' | 'tinta'
  className?: string
}) {
  const tonos = {
    neutro: 'bg-fondo-2 text-texto-3',
    acento: 'bg-acento-3 text-acento-2',
    ok: 'bg-ok-2 text-ok',
    alerta: 'bg-alerta-2 text-alerta',
    tinta: 'bg-texto text-white',
  }
  return (
    <span
      className={`label-web inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${tonos[tono]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ── campos ────────────────────────────────────────────────── */

export function Campo({
  etiqueta,
  children,
  className = '',
}: {
  etiqueta: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-web block text-texto-4">{etiqueta}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}

const CLASE_CONTROL =
  'h-11 w-full rounded-md border border-borde-2 bg-white px-3.5 text-[14px] text-texto transition-colors placeholder:text-texto-4 hover:border-texto-4 focus:border-acento focus:outline-none'

export function Entrada({ className = '', ...rest }: ComponentProps<'input'>) {
  return <input className={`${CLASE_CONTROL} ${className}`} {...rest} />
}

export function Selector({ className = '', ...rest }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={`${CLASE_CONTROL} cursor-pointer appearance-none pr-9 ${className}`}
        {...rest}
      />
      <svg
        aria-hidden
        viewBox="0 0 12 8"
        className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-texto-4"
      >
        <path
          d="M1 1.5 6 6.5l5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function Buscador({
  className = '',
  ...rest
}: ComponentProps<'input'>) {
  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-texto-4"
      />
      <input
        type="search"
        className={`${CLASE_CONTROL} h-12 rounded-md border-borde bg-fondo-2 pl-11 hover:bg-white ${className}`}
        {...rest}
      />
    </div>
  )
}

/* ── imagen del producto ───────────────────────────────────── */

interface ImagenProductoProps {
  producto: Producto
  className?: string
  prioridad?: boolean
}

/**
 * Foto real si existe (`public/productos/{SKU}.*` o el campo `imagen`),
 * si no la ilustración de estudio de la familia.
 */
export function ImagenProducto({
  producto,
  className = '',
  prioridad = false,
}: ImagenProductoProps) {
  const foto = producto.imagen ?? FOTOS[producto.sku]

  if (foto) {
    return (
      <img
        src={foto}
        alt={producto.nombre}
        loading={prioridad ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <IlustracionProducto
      categoria={producto.categoria}
      sku={producto.sku}
      className={`h-full w-full ${className}`}
    />
  )
}

/* ── cinta sobre la imagen ─────────────────────────────────── */

export function Cinta({
  children,
  tono = 'neutro',
  className = '',
}: {
  children: ReactNode
  tono?: 'neutro' | 'acento' | 'alerta' | 'tinta'
  className?: string
}) {
  const tonos = {
    neutro: 'bg-white/92 text-texto-3',
    acento: 'bg-acento text-texto',
    alerta: 'bg-alerta text-white',
    tinta: 'bg-texto text-white',
  }
  return (
    <span
      className={`label-web inline-flex items-center rounded-full px-2.5 py-1 shadow-sm backdrop-blur-sm ${tonos[tono]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ── estado vacío ──────────────────────────────────────────── */

export function Aviso({
  titulo,
  texto,
  icono,
  accion,
}: {
  titulo: string
  texto: string
  icono?: ReactNode
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-borde-2 bg-fondo-2 px-6 py-16 text-center">
      {icono ? (
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-white text-texto-3">
          {icono}
        </span>
      ) : null}
      <h2 className="text-[19px]">{titulo}</h2>
      <p className="mt-2 max-w-sm text-[14px] text-texto-3">{texto}</p>
      {accion ? <div className="mt-6">{accion}</div> : null}
    </div>
  )
}

/* ── hoja lateral (filtros en móvil) ───────────────────────── */

export function Hoja({
  abierto,
  onCerrar,
  titulo,
  children,
  pie,
}: {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
  pie?: ReactNode
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Cerrar filtros"
        onClick={onCerrar}
        className="absolute inset-0 bg-texto/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="animate-fade absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-borde px-5 py-4">
          <h2 className="text-[16px]">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-2 py-1 text-[13px] font-semibold text-texto-3 hover:bg-fondo-2 hover:text-texto"
          >
            Cerrar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie ? (
          <div className="border-t border-borde bg-white px-5 py-4">{pie}</div>
        ) : null}
      </div>
    </div>
  )
}
