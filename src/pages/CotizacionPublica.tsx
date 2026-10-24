import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MessageCircle, Printer } from 'lucide-react'
import { useCrm } from '../store/crmStore'
import { fecha, moneda } from '../lib/format'
import { enlaceWhatsapp } from '../lib/whatsapp'
import { Logo } from '../components/brand/Logo'

export default function CotizacionPublica() {
  const { id } = useParams()
  const cotizacion = useCrm((s) => s.cotizaciones.find((c) => c.id === id))
  const cliente = useCrm((s) =>
    s.clientes.find((c) => c.id === cotizacion?.clienteId),
  )
  const productos = useCrm((s) => s.productos)
  const config = useCrm((s) => s.config)

  useEffect(() => {
    document.title = `Cotización ${cotizacion?.folio ?? ''} · ${config.nombre}`
  }, [cotizacion?.folio, config.nombre])

  if (!cotizacion || !cliente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="max-w-sm text-center">
          <Logo variante="escudo" alto={56} className="mx-auto" />
          <h1 className="mt-5 font-display text-[22px] font-semibold text-ink">
            No encontramos esa cotización
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
            Puede que el enlace haya caducado o que la cotización se haya
            eliminado. Escríbenos y te la enviamos de nuevo.
          </p>
          <a
            href={enlaceWhatsapp(
              config.whatsapp,
              `Hola ${config.nombre}, no puedo abrir una cotización. ¿Me la pueden reenviar?`,
            )}
            className="label-tech mt-5 inline-flex items-center gap-2 rounded-xs bg-oxblood px-4 py-2.5 text-paper transition-colors hover:bg-oxblood-hi"
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Escribir a la tienda
          </a>
        </div>
      </div>
    )
  }

  const planTexto =
    cotizacion.plan.meses === 0
      ? 'Pago contra entrega'
      : `${cotizacion.plan.meses} cuotas de ${moneda(
          cotizacion.total / cotizacion.plan.meses,
        )}`

  return (
    <div className="min-h-screen bg-paper py-6 print:py-0">
      {/* Barra de acciones (no se imprime) */}
      <div className="mx-auto mb-5 flex max-w-[52rem] items-center justify-between gap-3 px-5 print:hidden">
        <p className="label-mono text-ink-4">
          Vista que ve el cliente · {cotizacion.folio}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="label-tech inline-flex h-8 items-center gap-1.5 rounded-xs border border-rule-2 bg-paper px-3 text-ink transition-colors hover:border-ink"
          >
            <Printer className="size-3.5" aria-hidden />
            Imprimir
          </button>
          <a
            href={enlaceWhatsapp(
              config.whatsapp,
              `Hola ${config.nombre}, me interesa la cotización ${cotizacion.folio}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="label-tech inline-flex h-8 items-center gap-1.5 rounded-xs bg-oxblood px-3 text-paper transition-colors hover:bg-oxblood-hi"
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Consultar
          </a>
        </div>
      </div>

      <article className="mx-auto max-w-[52rem] border border-rule bg-paper-2 px-6 py-8 print:max-w-none print:border-0 print:bg-white sm:px-12 sm:py-12">
        {/* Encabezado */}
        <header className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt={`${config.nombre}`}
            className="h-16 w-16 object-contain"
          />
          <h1 className="mt-4 font-display text-[26px] leading-none font-semibold tracking-tight text-ink">
            {config.nombre}
          </h1>
          <p className="label-tech mt-2 text-ink-4">{config.lema}</p>

          <div className="mt-6 flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-rule" />
            <span aria-hidden className="size-1.5 rounded-full bg-brass" />
            <span className="h-px flex-1 bg-rule" />
          </div>

          <p className="label-tech mt-5 text-oxblood">Cotización</p>
          <p className="label-mono mt-1 text-ink-3">
            {cotizacion.folio} · {fecha(cotizacion.creadaEn)}
          </p>
        </header>

        {/* Cliente */}
        <section className="mt-9 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label-tech text-ink-4">Preparada para</p>
            <p className="mt-1.5 font-display text-[19px] leading-tight font-semibold text-ink">
              {cliente.nombre}
            </p>
            <p className="label-mono mt-1 text-ink-3">{cliente.telefono}</p>
          </div>
          <div className="sm:text-right">
            <p className="label-tech text-ink-4">Válida por</p>
            <p className="mt-1.5 text-[15px] text-ink">15 días</p>
            <p className="label-mono mt-1 text-ink-3">
              Precio y disponibilidad sujetos a confirmación
            </p>
          </div>
        </section>

        {/* Artículos */}
        <section className="mt-8">
          <ul className="border-t border-rule">
            {cotizacion.lineas.map((l) => {
              const p = productos.find((x) => x.id === l.productoId)
              const totalLinea =
                l.precioUnitario * l.cantidad * (1 - l.descuentoPct / 100)
              return (
                <li
                  key={l.productoId}
                  className="border-b border-rule py-3.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[14px] leading-snug font-medium text-ink">
                        {p?.nombre ?? 'Instrumento'}
                      </p>
                      <p className="label-mono mt-0.5 text-ink-4">
                        {p?.sku}
                        {p ? ` · ${p.marca}` : ''}
                        {l.descuentoPct > 0 ? ` · −${l.descuentoPct}%` : ''}
                      </p>
                      {p && p.specs.length > 0 ? (
                        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                          {p.specs.slice(0, 4).map((s) => (
                            <li key={s.etiqueta} className="label-mono text-ink-4">
                              {s.etiqueta}: {s.valor}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[13px] tabular-nums text-ink">
                        {l.cantidad} × {moneda(l.precioUnitario)}
                      </p>
                      <p className="mt-0.5 font-mono text-[14px] font-medium tabular-nums text-ink">
                        {moneda(totalLinea)}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Totales */}
        <section className="mt-7 flex justify-end">
          <dl className="w-full max-w-xs">
            <div className="flex items-center justify-between py-1">
              <dt className="text-[13px] text-ink-3">Subtotal</dt>
              <dd className="font-mono text-[13px] tabular-nums text-ink">
                {moneda(cotizacion.subtotal)}
              </dd>
            </div>
            {cotizacion.descuento > 0 ? (
              <div className="flex items-center justify-between py-1">
                <dt className="text-[13px] text-ink-3">Descuento</dt>
                <dd className="font-mono text-[13px] tabular-nums text-oxblood">
                  − {moneda(cotizacion.descuento)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between py-1">
              <dt className="text-[13px] text-ink-3">Envío</dt>
              <dd className="font-mono text-[13px] tabular-nums text-ink">
                {cotizacion.envio === 0 ? 'Sin costo' : moneda(cotizacion.envio)}
              </dd>
            </div>
            <div className="mt-2 flex items-end justify-between border-t border-ink pt-2.5">
              <dt className="label-tech text-ink">Total</dt>
              <dd className="font-display text-[26px] leading-none font-semibold tracking-tight text-ink">
                {moneda(cotizacion.total)}
              </dd>
            </div>
            {config.ivaPct > 0 ? (
              <p className="label-mono mt-2 text-right text-ink-4">
                IVA de {config.ivaPct}% incluido
              </p>
            ) : null}
          </dl>
        </section>

        {/* Plan de pago */}
        <section className="mt-7">
          <div className="border border-brass/45 bg-brass-soft px-4 py-3.5">
            <p className="label-tech text-brass-ink">Plan de pago</p>
            <p className="mt-1 font-display text-[18px] leading-tight font-semibold text-ink">
              {planTexto}
            </p>
            {cotizacion.plan.meses > 0 ? (
              <p className="mt-1 text-[12px] text-brass-ink/85">
                Tasa de interés de {cotizacion.plan.interesPct}% sobre el saldo
                financiable.
              </p>
            ) : null}
          </div>
        </section>

        {/* Condiciones */}
        <section className="mt-7">
          <p className="label-tech text-ink-4">Condiciones</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {[
              `Garantía de ${config.garantiaMeses} meses sobre defectos de fábrica.`,
              cotizacion.envio === 0
                ? 'Envío sin costo dentro de la ciudad Capital.'
                : `Envío nacional: ${moneda(config.envioNacional)}. Sin costo en compras mayores a ${moneda(config.envioGratisDesde)}.`,
              'Precios en quetzales, con IVA incluido.',
              'Recibimos efectivo, tarjetas y transferencias. También aceptamos apartados con seña.',
            ].map((c) => (
              <li key={c} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-2">
                <span aria-hidden className="text-brass">
                  ·
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pie de contacto */}
        <footer className="mt-9 border-t border-rule pt-6 text-center">
          <p className="font-display text-[17px] font-semibold text-ink">
            {config.nombre}
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-3">{config.direccion}</p>
          <p className="label-mono mt-1 text-ink-3">
            {config.telefono} · {config.email}
          </p>
          <p className="label-mono mt-1 text-ink-4">{config.horarios}</p>

          <a
            href={enlaceWhatsapp(
              config.whatsapp,
              `Hola ${config.nombre}, tengo una duda sobre la cotización ${cotizacion.folio}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="label-tech mt-4 inline-flex items-center gap-2 rounded-xs bg-oxblood px-4 py-2.5 text-paper transition-colors hover:bg-oxblood-hi print:hidden"
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Consultar por WhatsApp
          </a>
        </footer>
      </article>

      <p className="mx-auto mt-5 max-w-[52rem] px-5 text-center text-[11px] text-ink-4 print:hidden">
        Documento generado con fines de demostración. No constituye una factura
        fiscal.
      </p>
    </div>
  )
}
