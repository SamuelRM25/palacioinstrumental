import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { useCart } from '../../store/cartStore'
import { CATEGORIAS } from '../../data/config'
import {
  marcas,
  precioDesde,
  deFamilia,
  disponibles,
} from '../../lib/tienda'
import { moneda, monedaCorta } from '../../lib/format'
import { Boton, BotonEnlace, Etiqueta } from '../../components/tienda/Piezas'
import { IlustracionProducto } from '../../components/tienda/IlustracionProducto'
import { MedidorFamilias } from '../../components/tienda/MedidorFamilias'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { TiraMarcas } from '../../components/tienda/TiraMarcas'

export default function TiendaHome() {
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)
  const navegar = useNavigate()

  const destacados = useMemo(
    () => productos.filter((p) => p.destacado).slice(0, 8),
    [productos],
  )
  const novedades = useMemo(
    () => productos.filter((p) => p.nuevo).slice(0, 5),
    [productos],
  )
  const nombresMarcas = useMemo(() => marcas(productos), [productos])

  const maxCuotas = Math.max(...config.mesesCredito)

  return (
    <>
      {/* ── Portada ───────────────────────────────────────────── */}
      <section className="bg-texto text-white">
        <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <Etiqueta className="text-acento">Guatemala · desde 1978</Etiqueta>
            <h1 className="mt-5 font-sora text-[36px] leading-[1.06] font-extrabold tracking-[-0.03em] text-white sm:text-[46px] lg:text-[52px]">
              El instrumento correcto, con el precio correcto.
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/65">
              Instrumentos, audio profesional y equipo de estudio de las marcas
              que ya conocés. Cada ficha trae sus especificaciones reales, su
              disponibilidad y el precio de cada cuota antes de que preguntes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <BotonEnlace variante="acento" to="/catalogo">
                Ver catálogo
                <ArrowRight className="size-4" aria-hidden />
              </BotonEnlace>
              <a
                href={enlaceWhatsappTienda(config)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/25 px-5 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
              >
                <MessageCircle className="size-4" aria-hidden />
                Hablar con un asesor
              </a>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/12 pt-7 sm:grid-cols-4">
              {[
                `Garantía de ${config.garantiaMeses} meses`,
                'Envío a todo el país',
                `Hasta ${maxCuotas} cuotas`,
                'Asesoría técnica',
              ].map((texto) => (
                <li key={texto} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-acento" />
                  <span className="text-[13px] leading-snug text-white/70">
                    {texto}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <MedidorFamilias className="lg:pl-4" />
        </div>
      </section>

      {/* ── Marcas ───────────────────────────────────────────── */}
      <TiraMarcas marcas={nombresMarcas} />

      {/* ── Familias ─────────────────────────────────────────── */}
      <section id="familias" className="border-b border-borde bg-fondo-2">
        <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 sm:py-18">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Etiqueta>Doce familias</Etiqueta>
              <h2 className="mt-3 font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
                Empezá por lo que querés tocar
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-acento-2 hover:underline"
            >
              Ver todo el catálogo
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIAS.map((familia) => {
              const articulos = deFamilia(productos, familia.id)
              const desde = precioDesde(productos, familia.id)
              return (
                <li key={familia.id}>
                  <Link
                    to={`/catalogo?categoria=${familia.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-borde bg-white transition-colors hover:border-acento"
                  >
                    <span className="block aspect-[4/3] overflow-hidden bg-fondo-2">
                      <IlustracionProducto
                        categoria={familia.id}
                        sku={`FAMILIA-${familia.id}`}
                        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                      />
                    </span>
                    <span className="flex flex-1 flex-col p-4">
                      <span className="text-[14.5px] font-semibold text-texto group-hover:text-acento-2">
                        {familia.nombre}
                      </span>
                      <span className="mt-1 text-[12.5px] text-texto-3">
                        {articulos.length} artículos
                      </span>
                      <span className="codigo-web mt-2 text-texto-4">
                        desde {monedaCorta(desde)}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Destacados ───────────────────────────────────────── */}
      <section className="border-b border-borde bg-white">
        <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 sm:py-18">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Etiqueta>Selección del taller</Etiqueta>
              <h2 className="mt-3 font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
                Lo que más sale por aquí
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-acento-2 hover:underline"
            >
              Ver las {productos.length} referencias
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {destacados.map((producto) => (
              <li key={producto.id}>
                <TarjetaProducto producto={producto} onAgregar={(p) => agregar(p.id)} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Novedades ────────────────────────────────────────── */}
      {novedades.length ? (
        <section className="border-b border-borde bg-fondo-2">
          <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Etiqueta>Recién llegados</Etiqueta>
                <h2 className="mt-3 font-sora text-[26px] leading-tight font-extrabold tracking-tight sm:text-[30px]">
                  Novedades del catálogo
                </h2>
              </div>
              <Link
                to="/catalogo?orden=nuevos"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-acento-2 hover:underline"
              >
                Ver todas
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {novedades.map((producto) => (
                <li key={producto.id}>
                  <TarjetaProducto producto={producto} onAgregar={(p) => agregar(p.id)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ── Sin letra pequeña ────────────────────────────────── */}
      <section id="transparencia" className="border-b border-borde bg-white">
        <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 sm:py-18">
          <Etiqueta>Sin letra pequeña</Etiqueta>
          <h2 className="mt-3 max-w-2xl font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
            Esto es lo que aplica en cada compra
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-texto-3">
            Preferimos que decidas con todos los números a la vista, antes de
            que llegues a la caja.
          </p>

          <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icono: CreditCard,
                titulo: 'Precio en cuotas',
                texto: `Hasta ${maxCuotas} meses al ${config.interesPct}% de interés. Sin cuota de manejo ni comisiones escondidas.`,
              },
              {
                icono: ShieldCheck,
                titulo: 'Garantía',
                texto: `${config.garantiaMeses} meses sobre defectos de fábrica en todo artículo de marca, en el local o con el técnico de la tienda.`,
              },
              {
                icono: Truck,
                titulo: 'Envío',
                texto: `Gratis en la capital desde ${monedaCorta(config.envioGratisDesde)}. Al resto del país ${monedaCorta(config.envioNacional)}.`,
              },
              {
                icono: BadgeCheck,
                titulo: 'Formas de pago',
                texto: 'Efectivo, tarjetas de crédito y débito, transferencias y apartados con seña. Factura o recibo según lo que necesitás.',
              },
            ].map(({ icono: Icono, titulo, texto }) => (
              <li key={titulo} className="border-t-2 border-texto pt-5">
                <Icono className="size-6 text-acento-2" aria-hidden />
                <h3 className="mt-4 text-[16px]">{titulo}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-texto-3">
                  {texto}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Cómo comprar ─────────────────────────────────────── */}
      <section id="como-comprar" className="border-b border-borde bg-fondo-2">
        <div className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6 sm:py-18">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <Etiqueta>Cómo comprar</Etiqueta>
              <h2 className="mt-3 font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
                Tres pasos y ya tenés tu instrumento
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-texto-3">
                Podés comprar en línea o pasar por el local en Zona 1. En los dos
                casos, el asesor que te responde conoce el stock real.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Boton variante="acento" onClick={() => navegar('/catalogo')}>
                  Ver catálogo
                  <ArrowRight className="size-4" aria-hidden />
                </Boton>
                <a
                  href={enlaceWhatsappTienda(config)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-borde-2 bg-white px-5 text-[13px] font-semibold text-texto transition-colors hover:border-texto"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Consultar por WhatsApp
                </a>
              </div>
            </div>

            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  n: '01',
                  titulo: 'Elegís y agregás',
                  texto: 'Explorás el catálogo con sus especificaciones y lo dejás en el carrito con el plan de pago que preferís.',
                },
                {
                  n: '02',
                  titulo: 'Confirmamos',
                  texto: 'Te enviamos el resumen por WhatsApp con precios, cuotas y envío resueltos. Vos confirmás disponibilidad.',
                },
                {
                  n: '03',
                  titulo: 'Entregamos',
                  texto: 'Pasás por el local en Zona 1 o lo enviamos a todo el país. Factura o recibo, como lo necesités.',
                },
              ].map((paso) => (
                <li
                  key={paso.n}
                  className="flex flex-col rounded-xl border border-borde bg-white p-5"
                >
                  <span className="codigo-web text-acento-2">{paso.n}</span>
                  <h3 className="mt-3 text-[16px]">{paso.titulo}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-texto-3">
                    {paso.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Cierre ───────────────────────────────────────────── */}
      <section className="bg-texto text-white">
        <div className="mx-auto max-w-[1360px] px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16">
            <div>
              <h2 className="font-sora text-[30px] leading-tight font-extrabold tracking-tight text-white sm:text-[40px]">
                ¿No sabés cuál necesitás?
              </h2>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-white/65">
                Contale qué tocás, dónde tocás y cuánto querés invertir. Un
                asesor te responde con dos o tres opciones concretas y sus
                diferencias — no con un catálogo entero.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={enlaceWhatsappTienda(config)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-acento px-6 text-[13.5px] font-bold text-texto transition-colors hover:bg-acento-2 hover:text-white"
                >
                  <MessageCircle className="size-4.5" aria-hidden />
                  Escribir por WhatsApp
                </a>
                <a
                  href={`tel:${config.telefono}`}
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 px-6 text-[13.5px] font-semibold text-white transition-colors hover:border-white"
                >
                  {config.telefono}
                </a>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  icono: Package,
                  titulo: `${productos.length} referencias en catálogo`,
                  texto: 'Con existencias reales, actualizadas a diario.',
                },
                {
                  icono: ShieldCheck,
                  titulo: 'Asesoría antes que la venta',
                  texto: 'Si no es lo que necesitás, te decimos cuál es.',
                },
                {
                  icono: BadgeCheck,
                  titulo: 'Repuestos y servicio técnico',
                  texto: 'Contamos con taller propio para tu equipo.',
                },
              ].map(({ icono: Icono, titulo, texto }) => (
                <li
                  key={titulo}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <Icono className="size-5 shrink-0 text-acento" aria-hidden />
                  <div>
                    <p className="text-[14px] font-semibold text-white">{titulo}</p>
                    <p className="mt-1 text-[13px] text-white/55">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-12 text-[12.5px] text-white/35">
            Precios en quetzales con IVA incluido ·{' '}
            {productos.reduce((total, p) => total + disponibles(p), 0)} artículos con
            existencias · Envío gratis desde {moneda(config.envioGratisDesde)}
          </p>
        </div>
      </section>
    </>
  )
}
