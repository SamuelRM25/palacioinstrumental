import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { totalConInteres } from '../../lib/tienda'
import { moneda, monedaCorta } from '../../lib/format'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import type { Producto } from '../../types'
import { BotonEnlace, ImagenProducto } from './Piezas'
import { MedidorFamilias } from './MedidorFamilias'

/** Cada capa dura esto en pantalla antes de pasar a la siguiente. */
const DURACION_MS = 4000

function usePrefiereMenosMovimiento(): boolean {
  const consulta = '(prefers-reduced-motion: reduce)'
  const [reducir, setReducir] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(consulta).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(consulta)
    const alCambiar = () => setReducir(mq.matches)
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [])
  return reducir
}

function usePestanaVisible(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )
  useEffect(() => {
    const alCambiar = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', alCambiar)
    return () => document.removeEventListener('visibilitychange', alCambiar)
  }, [])
  return visible
}

/* ── piezas de las capas ─────────────────────────────────── */

function Antetitulo({ children }: { children: ReactNode }) {
  return <p className="label-web text-acento">{children}</p>
}

function Titular({ nivel, children }: { nivel: 1 | 2; children: ReactNode }) {
  const clase =
    'mt-4 font-sora text-[30px] leading-[1.06] font-extrabold tracking-[-0.03em] text-white sm:text-[46px] lg:text-[52px]'
  return nivel === 1 ? (
    <h1 className={clase}>{children}</h1>
  ) : (
    <h2 className={clase}>{children}</h2>
  )
}

function Bajada({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65 sm:mt-6 sm:text-[16px]">{children}</p>
  )
}

function BotonClaro({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
      className="inline-flex h-11 items-center gap-2 rounded-md border border-white/25 px-5 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
    >
      {children}
    </a>
  )
}

/** Cifra grande con su rótulo: lo primero que lee el ojo en la capa. */
function Cifra({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <p className="font-sora text-[28px] leading-none font-extrabold tracking-tight text-white sm:text-[40px]">
        {valor}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-white/60">{rotulo}</p>
    </div>
  )
}

/* ── componente ──────────────────────────────────────────── */

interface Capa {
  id: string
  nombre: string
  texto: ReactNode
  visual: ReactNode
}

