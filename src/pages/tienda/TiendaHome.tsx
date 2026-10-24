import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Money } from '../../components/ui/Money'
import { Badge } from '../../components/ui/Badge'
import { Fretboard } from '../../components/brand/Fretboard'
import { InstrumentIcon } from '../../components/brand/InstrumentIcon'
import { FichaProducto } from '../../components/tienda/FichaProducto'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { useToast } from '../../components/ui/toastContext'
import { CATEGORIAS } from '../../data/config'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { monedaCorta } from '../../lib/format'
import type { CategoriaId } from '../../types'

export default function TiendaHome() {
  const navegar = useNavigate()
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)
  const avisar = useToast().avisar
  const [familia, setFamilia] = useState<CategoriaId>('guitarras')

  const destacados = useMemo(
    () => productos.filter((p) => p.destacado).slice(0, 8),
    [productos],
  )

  const listaPrecios = useMemo(
    () => [...productos].sort((a, b) => b.precio - a.precio).slice(0, 6),
    [productos],
  )

  const porFamilia = useMemo(() => {
    return CATEGORIAS.map((c) => {
      const items = productos.filter((p) => p.categoria === c.id)
      const precios = items.map((p) => p.precio)
      return {
        ...c,
        cantidad: items.length,
        desde: precios.length ? Math.min(...precios) : 0,
      }
    })
  }, [productos])

  const familiaActual = porFamilia.find((f) => f.id === familia)

  return (
    <>
      {/* ── Portada ─────────────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-8 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="flex flex-col justify-center">
            <p className="label-tech text-oxblood">Guatemala · desde 1978</p>
            <h1 className="mt-4 font-display text-[38px] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[48px]">
              El instrumento correcto, con el precio correcto.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2">
              Instrumentos, audio profesional y equipo de estudio de las marcas
              que ya conocés. Con asesoría técnica honesta, garantía de{' '}
              {config.garantiaMeses} meses y pago en cuotas.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variante="primary" onClick={() => navegar('/catalogo')}>
                Ver catálogo
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
              <a
                href={enlaceWhatsappTienda(
                  config,
                  'Hola, me gustaría asesoría para elegir un instrumento.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="label-tech inline-flex h-9 items-center gap-2 rounded-xs border border-rule-2 px-3.5 text-ink transition-colors hover:border-ink"
              >
                <MessageCircle className="size-3.5" aria-hidden />
                Hablar con un asesor
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-5">
              {[
                `Garantía de ${config.garantiaMeses} meses`,
                'Envío a todo el país',
                `Hasta ${Math.max(...config.mesesCredito)} MSI`,
                'Asesoría técnica',
              ].map((t) => (
                <li key={t} className="label-mono flex items-center gap-2 text-ink-3">
                  <span aria-hidden className="size-1.5 rounded-full bg-brass" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* La lista de precios como póster: el catálogo real, sin fotos falsas */}
          <div className="self-center">
            <div className="border border-ink bg-paper-2">
              <div className="flex items-baseline justify-between border-b border-ink px-4 py-2.5">
                <p className="label-tech text-ink">Inventario seleccionado</p>
                <p className="label-mono text-ink-4">{productos.length} referencias</p>
              </div>
              <ul>
                {listaPrecios.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 border-b border-rule px-4 py-2.5 last:border-b-0"
                  >
                    <InstrumentIcon
                      categoria={p.categoria}
                      className="size-4 shrink-0 text-ink-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">
                        {p.nombre}
                      </span>
                      <span className="label-mono block text-ink-4">
                        {p.sku}
                      </span>
                    </span>
                    <Money valor={p.precio} size="sm" />
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-ink bg-ink px-4 py-2.5">
                <span className="label-tech text-paper-3">Precio en quetzales</span>
                <Link
                  to="/catalogo"
                  className="label-tech text-brass-hi hover:underline"
                >
                  Ver los {productos.length} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ── Familias: el diapasón como navegador ────────────────────── */}
      <section id="familias" className="border-b border-rule bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-tech text-oxblood">Doce familias</p>
              <h2 className="mt-2 font-display text-[28px] leading-tight font-semibold tracking-tight text-ink">
                Empezá por lo que querés tocar
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="label-tech inline-flex items-center gap-1 text-oxblood transition-colors hover:text-oxblood-hi"
            >
              Ver todo el catálogo
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          {/* El diapasón como navegador de familias */}
          <div className="mt-8">
            <Fretboard
              valor={familia}
              onChange={(v) => setFamilia(v as CategoriaId)}
              opciones={CATEGORIAS.map((c) => ({
                valor: c.id,
                etiqueta: c.corto,
                conteo: porFamilia.find((f) => f.id === c.id)?.cantidad ?? 0,
              }))}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {familiaActual ? (
              <>
                <div className="col-span-full flex flex-wrap items-center justify-between gap-4 border border-rule bg-paper px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <InstrumentIcon
                      categoria={familiaActual.id}
                      className="size-8 text-oxblood"
                    />
                    <div>
                      <p className="text-[15px] font-semibold text-ink">
                        {familiaActual.nombre}
                      </p>
                      <p className="label-mono text-ink-4">
                        {familiaActual.cantidad} artículos · desde{' '}
                        <Money valor={familiaActual.desde} size="sm" />
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/catalogo?categoria=${familiaActual.id}`}
                    className="label-tech inline-flex h-8 items-center gap-1.5 rounded-xs bg-oxblood px-3 text-paper transition-colors hover:bg-oxblood-hi"
                  >
                    Ver {familiaActual.cantidad} artículos
                    <ArrowRight className="size-3" aria-hidden />
                  </Link>
                </div>

                {porFamilia
                  .filter((f) => f.id !== familiaActual.id)
                  .slice(0, 6)
                  .map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFamilia(f.id)}
                      className="flex items-center gap-3 border border-rule bg-paper px-3 py-3 text-left transition-colors hover:border-ink-3"
                    >
                      <InstrumentIcon
                        categoria={f.id}
                        className="size-6 shrink-0 text-ink-4"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-ink">
                          {f.nombre}
                        </span>
                        <span className="label-mono block text-ink-4">
                          {f.cantidad} · desde <Money valor={f.desde} size="sm" />
                        </span>
                      </span>
                    </button>
                  ))}
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Destacados ──────────────────────────────────────────────── */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-tech text-oxblood">Selección del taller</p>
              <h2 className="mt-2 font-display text-[28px] leading-tight font-semibold tracking-tight text-ink">
                Lo que más sale por aquí
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="label-tech inline-flex items-center gap-1 text-oxblood transition-colors hover:text-oxblood-hi"
            >
              Ver los {productos.length} artículos
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((p) => (
              <FichaProducto
                key={p.id}
                producto={p}
                onAgregar={(prod) => {
                  agregar(prod.id)
                  avisar(`${prod.nombre} agregado al carrito.`)
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparencia ───────────────────────────────────────────── */}
      <section id="transparencia" className="border-b border-rule bg-oxblood text-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <div className="max-w-2xl">
            <p className="label-tech text-brass-hi">Sin letra pequeña</p>
            <h2 className="mt-2 font-display text-[28px] leading-tight font-semibold tracking-tight">
              Esto es lo que aplica en cada compra
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-paper-3">
              Ambas tiendas de referencia no dicen ni una de estas cosas en su
              portada. Nosotros sí: preferimos que decidas con todos los
              números a la vista.
            </p>
          </div>

          <dl className="mt-9 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                term: 'Precio en cuotas',
                desc: `Hasta ${Math.max(...config.mesesCredito)} meses al ${config.interesPct}% de interés. Sin cuota de manejo ni comisiones escondidas.`,
              },
              {
                term: 'Garantía',
                desc: `${config.garantiaMeses} meses sobre defectos de fábrica en todo artículo de marca. En el local o con el técnico de la tienda.`,
              },
              {
                term: 'Envío',
                desc: `Gratis en la capital desde ${monedaCorta(config.envioGratisDesde)}. Al resto del país ${monedaCorta(config.envioNacional)}.`,
              },
              {
                term: 'Formas de pago',
                desc: 'Efectivo, tarjetas de crédito y débito, transferencias y apartados con seña. Factura o recibo según lo que necesitás.',
              },
            ].map((b) => (
              <div key={b.term} className="border-t border-paper/25 pt-4">
                <dt className="label-tech text-brass-hi">{b.term}</dt>
                <dd className="mt-2 text-[13px] leading-relaxed text-paper-3">
                  {b.desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Cierre ──────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                t: 'Un negocio, no un catálogo',
                d: 'Somos una tienda de familia desde 1978. Lo que no toques, no te lo vendemos. Si algo no es para tu caso, te lo decimos.',
              },
              {
                t: 'Asesoría antes que la venta',
                d: 'Contamos con técnicos que tocan los instrumentos. Un amplificador que suena mal no es una oportunidad: es una devolución y una pérdida de tiempo.',
              },
              {
                t: 'Repuestos y servicio',
                d: 'Cuerdas, fundas, baterías, cables y mantenimiento. Lo que compraste hace diez años lo mantenemos hoy.',
              },
            ].map((b) => (
              <div key={b.t} className="border-t border-ink pt-4">
                <h3 className="label-tech text-ink">{b.t}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">
                  {b.d}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border border-ink bg-paper-2 px-5 py-6">
            <div>
              <p className="label-tech text-ink">¿No sabés cuál necesitás?</p>
              <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-2">
                Contale qué querés tocar y en dónde. Te respondemos con una
                recomendación honesta, aunque no termine siendo una venta.
              </p>
            </div>
            <a
              href={enlaceWhatsappTienda(
                config,
                'Hola, necesito ayuda para elegir un instrumento.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="label-tech inline-flex h-10 items-center gap-2 rounded-xs bg-oxblood px-4 text-paper transition-colors hover:bg-oxblood-hi"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              Escribir por WhatsApp
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tono="brass">{productos.length} referencias en catálogo</Badge>
            <Badge tono="muted">{CATEGORIAS.length} familias</Badge>
            <Badge tono="muted">Precios en quetzales con IVA incluido</Badge>
          </div>
        </div>
      </section>
    </>
  )
}

