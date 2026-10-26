import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import type { Producto } from '../../types'
import { estaAgotado, estadoProducto } from '../../lib/tienda'
import { Cinta, ImagenProducto, Precio } from './Piezas'

interface Props {
  producto: Producto
  onAgregar?: (producto: Producto) => void
}

/** Tarjeta del catálogo: imagen, marca, nombre, dos datos y el precio. */
export function TarjetaProducto({ producto, onAgregar }: Props) {
  const [agregado, setAgregado] = useState(false)
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const agotado = estaAgotado(producto)
  const estado = estadoProducto(producto)

  const agregar = () => {
    if (!onAgregar || agotado) return
    onAgregar(producto)
    setAgregado(true)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setAgregado(false), 1600)
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-borde bg-white transition-colors duration-200 hover:border-borde-2">
      <Link
        to={`/producto/${producto.id}`}
        className="relative block aspect-square overflow-hidden bg-fondo-2"
        tabIndex={-1}
        aria-hidden
      >
        <ImagenProducto
          producto={producto}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </Link>

      {estado ? (
        <span className="absolute top-3 left-3">
          <Cinta tono={estado.tono}>{estado.texto}</Cinta>
        </span>
      ) : null}

      <div className="flex flex-1 flex-col p-4">
        <p className="label-web text-texto-4">{producto.marca}</p>

        <h3 className="mt-1.5 text-[14.5px] leading-snug font-semibold">
          <Link
            to={`/producto/${producto.id}`}
            className="transition-colors hover:text-acento-2"
          >
            {producto.nombre}
          </Link>
        </h3>

        <ul className="mt-2 space-y-0.5">
          {producto.specs.slice(0, 2).map((spec) => (
            <li key={spec.etiqueta} className="truncate text-[12px] text-texto-3">
              <span className="text-texto-4">{spec.etiqueta}:</span> {spec.valor}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
          <Precio valor={producto.precio} tamano="md" />
          {onAgregar ? (
            <button
              type="button"
              onClick={agregar}
              disabled={agotado}
              aria-label={
                agotado
                  ? `${producto.nombre} está agotado`
                  : `Agregar ${producto.nombre} al carrito`
              }
              className={`inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-[12.5px] sm:h-9 font-semibold transition-colors ${
                agotado
                  ? 'cursor-not-allowed bg-fondo-2 text-texto-4'
                  : agregado
                    ? 'bg-ok-2 text-ok'
                    : 'bg-texto text-white hover:bg-acento hover:text-texto'
              }`}
            >
              {agregado ? (
                <>
                  <Check className="size-3.5" aria-hidden />
                  Agregado
                </>
              ) : agotado ? (
                'Agotado'
              ) : (
                <>
                  <Plus className="size-3.5" aria-hidden />
                  <span className="hidden sm:inline">Agregar</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

/** La misma información en fila, para la vista de lista del catálogo. */
export function FilaProducto({ producto, onAgregar }: Props) {
  const [agregado, setAgregado] = useState(false)
  const temporizador = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(temporizador.current), [])

  const agotado = estaAgotado(producto)
  const estado = estadoProducto(producto)

  const agregar = () => {
    if (!onAgregar || agotado) return
    onAgregar(producto)
    setAgregado(true)
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setAgregado(false), 1600)
  }

  return (
    <article className="flex gap-4 border-b border-borde py-5 last:border-b-0 sm:gap-5">
      <Link
        to={`/producto/${producto.id}`}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-fondo-2 sm:size-28"
        tabIndex={-1}
        aria-hidden
      >
        <ImagenProducto producto={producto} />
        {estado ? (
          <span className="absolute top-1.5 left-1.5">
            <Cinta tono={estado.tono}>{estado.texto}</Cinta>
          </span>
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <p className="label-web text-texto-4">{producto.marca}</p>
        <h3 className="mt-1 text-[15px] font-semibold">
          <Link
            to={`/producto/${producto.id}`}
            className="transition-colors hover:text-acento-2"
          >
            {producto.nombre}
          </Link>
        </h3>
        <p className="codigo-web mt-1 text-texto-4">{producto.sku}</p>
        <ul className="mt-2 hidden gap-x-6 sm:flex">
          {producto.specs.map((spec) => (
            <li key={spec.etiqueta} className="text-[12.5px] text-texto-3">
              <span className="text-texto-4">{spec.etiqueta}:</span> {spec.valor}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-2.5">
        <Precio valor={producto.precio} tamano="md" />
        {onAgregar ? (
          <button
            type="button"
            onClick={agregar}
            disabled={agotado}
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[12.5px] font-semibold transition-colors ${
              agotado
                ? 'cursor-not-allowed bg-fondo-2 text-texto-4'
                : agregado
                  ? 'bg-ok-2 text-ok'
                  : 'bg-texto text-white hover:bg-acento hover:text-texto'
            }`}
          >
            {agregado ? (
              <>
                <Check className="size-3.5" aria-hidden />
                Agregado
              </>
            ) : agotado ? (
              'Agotado'
            ) : (
              <>
                <Plus className="size-3.5" aria-hidden />
                Agregar
              </>
            )}
          </button>
        ) : null}
      </div>
    </article>
  )
}
