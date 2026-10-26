import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { moneda, monedaCorta } from '../../lib/format'
import { totalConInteres } from '../../lib/tienda'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { Aviso, Etiqueta, ImagenProducto, Precio } from '../../components/tienda/Piezas'
import { SelectorPlan } from '../../components/tienda/SelectorPlan'

export default function TiendaCarrito() {
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const lineas = useCart((s) => s.lineas)
  const cambiar = useCart((s) => s.cambiar)
  const quitar = useCart((s) => s.quitar)
  const vaciar = useCart((s) => s.vaciar)

  const [meses, setMeses] = useState(0)
  const [entrega, setEntrega] = useState<'local' | 'interior'>('local')

  const detalle = useMemo(
    () =>
      lineas
        .map((linea) => ({
          linea,
          producto: productos.find((p) => p.id === linea.productoId),
        }))
        .filter((x) => x.producto),
    [lineas, productos],
  )

  const unidades = detalle.reduce((total, x) => total + x.linea.cantidad, 0)
  const subtotal = detalle.reduce(
    (total, x) => total + (x.producto?.precio ?? 0) * x.linea.cantidad,
    0,
  )

  // Gratis en Huehuetenango desde cierto monto; al interior siempre aplica la
  // tarifa nacional (es lo que promete la portada).
  const envio =
    subtotal === 0
      ? 0
      : entrega === 'interior'
        ? config.envioNacional
        : subtotal >= config.envioGratisDesde
          ? 0
          : config.envioLocal

  const total = totalConInteres(subtotal + envio, meses, config.interesPct)

  if (detalle.length === 0) {
    return (
      <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 sm:py-24">
        <Aviso
          titulo="Tu carrito está vacío"
          texto="Todavía no agregaste nada. Mirá el catálogo y encontrá el instrumento que estabas buscando."
          icono={<ShoppingBag className="size-6" aria-hidden />}
          accion={
            <Link
              to="/catalogo"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-texto px-5 text-[13px] font-semibold text-white"
            >
              Ver el catálogo
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          }
        />
      </div>
    )
  }

  const mensaje = enlaceWhatsappTienda(
    config,
    [
      `Hola ${config.nombre}, quiero confirmar este pedido:`,
      '',
      ...detalle.map(
        (x) =>
          `• ${x.producto?.nombre} (${x.producto?.sku}) x${x.linea.cantidad} — ${moneda((x.producto?.precio ?? 0) * x.linea.cantidad)}`,
      ),
      '',
      `*Total: ${moneda(total)}*`,
      `Plan de pago: ${meses === 0 ? 'Contado' : `${meses} cuotas de ${moneda(total / meses)}`}`,
      envio > 0 ? `Envío: ${moneda(envio)}` : 'Envío sin costo',
      entrega === 'local' ? `Recojo en el local: ${config.direccion}` : 'Envío al resto del país',
      '',
      'Quedo al pendiente de confirmar disponibilidad.',
    ].join('\n'),
  )

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Etiqueta className="text-acento-2">Pedido</Etiqueta>
          <h1 className="mt-2 font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[38px]">
            Carrito
          </h1>
          <p className="mt-2 text-[14px] text-texto-3">
            {unidades} {unidades === 1 ? 'artículo' : 'artículos'} ·{' '}
            {detalle.length}{' '}
            {detalle.length === 1 ? 'referencia' : 'referencias'}
          </p>
        </div>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-texto-2 hover:text-acento-2"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Seguir comprando
        </Link>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
        {/* ── Líneas ───────────────────────────────────────────── */}
        <div>
          <ul className="border-t border-borde">
            {detalle.map(({ linea, producto }) => {
              if (!producto) return null
              const maximo = Math.max(
                1,
                producto.stock - producto.reservado,
              )
              return (
                <li
                  key={linea.productoId}
                  className="flex flex-wrap items-start gap-4 border-b border-borde py-5 sm:gap-5"
                >
                  <Link
                    to={`/producto/${producto.id}`}
                    className="size-20 shrink-0 overflow-hidden rounded-lg bg-fondo-2 sm:size-24"
                    tabIndex={-1}
                    aria-hidden
                  >
                    <ImagenProducto producto={producto} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="label-web text-texto-4">{producto.marca}</p>
                    <h2 className="mt-1 text-[15px] font-semibold">
                      <Link
                        to={`/producto/${producto.id}`}
                        className="transition-colors hover:text-acento-2"
                      >
                        {producto.nombre}
                      </Link>
                    </h2>
                    <p className="codigo-web mt-1 text-texto-4">{producto.sku}</p>

                    {linea.cantidad > maximo ? (
                      <p className="mt-2 text-[12.5px] text-alerta">
                        Sólo quedan {maximo} disponibles. Ajustamos la cantidad
                        al confirmar.
                      </p>
                    ) : null}

                    <div className="mt-3 inline-flex h-10 items-center rounded-md border border-borde-2">
                      <button
                        type="button"
                        onClick={() => cambiar(linea.productoId, linea.cantidad - 1)}
                        aria-label="Quitar una unidad"
                        className="inline-flex size-9 items-center justify-center rounded-l-md text-texto-2 transition-colors hover:bg-fondo-2 hover:text-texto"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="w-10 text-center text-[14px] font-semibold tabular-nums">
                        {linea.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiar(linea.productoId, Math.min(maximo, linea.cantidad + 1))}
                        disabled={linea.cantidad >= maximo}
                        aria-label="Agregar una unidad"
                        className="inline-flex size-9 items-center justify-center rounded-r-md text-texto-2 transition-colors hover:bg-fondo-2 hover:text-texto disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end">
                    <button
                      type="button"
                      onClick={() => quitar(linea.productoId)}
                      aria-label={`Quitar ${producto.nombre} del carrito`}
                      className="inline-flex size-9 items-center justify-center rounded-md text-texto-4 transition-colors hover:bg-alerta-2 hover:text-alerta"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                    <Precio
                      valor={producto.precio * linea.cantidad}
                      tamano="md"
                      className="sm:order-first"
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={vaciar}
            className="mt-4 text-[13px] font-semibold text-texto-4 underline underline-offset-4 transition-colors hover:text-alerta"
          >
            Vaciar el carrito
          </button>
        </div>

        {/* ── Resumen ─────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-2xl border border-borde bg-fondo-2 p-6">
            <h2 className="font-sora text-[17px] font-bold">Resumen</h2>

            <dl className="mt-5 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13.5px] text-texto-3">
                  Subtotal ({unidades} art.)
                </dt>
                <dd className="text-[14px] font-medium tabular-nums">
                  {moneda(subtotal)}
                </dd>
              </div>

              <div>
                <dt className="text-[13.5px] text-texto-3">Entrega</dt>
                <dd className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntrega('local')}
                    aria-pressed={entrega === 'local'}
                    className={`rounded-md border px-3 py-2.5 text-left text-[12.5px] transition-colors ${
                      entrega === 'local'
                        ? 'border-acento bg-acento-3 font-semibold text-texto'
                        : 'border-borde-2 bg-white text-texto-2 hover:border-texto-4'
                    }`}
                  >
                    En el local
                    <span className="block text-[11.5px] font-normal text-texto-4">
                      Zona 11, Huehue · {config.envioLocal === 0 ? 'sin costo' : monedaCorta(config.envioLocal)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntrega('interior')}
                    aria-pressed={entrega === 'interior'}
                    className={`rounded-md border px-3 py-2.5 text-left text-[12.5px] transition-colors ${
                      entrega === 'interior'
                        ? 'border-acento bg-acento-3 font-semibold text-texto'
                        : 'border-borde-2 bg-white text-texto-2 hover:border-texto-4'
                    }`}
                  >
                    Al interior
                    <span className="block text-[11.5px] font-normal text-texto-4">
                      Envío · {monedaCorta(config.envioNacional)}
                    </span>
                  </button>
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[13.5px] text-texto-3">Envío</dt>
                <dd className="text-[14px] font-medium tabular-nums">
                  {envio === 0 ? (
                    <span className="text-ok">Sin costo</span>
                  ) : (
                    moneda(envio)
                  )}
                </dd>
              </div>

              {entrega === 'local' && envio > 0 && subtotal < config.envioGratisDesde ? (
                <p className="rounded-md bg-white px-3 py-2 text-[12px] text-texto-3">
                  Te faltan{' '}
                  {monedaCorta(config.envioGratisDesde - subtotal)} para que el
                  envío salga gratis.
                </p>
              ) : null}
            </dl>

            <div className="mt-6">
              <SelectorPlan
                base={subtotal + envio}
                meses={meses}
                onChange={setMeses}
                interesPct={config.interesPct}
                opciones={config.mesesCredito}
              />
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-borde pt-4">
              <span className="label-web text-texto-4">Total</span>
              <Precio valor={total} tamano="lg" />
            </div>

            <a
              href={mensaje}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-acento px-5 text-[13.5px] font-bold text-texto transition-colors hover:bg-acento-2 hover:text-white"
            >
              <MessageCircle className="size-4.5" aria-hidden />
              Confirmar por WhatsApp
            </a>

            <p className="mt-4 border-t border-borde pt-4 text-[12px] leading-relaxed text-texto-3">
              Te enviamos el resumen del pedido con precios, plan de pago y
              envío ya resueltos. Un asesor confirma existencias y coordina la
              entrega. No se cobra nada en esta página.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