export function HeroPortada() {
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)

  const reducirMovimiento = usePrefiereMenosMovimiento()
  const pestanaVisible = usePestanaVisible()

  const [indice, setIndice] = useState(0)
  // Con "menos movimiento" el carrusel arranca detenido: avanza sólo a mano.
  const [pausadoPorUsuario, setPausadoPorUsuario] = useState(reducirMovimiento)
  const [encima, setEncima] = useState(false)
  const [conFoco, setConFoco] = useState(false)

  const enMarcha = !pausadoPorUsuario && !encima && !conFoco && pestanaVisible

  /* Datos reales del catálogo para cada capa */
  const datos = useMemo(() => {
    const destacados = productos.filter((p) => p.destacado)
    const porPrecio = [...destacados].sort((a, b) => b.precio - a.precio)
    const estrella: Producto | undefined = porPrecio[0] ?? productos[0]
    // Para el ejemplo de cuotas, un artículo de precio medio: es el caso típico.
    const ejemploCuotas: Producto | undefined =
      [...destacados].sort(
        (a, b) => Math.abs(a.precio - 5000) - Math.abs(b.precio - 5000),
      )[0] ?? productos[0]
    const novedades = productos.filter((p) => p.nuevo).slice(0, 3)
    return { estrella, ejemploCuotas, novedades }
  }, [productos])

  const maxCuotas = Math.max(...config.mesesCredito)
  const whatsapp = enlaceWhatsappTienda(config)

  const capas: Capa[] = [
    {
      id: 'catalogo',
      nombre: 'Catálogo',
      texto: (
        <>
          <Antetitulo>Huehuetenango · desde 1978</Antetitulo>
          <Titular nivel={1}>El instrumento correcto, con el precio correcto.</Titular>
          <Bajada>
            Instrumentos, audio profesional y equipo de estudio de las marcas que
            ya conocés. Cada ficha trae sus especificaciones reales, su
            disponibilidad y el precio de cada cuota.
          </Bajada>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BotonEnlace variante="acento" to="/catalogo">
              Ver catálogo
              <ArrowRight className="size-4" aria-hidden />
            </BotonEnlace>
            <BotonClaro href={whatsapp}>
              <MessageCircle className="size-4" aria-hidden />
              Hablar con un asesor
            </BotonClaro>
          </div>
        </>
      ),
      visual: <MedidorFamilias />,
    },
    {
      id: 'cuotas',
      nombre: 'Cuotas',
      texto: (
        <>
          <Antetitulo>Pago en cuotas</Antetitulo>
          <Titular nivel={2}>
            Hasta {maxCuotas} cuotas. Sabés cuánto pagás antes de comprar.
          </Titular>
          <Bajada>
            {config.interesPct}% de interés anual, sin cuota de manejo ni comisiones
            escondidas. Cada ficha muestra el precio de cada cuota.
          </Bajada>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BotonEnlace variante="acento" to="/#transparencia">
              Ver condiciones
              <ArrowRight className="size-4" aria-hidden />
            </BotonEnlace>
          </div>
        </>
      ),
      visual: datos.ejemploCuotas ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <p className="label-web text-white/45">Ejemplo real del catálogo</p>
          <p className="mt-2 font-sora text-[19px] font-bold tracking-tight text-white">
            {datos.ejemploCuotas.nombre}
          </p>
          <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {config.mesesCredito.map((m) => {
              const total = totalConInteres(datos.ejemploCuotas!.precio, m, config.interesPct)
              const esMayor = m === maxCuotas
              return (
                <li
                  key={m}
                  className={`items-baseline justify-between gap-4 py-3 ${
                    m === 0 || esMayor ? 'flex' : 'hidden sm:flex'
                  }`}
                >
                  <span className="text-[14px] text-white/70">
                    {m === 0 ? 'Contado' : `${m} cuotas`}
                  </span>
                  <span
                    className={`font-sora tabular-nums ${
                      esMayor
                        ? 'text-[26px] font-extrabold text-acento'
                        : 'text-[17px] font-semibold text-white'
                    }`}
                  >
                    {m === 0 ? moneda(total) : `${moneda(total / m)}/mes`}
                  </span>
                </li>
              )
            })}
          </ul>
          <Link
            to={`/producto/${datos.ejemploCuotas.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 hover:text-white"
          >
            Ver la ficha
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      ) : null,
    },
    {
      id: 'destacado',
      nombre: 'Destacado',
      texto: datos.estrella ? (
        <>
          <Antetitulo>Lo mejor del taller · {datos.estrella.marca}</Antetitulo>
          <Titular nivel={2}>{datos.estrella.nombre}</Titular>
          <ul className="mt-5 grid max-w-xl gap-2 sm:mt-6 sm:grid-cols-2">
            {datos.estrella.specs.slice(0, 4).map((spec, n) => (
              <li
                key={spec.etiqueta}
                className={`text-[14px] text-white/65 ${n > 1 ? 'hidden sm:list-item' : ''}`}
              >
                <span className="text-white/40">{spec.etiqueta}:</span> {spec.valor}
              </li>
            ))}
          </ul>
          <p className="mt-5 font-sora text-[28px] font-extrabold tracking-tight text-white tabular-nums sm:mt-6 sm:text-[32px]">
            {moneda(datos.estrella.precio)}
            <span className="ml-3 text-[15px] font-semibold text-acento">
              o {maxCuotas} ×{' '}
              {moneda(
                totalConInteres(datos.estrella.precio, maxCuotas, config.interesPct) /
                  maxCuotas,
              )}
            </span>
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <BotonEnlace variante="acento" to={`/producto/${datos.estrella.id}`}>
              Ver la ficha completa
              <ArrowRight className="size-4" aria-hidden />
            </BotonEnlace>
          </div>
        </>
      ) : null,
      visual: datos.estrella ? (
        <div className="mx-auto aspect-[16/9] w-full max-w-lg overflow-hidden rounded-2xl sm:aspect-[4/3]">
          <ImagenProducto producto={datos.estrella} />
        </div>
      ) : null,
    },
    {
      id: 'novedades',
      nombre: 'Novedades',
      texto: (
        <>
          <Antetitulo>Recién llegados</Antetitulo>
          <Titular nivel={2}>Lo nuevo ya está en el local.</Titular>
          <Bajada>
            Llegaron {productos.filter((p) => p.nuevo).length} referencias nuevas
            este mes. Pasá a probarlas o pedí la tuya por WhatsApp.
          </Bajada>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BotonEnlace variante="acento" to="/catalogo?orden=nuevos">
              Ver novedades
              <ArrowRight className="size-4" aria-hidden />
            </BotonEnlace>
          </div>
        </>
      ),
      visual: (
        <ul className="grid grid-cols-3 gap-3">
          {datos.novedades.map((p) => (
            <li key={p.id}>
              <Link
                to={`/producto/${p.id}`}
                className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-acento"
              >
                <span className="block aspect-square overflow-hidden">
                  <ImagenProducto
                    producto={p}
                    className="transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </span>
                <span className="block p-3">
                  <span className="label-web block text-acento">{p.marca}</span>
                  <span className="mt-1 line-clamp-2 block text-[12.5px] leading-snug font-semibold text-white">
                    {p.nombre}
                  </span>
                  <span className="codigo-web mt-1.5 block text-white/60">
                    {monedaCorta(p.precio)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'visita',
      nombre: 'Visitanos',
      texto: (
        <>
          <Antetitulo>Visitanos</Antetitulo>
          <Titular nivel={2}>Te esperamos en Las Vegas, Zona 11.</Titular>
          <p className="mt-6 flex max-w-xl items-start gap-2.5 text-[16px] leading-relaxed text-white/65">
            <MapPin className="mt-1 size-4.5 shrink-0 text-acento" aria-hidden />
            {config.direccion}. {config.horarios}.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-acento px-5 text-[13px] font-semibold text-texto transition-colors hover:bg-acento-2 hover:text-white"
            >
              <MessageCircle className="size-4" aria-hidden />
              Escribir por WhatsApp
            </a>
            <BotonClaro href={`tel:${config.telefono.replace(/[^\d+]/g, '')}`}>
              <Phone className="size-4" aria-hidden />
              {config.telefono}
            </BotonClaro>
          </div>
        </>
      ),
      visual: (
        <div className="grid grid-cols-2 gap-3">
          <Cifra valor={`${config.garantiaMeses} meses`} rotulo="de garantía en todo artículo de marca" />
          <Cifra valor={monedaCorta(config.envioNacional)} rotulo="envío a cualquier departamento" />
          <div className="col-span-2 flex items-center gap-4 rounded-xl border border-acento/40 bg-acento/10 p-5">
            <Truck className="size-7 shrink-0 text-acento" aria-hidden />
            <p className="text-[14px] leading-snug text-white/80">
              <span className="font-semibold text-white">Envío gratis en Huehuetenango</span>{' '}
              en compras desde {monedaCorta(config.envioGratisDesde)}.
            </p>
          </div>
          <div className="col-span-2 hidden items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:flex">
            <ShieldCheck className="size-7 shrink-0 text-acento" aria-hidden />
            <p className="text-[14px] leading-snug text-white/80">
              Taller propio: servicio técnico y repuestos para tu equipo.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const total = capas.length
  const irA = useCallback((n: number) => setIndice(((n % total) + total) % total), [total])
  const siguiente = useCallback(() => setIndice((i) => (i + 1) % total), [total])

  // Con menos movimiento no hay barra animada: un temporizador simple
  // avanza la capa si el usuario decide ponerlo en marcha.
  useEffect(() => {
    if (!reducirMovimiento || !enMarcha) return
    const t = window.setTimeout(siguiente, DURACION_MS)
    return () => window.clearTimeout(t)
  }, [reducirMovimiento, enMarcha, indice, siguiente])

  const alTeclear = (evento: React.KeyboardEvent) => {
    if (evento.key === 'ArrowRight') {
      evento.preventDefault()
      irA(indice + 1)
    } else if (evento.key === 'ArrowLeft') {
      evento.preventDefault()
      irA(indice - 1)
    }
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Lo destacado de la tienda"
      className="relative overflow-hidden bg-texto text-white"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setConFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setConFoco(false)
      }}
    >
      {/* Resplandor de fondo que se desplaza con cada capa */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 size-[44rem] rounded-full bg-acento/10 blur-3xl transition-[left] duration-1000 ease-out"
        style={{ left: `${-20 + indice * 18}%` }}
      />

      <div className="relative mx-auto max-w-[1360px] px-4 pt-8 pb-4 sm:px-6 sm:pt-16 sm:pb-8">
        {/* Todas las capas ocupan la misma celda: el alto es el de la mayor
            y no hay saltos al cambiar. */}
        <div className="grid" aria-live={enMarcha ? 'off' : 'polite'}>
          {capas.map((capa, i) => {
            const activa = i === indice
            return (
              <div
                key={capa.id}
                role="group"
                aria-roledescription="capa"
                aria-label={`${i + 1} de ${total}: ${capa.nombre}`}
                aria-hidden={!activa}
                inert={!activa}
                className={`col-start-1 row-start-1 grid items-center gap-7 transition-all sm:gap-10 duration-700 ease-out lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 ${
                  activa
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-3 opacity-0'
                }`}
              >
                <div className="min-w-0">{capa.texto}</div>
                <div className="min-w-0 lg:pl-4">{capa.visual}</div>
              </div>
            )
          })}
        </div>

        {/* Controles */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/12 pt-3 sm:mt-10 sm:pt-5">
          <div
            role="tablist"
            aria-label="Elegir capa"
            onKeyDown={alTeclear}
            className="flex flex-1 items-center gap-2"
          >
            {capas.map((capa, i) => {
              const activa = i === indice
              return (
                <button
                  key={capa.id}
                  type="button"
                  role="tab"
                  aria-selected={activa}
                  aria-label={`${capa.nombre} (${i + 1} de ${total})`}
                  tabIndex={activa ? 0 : -1}
                  onClick={() => irA(i)}
                  className="group flex min-h-11 min-w-0 flex-1 flex-col justify-center gap-2 text-left"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                    {activa ? (
                      reducirMovimiento ? (
                        <span className="absolute inset-0 rounded-full bg-acento" />
                      ) : (
                        <span
                          key={`${indice}`}
                          onAnimationEnd={siguiente}
                          className="absolute inset-0 origin-left rounded-full bg-acento"
                          style={{
                            animation: `hero-progreso ${DURACION_MS}ms linear forwards`,
                            animationPlayState: enMarcha ? 'running' : 'paused',
                          }}
                        />
                      )
                    ) : i < indice ? (
                      <span className="absolute inset-0 rounded-full bg-white/40" />
                    ) : null}
                  </span>
                  <span
                    className={`label-web hidden truncate transition-colors sm:block ${
                      activa ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                    }`}
                  >
                    {capa.nombre}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => irA(indice - 1)}
              aria-label="Capa anterior"
              className="inline-flex size-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setPausadoPorUsuario((v) => !v)}
              aria-label={pausadoPorUsuario ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
              aria-pressed={pausadoPorUsuario}
              className="inline-flex size-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {pausadoPorUsuario ? (
                <Play className="size-4.5" aria-hidden />
              ) : (
                <Pause className="size-4.5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => irA(indice + 1)}
              aria-label="Capa siguiente"
              className="inline-flex size-11 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
