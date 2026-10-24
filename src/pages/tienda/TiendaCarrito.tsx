import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, ShoppingBag, Trash2 } from 'lucide-react'
import { IconButton } from '../../components/ui/Button'
import { Money } from '../../components/ui/Money'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Field'
import { InstrumentIcon } from '../../components/brand/InstrumentIcon'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { useToast } from '../../components/ui/toastContext'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import type { Producto } from '../../types'

export default function TiendaCarrito() {
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const lineas = useCart((s) => s.lineas)
  const cambiar = useCart((s) => s.cambiar)
  const quitar = useCart((s) => s.quitar)
  const vaciar = useCart((s) => s.vaciar)
  const avisar = useToast().avisar
  const [meses, setMeses] = useState(0)

  const items = useMemo(() => {
    const salida: { producto: Producto; cantidad: number }[] = []
    for (const linea of lineas) {
      const producto = productos.find((p) => p.id === linea.productoId)
      if (producto) salida.push({ producto, cantidad: linea.cantidad })
    }
    return salida
  }, [lineas, productos])

  const subtotal = items.reduce(
    (a, i) => a + i.producto.precio * i.cantidad,
    0,
  )
  const unidades = items.reduce((a, i) => a + i.cantidad, 0)

  const envio =
    subtotal === 0
      ? 0
      : subtotal >= config.envioGratisDesde
        ? 0
        : config.envioLocal
  const total = subtotal + envio

  const mensaje = () => {
    const detalle = items
      .map(
        (i) =>
          `• ${i.producto.nombre} (${i.producto.sku}) × ${i.cantidad} — ${new Intl.NumberFormat('es-GT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(i.producto.precio * i.cantidad)} Q`,
      )
      .join('\n')
    const plan =
      meses === 0
        ? 'Contado'
        : `${meses} cuotas de ${new Intl.NumberFormat('es-GT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(total / meses)} Q`
    return [
      `Hola ${config.nombre}, quiero confirmar este pedido:`,
      '',
      detalle,
      '',
      `*Total: ${new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} Q*`,
      `Plan de pago: ${plan}`,
      envio === 0 ? 'Envío sin costo' : `Envío: ${envio} Q`,
      '',
      'Quedo al pendiente de confirmar disponibilidad.',
    ].join('\n')
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <EmptyState
          titulo="Tu carrito está vacío"
          descripcion="Todavía no agregaste nada. Podés empezar por los instrumentos más solicitados o por una familia completa."
          icono={<ShoppingBag className="size-5" />}
          accion={{
            etiqueta: 'Ver el catálogo',
            onClick: () => {
              window.location.href = '/catalogo'
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <header>
        <p className="label-tech text-oxblood">Pedido</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight font-semibold tracking-tight text-ink">
          Carrito
        </h1>
        <p className="mt-2 text-[13.5px] text-ink-3">
          {unidades} {unidades === 1 ? 'artículo' : 'artículos'} ·{' '}
          {items.length} {items.length === 1 ? 'referencia' : 'referencias'}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        {/* Líneas */}
        <ul className="border-t border-ink">
          {items.map(({ producto, cantidad }) => {
            const disponible = producto.stock - producto.reservado
            const excede = cantidad > disponible
            return (
              <li
                key={producto.id}
                className="flex flex-wrap items-start gap-4 border-b border-rule py-4"
              >
                <Link
                  to={`/producto/${producto.id}`}
                  className="flex size-14 shrink-0 items-center justify-center border border-rule bg-paper-2 text-ink-4 transition-colors hover:border-ink-3"
                >
                  <InstrumentIcon categoria={producto.categoria} className="size-8" />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="label-tech text-ink-4">{producto.marca}</p>
                  <p className="mt-0.5 text-[14px] leading-snug font-semibold text-ink">
                    <Link to={`/producto/${producto.id}`} className="hover:underline hover:underline-offset-2">
                      {producto.nombre}
                    </Link>
                  </p>
                  <p className="label-mono mt-0.5 text-ink-4">{producto.sku}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex h-8 items-center rounded-xs border border-rule-2 bg-paper">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${producto.nombre}`}
                        onClick={() => cambiar(producto.id, cantidad - 1)}
                        className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono text-[13px] text-ink">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${producto.nombre}`}
                        onClick={() => cambiar(producto.id, cantidad + 1)}
                        className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
                      >
                        +
                      </button>
                    </span>

                    <span className="label-mono text-ink-4">
                      {new Intl.NumberFormat('es-GT', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(producto.precio)}{' '}
                      Q c/u
                    </span>

                    <IconButton
                      etiqueta={`Quitar ${producto.nombre} del carrito`}
                      onClick={() => {
                        quitar(producto.id)
                        avisar(`${producto.nombre} quitado del carrito.`)
                      }}
                      className="hover:text-oxblood"
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </div>

                  {excede ? (
                    <p className="mt-2 text-[11.5px] text-oxblood">
                      Sólo quedan {disponible} disponibles. Te ajustamos la
                      cantidad al confirmar.
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <Money valor={producto.precio * cantidad} size="md" />
                </div>
              </li>
            )
          })}
        </ul>

        {/* Totales */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-ink bg-paper-2">
            <div className="border-b border-ink px-4 py-3">
              <p className="label-tech text-ink">Resumen</p>
            </div>

            <dl className="flex flex-col gap-2 px-4 py-4">
              <div className="flex items-center justify-between">
                <dt className="text-[13px] text-ink-3">Subtotal</dt>
                <dd>
                  <Money valor={subtotal} size="sm" />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[13px] text-ink-3">Envío</dt>
                <dd>
                  {envio === 0 ? (
                    <span className="label-mono text-pine">Sin costo</span>
                  ) : (
                    <Money valor={envio} size="sm" />
                  )}
                </dd>
              </div>
            </dl>

            <div className="flex items-end justify-between border-t border-rule px-4 py-3">
              <span className="label-tech text-ink">Total</span>
              <Money valor={total} size="lg" />
            </div>

            <div className="border-t border-rule px-4 py-3">
              <label htmlFor="plan" className="label-tech text-ink-3">
                ¿Cómo querés pagar?
              </label>
              <Select
                id="plan"
                value={String(meses)}
                onChange={(e) => setMeses(Number(e.target.value))}
                className="mt-2"
              >
                {config.mesesCredito.map((m) => (
                  <option key={m} value={m}>
                    {m === 0
                      ? 'Contado'
                      : `${m} cuotas de ${new Intl.NumberFormat('es-GT', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(total / m)} Q`}
                  </option>
                ))}
              </Select>
              {meses > 0 ? (
                <p className="label-mono mt-2 text-ink-4">
                  Total con interés{' '}
                  {new Intl.NumberFormat('es-GT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(total * (1 + (config.interesPct / 100) * (meses / 12)))}{' '}
                  Q al {config.interesPct}%
                </p>
              ) : null}
            </div>

            <div className="border-t border-rule px-4 py-3">
              <a
                href={enlaceWhatsappTienda(config, mensaje())}
                target="_blank"
                rel="noopener noreferrer"
                className="label-tech inline-flex h-10 w-full items-center justify-center gap-2 rounded-xs bg-oxblood px-4 text-paper transition-colors hover:bg-oxblood-hi"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                Confirmar por WhatsApp
              </a>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-4">
                Te enviamos el resumen del pedido con los precios y el plan de
                pago. Confirmamos disponibilidad y acordamos la entrega.
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-rule pt-3">
                <Badge tono="muted">Envío gratis desde Q1,500</Badge>
                <button
                  type="button"
                  onClick={() => {
                    vaciar()
                    avisar('Carrito vacío.')
                  }}
                  className="label-tech text-ink-4 transition-colors hover:text-oxblood"
                >
                  Vaciar
                </button>
              </div>
            </div>
          </div>

          <Link
            to="/catalogo"
            className="label-tech mt-4 inline-flex items-center gap-1.5 text-ink-3 transition-colors hover:text-oxblood"
          >
            ← Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}
