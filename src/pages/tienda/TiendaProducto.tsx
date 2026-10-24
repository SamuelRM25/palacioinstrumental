import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Money } from '../../components/ui/Money'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Select } from '../../components/ui/Field'
import { InstrumentIcon } from '../../components/brand/InstrumentIcon'
import { FichaProducto } from '../../components/tienda/FichaProducto'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { useToast } from '../../components/ui/toastContext'
import { CATEGORIAS } from '../../data/config'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { moneda } from '../../lib/format'

export default function TiendaProducto() {
  const { id } = useParams()
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)
  const avisar = useToast().avisar
  const [cantidad, setCantidad] = useState(1)
  const [meses, setMeses] = useState(0)

  const producto = productos.find((p) => p.id === id)
  const familia = producto
    ? CATEGORIAS.find((c) => c.id === producto?.categoria)
    : undefined

  const relacionados = useMemo(() => {
    if (!producto) return []
    return productos
      .filter((p) => p.categoria === producto.categoria && p.id !== producto.id)
      .slice(0, 4)
  }, [productos, producto])

  if (!producto) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <EmptyState
          titulo="Ese artículo no existe"
          descripcion="Puede que se haya agotado y retirado del catálogo."
          accion={{
            etiqueta: "Volver al catálogo",
            onClick: () => {
              window.location.href = "/catalogo"
            },
          }}
        />
      </div>
    )
  }

  const disponible = producto.stock - producto.reservado
  const agotado = disponible <= 0
  const maximo = Math.max(disponible, 1)
  const total = producto.precio * cantidad

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          to="/"
          className="label-tech text-ink-4 transition-colors hover:text-oxblood"
        >
          Inicio
        </Link>
        <span aria-hidden className="text-ink-4">/</span>
        <Link
          to={`/catalogo?categoria=${producto.categoria}`}
          className="label-tech text-ink-4 transition-colors hover:text-oxblood"
        >
          {familia?.nombre ?? "Catálogo"}
        </Link>
        <span aria-hidden className="text-ink-4">/</span>
        <span className="label-tech text-ink-2">{producto.sku}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* Columna de la referencia */}
        <div>
          <div className="flex items-start gap-5">
            <div className="flex size-24 shrink-0 items-center justify-center border border-rule bg-paper-2 text-ink-3">
              <InstrumentIcon categoria={producto.categoria} className="size-14" />
            </div>
            <div className="min-w-0">
              <p className="label-tech text-oxblood">{producto.marca}</p>
              <h1 className="mt-2 font-display text-[30px] leading-tight font-semibold tracking-tight text-ink sm:text-[36px]">
                {producto.nombre}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="label-mono text-ink-4">{producto.sku}</span>
                {agotado ? (
                  <Badge tono="oxblood">Sin existencias</Badge>
                ) : disponible <= 2 ? (
                  <Badge tono="amber">Últimas {disponible}</Badge>
                ) : (
                  <Badge tono="pine">En stock</Badge>
                )}
                {producto.nuevo ? <Badge tono="brass">Novedad</Badge> : null}
                {producto.destacado ? <Badge tono="muted">Más vendido</Badge> : null}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="label-tech border-b border-ink pb-2 text-ink">Especificaciones</h2>
            <dl className="mt-1">
              {producto.specs.map((s) => (
                <div
                  key={s.etiqueta}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule py-2.5"
                >
                  <dt className="text-[13px] text-ink-3">{s.etiqueta}</dt>
                  <dd className="label-mono text-right text-ink">{s.valor}</dd>
                </div>
              ))}
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule py-2.5">
                <dt className="text-[13px] text-ink-3">Familia</dt>
                <dd className="label-mono text-ink">{familia?.nombre}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule py-2.5">
                <dt className="text-[13px] text-ink-3">Existencias</dt>
                <dd className="label-mono text-ink">{agotado ? "Agotado" : disponible + " disponibles"}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              "Garantía de " + config.garantiaMeses + " meses sobre defectos de fábrica.",
              total >= config.envioGratisDesde
                ? "Envío sin costo dentro de la ciudad Capital."
                : "Envío nacional: " + moneda(config.envioNacional) + ". Sin costo en compras mayores a " + moneda(config.envioGratisDesde) + ".",
              "Precios en quetzales, con IVA incluido.",
              "Recibimos efectivo, tarjetas y transferencias. También aceptamos apartados con seña.",
            ].map((c) => (
              <p key={c} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-2">
                <span aria-hidden className="text-brass">·</span>
                <span>{c}</span>
              </p>
            ))}
          </section>

          <section className="mt-8">
            <h2 className="label-tech border-b border-ink pb-2 text-ink">Productos relacionados</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((p) => (
                <FichaProducto
                  key={p.id}
                  producto={p}
                  onAgregar={(prod) => {
                    agregar(prod.id)
                    avisar(prod.nombre + " agregado al carrito.")
                  }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Columna de compra */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-ink bg-paper-2">
            <div className="border-b border-ink px-4 py-3">
              <p className="label-tech text-ink-4">Precio</p>
              <div className="mt-1.5 flex items-baseline gap-2">
                <Money valor={producto.precio} size="lg" />
                <span className="label-mono text-ink-4">c/u</span>
              </div>
            </div>

            <div className="px-4 py-4">
              {agotado ? (
                <p className="text-[13px] leading-relaxed text-ink-2">
                  Este artículo está agotado. Escribinos y te avisamos apenas
                  entre.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="label-tech text-ink-3">Cantidad</span>
                    <span className="inline-flex h-8 items-center rounded-xs border border-rule-2 bg-paper px-1.5 text-center font-mono text-[12px] text-ink focus:border-ink-3 focus:outline-none">
                      <button
                        type="button"
                        aria-label="Quitar una unidad"
                        onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                        className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center font-mono text-[12px] text-ink">
                        {cantidad}
                      </span>
                      <button
                        type="button"
                        aria-label="Agregar una unidad"
                        onClick={() => setCantidad((c) => Math.min(maximo, c + 1))}
                        className="flex h-8 w-8 items-center justify-center text-ink-3 transition-colors hover:text-ink"
                      >
                        <Plus className="size-3" />
                      </button>
                    </span>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="plan" className="label-tech text-ink-3">
                      Plan de pago
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
                            : m +
                              ' cuotas de ' +
                              new Intl.NumberFormat('es-GT', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(total / m) +
                              ' Q'}
                        </option>
                      ))}
                    </Select>
                    {meses > 0 ? (
                      <p className="mt-1 text-[12px] text-brass-ink/80">
                        Total con interés{' '}
                        {new Intl.NumberFormat('es-GT', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(total * (1 + (config.interesPct / 100) * (meses / 12))) +
                          ' Q al ' +
                          config.interesPct +
                          '%'}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-rule pt-3">
                    <span className="label-tech text-ink-3">Total</span>
                    <Money valor={total} size="lg" />
                  </div>

                  <Button
                    variante="primary"
                    className="mt-4 w-full"
                    onClick={() => {
                      agregar(producto.id, cantidad)
                      avisar(
                        producto.nombre + ' × ' + cantidad + ' agregado al carrito.',
                      )
                    }}
                  >
                    <ShoppingBag className="size-3.5" aria-hidden />
                    Agregar al carrito
                  </Button>

                  <a
                    href={enlaceWhatsappTienda(
                      config,
                      'Hola, me interesa el ' +
                        producto.nombre +
                        ' (' +
                        producto.sku +
                        '). ¿Tienen disponibilidad?',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-tech mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xs border border-rule-2 text-ink transition-colors hover:border-ink"
                  >
                    <MessageCircle className="size-3.5" aria-hidden />
                    Consultar por WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
