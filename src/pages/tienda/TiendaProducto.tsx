import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { CATEGORIAS } from '../../data/config'
import {
  disponibles,
  estaAgotado,
  estadoFicha,
  quedanPocas,
  totalConInteres,
} from '../../lib/tienda'
import { monedaCorta } from '../../lib/format'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { Boton, Cinta, Etiqueta, ImagenProducto, Precio } from '../../components/tienda/Piezas'
import { SelectorPlan } from '../../components/tienda/SelectorPlan'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'

export default function TiendaProducto() {
  const { id } = useParams()
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)

  const [cantidad, setCantidad] = useState(1)
  const [meses, setMeses] = useState(0)
  const [agregado, setAgregado] = useState(false)

  // Al cambiar de artículo, la cantidad vuelve a uno (ajuste en render).
  const [articuloPrevio, setArticuloPrevio] = useState(id)
  if (id !== articuloPrevio) {
    setArticuloPrevio(id)
    setCantidad(1)
  }

  const producto = productos.find((p) => p.id === id)
  const familia = CATEGORIAS.find((c) => c.id === producto?.categoria)

  const relacionados = useMemo(
    () =>
      producto
        ? productos
            .filter((p) => p.categoria === producto.categoria && p.id !== producto.id)
            .slice(0, 4)
        : [],
    [productos, producto],
  )

  useEffect(() => {
    if (!producto) return
    document.title = `${producto.nombre} · ${config.nombre}`
  }, [producto, config.nombre])

  if (!producto) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-24 sm:px-6">
        <div className="rounded-xl border border-dashed border-borde-2 bg-fondo-2 px-6 py-16 text-center">
          <h1 className="font-sora text-[24px] font-extrabold">
            Ese artículo no existe
          </h1>
          <p className="mt-2 text-[14px] text-texto-3">
            Puede que se haya agotado o que el enlace esté incompleto.
          </p>
          <Link
            to="/catalogo"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-texto px-5 text-[13px] font-semibold text-white"
          >
            Ver el catálogo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    )
  }

  const estado = estadoFicha(producto)
  const existencias = disponibles(producto)
  const agotado = estaAgotado(producto)
  const pocas = quedanPocas(producto)
  const maximo = Math.max(existencias, 1)

  const subtotal = producto.precio * cantidad
  const total = totalConInteres(subtotal, meses, config.interesPct)

  const consultar = enlaceWhatsappTienda(
    config,
    `Hola ${config.nombre}, me interesa el *${producto.nombre}* (${producto.sku}). ¿Está disponible?`,
  )

  const alAgregar = () => {
    agregar(producto.id, cantidad)
    setAgregado(true)
    window.setTimeout(() => setAgregado(false), 1800)
  }

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-texto-4">
        <Link to="/" className="hover:text-texto">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        {familia ? (
          <>
            <Link
              to={`/catalogo?categoria=${familia.id}`}
              className="hover:text-texto"
            >
              {familia.nombre}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
          </>
        ) : null}
        <span className="text-texto-3">{producto.nombre}</span>
      </nav>

      {/* En móvil el orden es galería → compra → detalle; en escritorio la
          caja de compra ocupa la columna derecha y se queda fija. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-14 lg:gap-y-0">
        {/* ── Galería ──────────────────────────────────────────── */}
        <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
          <div className="relative overflow-hidden rounded-2xl border border-borde bg-fondo-2">
            <div className="aspect-square">
              <ImagenProducto producto={producto} prioridad />
            </div>
            {estado ? (
              <span className="absolute top-4 left-4">
                <Cinta tono={estado.tono}>{estado.texto}</Cinta>
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Detalle ──────────────────────────────────────────── */}
        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
          {/* Especificaciones */}
          <section className="lg:mt-10">
            <h2 className="border-b border-texto pb-3 font-sora text-[17px] font-bold">
              Especificaciones
            </h2>
            <dl className="mt-1">
              {producto.specs.map((spec) => (
                <div
                  key={spec.etiqueta}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-borde py-3"
                >
                  <dt className="text-[13.5px] text-texto-3">{spec.etiqueta}</dt>
                  <dd className="codigo-web text-right text-texto">{spec.valor}</dd>
                </div>
              ))}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-borde py-3">
                <dt className="text-[13.5px] text-texto-3">Familia</dt>
                <dd className="codigo-web text-right text-texto">
                  {familia?.nombre}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-borde py-3">
                <dt className="text-[13.5px] text-texto-3">Existencias</dt>
                <dd className="codigo-web text-right text-texto">
                  {agotado
                    ? 'Sin existencias'
                    : `${existencias} disponibles`}
                </dd>
              </div>
            </dl>
          </section>

          {/* Condiciones */}
          <section className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                icono: ShieldCheck,
                texto: `Garantía de ${config.garantiaMeses} meses sobre defectos de fábrica, en el local o con el técnico de la tienda.`,
              },
              {
                icono: Truck,
                texto: `Envío gratis en Huehuetenango desde ${monedaCorta(config.envioGratisDesde)}; al resto del país ${monedaCorta(config.envioNacional)}.`,
              },
            ].map(({ icono: Icono, texto }) => (
              <p
                key={texto}
                className="flex gap-3 rounded-xl border border-borde bg-fondo-2 p-4 text-[13px] leading-relaxed text-texto-2"
              >
                <Icono className="size-5 shrink-0 text-acento-2" aria-hidden />
                {texto}
              </p>
            ))}
          </section>

          {/* Relacionados */}
          {relacionados.length ? (
            <section className="mt-12">
              <h2 className="font-sora text-[20px] font-bold">
                También de {familia?.nombre.toLowerCase()}
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {relacionados.map((p) => (
                  <li key={p.id}>
                    <TarjetaProducto producto={p} onAgregar={(x) => agregar(x.id)} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* ── Caja de compra ───────────────────────────────────── */}
        <aside className="order-2 lg:order-none lg:sticky lg:top-40 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <Etiqueta className="text-acento-2">{producto.marca}</Etiqueta>
          <h1 className="mt-2.5 font-sora text-[28px] leading-[1.1] font-extrabold tracking-tight sm:text-[34px] lg:text-[40px]">
            {producto.nombre}
          </h1>
          <p className="codigo-web mt-2.5 text-texto-4">
            Ref. {producto.sku} · {familia?.nombre}
          </p>

          <div className="mt-6 rounded-2xl border border-borde bg-fondo-2 p-6">
            <div className="flex items-end justify-between gap-3">
              <Precio valor={producto.precio} tamano="lg" />
              <span className="label-web pb-1.5 text-texto-4">c/u</span>
            </div>

            <p
              className={`mt-2 text-[13px] font-medium ${
                agotado ? 'text-alerta' : pocas ? 'text-texto-2' : 'text-ok'
              }`}
            >
              {agotado
                ? 'Sin existencias — avisanos cuando entre'
                : pocas
                  ? `Sólo quedan ${existencias}`
                  : 'En stock · sale hoy del local'}
            </p>

            {!agotado ? (
              <>
                <div className="mt-6">
                  <span className="label-web block text-texto-4">Cantidad</span>
                  <div className="mt-2 inline-flex h-11 items-center rounded-md border border-borde-2 bg-white">
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      aria-label="Quitar una unidad"
                      className="inline-flex size-10 items-center justify-center rounded-l-md text-texto-2 transition-colors hover:bg-fondo-2 hover:text-texto"
                    >
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-12 text-center text-[15px] font-semibold tabular-nums">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(maximo, c + 1))}
                      aria-label="Agregar una unidad"
                      className="inline-flex size-10 items-center justify-center rounded-r-md text-texto-2 transition-colors hover:bg-fondo-2 hover:text-texto"
                    >
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <SelectorPlan
                    base={subtotal}
                    meses={meses}
                    onChange={setMeses}
                    interesPct={config.interesPct}
                    opciones={config.mesesCredito}
                  />
                </div>

                <div className="mt-6 flex items-baseline justify-between border-t border-borde pt-4">
                  <span className="label-web text-texto-4">Total</span>
                  <Precio valor={total} tamano="md" />
                </div>

                <Boton
                  variante="acento"
                  className="mt-5 w-full"
                  onClick={alAgregar}
                >
                  {agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
                </Boton>
                <a
                  href={consultar}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-borde-2 bg-white px-5 text-[13px] font-semibold text-texto transition-colors hover:border-texto"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Consultar por WhatsApp
                </a>
              </>
            ) : (
              <a
                href={consultar}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-texto px-5 text-[13px] font-semibold text-white"
              >
                <MessageCircle className="size-4" aria-hidden />
                Avisame cuando entre
              </a>
            )}

            <p className="mt-5 border-t border-borde pt-4 text-[12px] leading-relaxed text-texto-3">
              Precios en quetzales con IVA incluido ({config.ivaPct}%). El pago
              se coordina por WhatsApp: te confirmamos existencias y te
              enviamos el resumen antes de cobrar.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
