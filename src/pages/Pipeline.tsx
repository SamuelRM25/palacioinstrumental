import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  FileDown,
  MessageCircle,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge, EtapaBadge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { SearchInput, Select } from '../components/ui/Field'
import { Drawer } from '../components/ui/Modal'
import { useCrm } from '../store/crmStore'
import { ETAPA_INFO, VENDEDORES } from '../data/config'
import type { Cotizacion, Etapa } from '../types'
import { diasDesde, fecha, tiempoRelativo } from '../lib/format'
import { enlaceWhatsapp, mensajeCotizacion } from '../lib/whatsapp'
import { useToast } from '../components/ui/toastContext'

const ORDEN: Etapa[] = ['nuevo', 'enviada', 'negociando', 'aprobada', 'cerrada', 'perdida']

const COLOR_COLUMNA: Record<Etapa, string> = {
  nuevo: 'border-l-ink-4',
  enviada: 'border-l-brass',
  negociando: 'border-l-amber',
  aprobada: 'border-l-pine',
 cerrada: 'border-l-oxblood',
  perdida: 'border-l-rule-2',
}

function MenuEtapa({
  actual,
  onMover,
}: {
  actual: Etapa
  onMover: (e: Etapa) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Cambiar etapa"
        onClick={(e) => {
          e.stopPropagation()
          setAbierto((v) => !v)
        }}
        className="label-tech inline-flex items-center gap-1 rounded-xs border border-rule-2 px-1.5 py-0.5 text-ink-3 transition-colors hover:border-ink hover:text-ink"
      >
        Mover
        <ChevronDown className="size-3" aria-hidden />
      </button>
      {abierto ? (
        <div
          role="menu"
          className="absolute right-0 bottom-full z-20 mb-1 w-40 border border-rule bg-paper py-1 shadow-[0_10px_24px_-16px_rgba(23,19,15,0.6)]"
        >
          {ORDEN.map((e) => (
            <button
              key={e}
              role="menuitem"
              type="button"
              disabled={e === actual}
              onClick={(ev) => {
                ev.stopPropagation()
                onMover(e)
                setAbierto(false)
              }}
              className="label-tech block w-full px-3 py-1.5 text-left text-ink-3 transition-colors hover:bg-paper-3 hover:text-ink disabled:text-ink-4 disabled:opacity-60"
            >
              {ETAPA_INFO[e].nombre}
              {e === actual ? ' ·' : ''}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function Pipeline() {
  const navegar = useNavigate()
  const [params, setParams] = useSearchParams()
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const clientes = useCrm((s) => s.clientes)
  const productos = useCrm((s) => s.productos)
  const config = useCrm((s) => s.config)
  const moverEtapa = useCrm((s) => s.moverEtapa)
  const avisar = useToast().avisar

  const [busqueda, setBusqueda] = useState('')
  const [vendedor, setVendedor] = useState('todos')
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [destino, setDestino] = useState<Etapa | null>(null)

  const seleccionadaId = params.get('cotizacion')
  const seleccionada = cotizaciones.find((c) => c.id === seleccionadaId) ?? null

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return cotizaciones.filter((c) => {
      if (vendedor !== 'todos' && c.vendedor !== vendedor) return false
      if (!q) return true
      const cli = clientes.find((x) => x.id === c.clienteId)
      return (
        c.folio.toLowerCase().includes(q) ||
        (cli?.nombre.toLowerCase().includes(q) ?? false) ||
        c.notas.toLowerCase().includes(q)
      )
    })
  }, [cotizaciones, busqueda, vendedor, clientes])

  const porEtapa = useMemo(() => {
    const mapa: Record<Etapa, Cotizacion[]> = {
      nuevo: [],
      enviada: [],
      negociando: [],
      aprobada: [],
      cerrada: [],
      perdida: [],
    }
    for (const c of filtradas) mapa[c.etapa].push(c)
    return mapa
  }, [filtradas])

  const cerrarDetalle = () => {
    const p = new URLSearchParams(params)
    p.delete('cotizacion')
    setParams(p, { replace: true })
  }

  const mover = (id: string, etapa: Etapa) => {
    moverEtapa(id, etapa)
    avisar(`Cotización movida a “${ETAPA_INFO[etapa].nombre}”.`)
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          etiqueta="Buscar por folio, cliente o nota"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-56 flex-1 sm:max-w-xs"
        />
        <div className="w-44">
          <Select
            aria-label="Filtrar por vendedor"
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
          >
            <option value="todos">Todos los vendedores</option>
            {VENDEDORES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="label-mono text-ink-4">
            {filtradas.length} de {cotizaciones.length}
          </span>
          <Button variante="primary" onClick={() => navegar('/crm/cotizador')}>
            Nueva cotización
          </Button>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          {ORDEN.map((etapa) => {
            const items = porEtapa[etapa]
            const total = items.reduce((a, c) => a + c.total, 0)
            const esDestino = destino === etapa
            return (
              <section
                key={etapa}
                aria-label={ETAPA_INFO[etapa].nombre}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (destino !== etapa) setDestino(etapa)
                }}
                onDragLeave={() => setDestino(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  const id = e.dataTransfer.getData('text/plain')
                  if (id) mover(id, etapa)
                  setDestino(null)
                  setArrastrando(null)
                }}
                className={`flex w-64 flex-col border border-rule border-l-2 bg-paper-2 ${
                  COLOR_COLUMNA[etapa]
                } ${esDestino ? 'ring-2 ring-oxblood/40' : ''}`}
              >
                <header className="border-b border-rule px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="label-tech text-ink">{ETAPA_INFO[etapa].nombre}</h2>
                    <Badge tono={items.length ? 'ink' : 'muted'}>{items.length}</Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-[10.5px] text-ink-4">
                    Q{' '}
                    {new Intl.NumberFormat('es-GT', {
                      maximumFractionDigits: 0,
                    }).format(total)}
                  </p>
                </header>

                <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
                  {items.length === 0 ? (
                    <p className="px-1 py-6 text-center text-[11.5px] text-ink-4">
                      Arrastra una cotización aquí
                    </p>
                  ) : (
                    items.map((cot) => {
                      const cli = clientes.find((x) => x.id === cot.clienteId)
                      const dias = diasDesde(cot.creadaEn)
                      const producto = productos.find(
                        (p) => p.id === cot.lineas[0]?.productoId,
                      )
                      return (
                        <article
                          key={cot.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', cot.id)
                            e.dataTransfer.effectAllowed = 'move'
                            setArrastrando(cot.id)
                          }}
                          onDragEnd={() => {
                            setArrastrando(null)
                            setDestino(null)
                          }}
                          onClick={() => {
                            const p = new URLSearchParams(params)
                            p.set('cotizacion', cot.id)
                            setParams(p)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const p = new URLSearchParams(params)
                              p.set('cotizacion', cot.id)
                              setParams(p)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${cot.folio}, ${cli?.nombre ?? 'sin cliente'}`}
                          className={`cursor-pointer border border-rule bg-paper px-2.5 py-2 transition-colors hover:border-ink-3 focus-visible:border-ink ${
                            arrastrando === cot.id ? 'opacity-40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="label-mono text-ink-4">{cot.folio}</span>
                            <EtapaBadge etapa={cot.etapa} />
                          </div>
                          <p className="mt-1 truncate text-[13px] font-medium text-ink">
                            {cli?.nombre ?? 'Cliente eliminado'}
                          </p>
                          {producto ? (
                            <p className="truncate text-[11.5px] text-ink-3">
                              {producto.nombre}
                            </p>
                          ) : null}
                          <div className="mt-2 flex items-end justify-between gap-2">
                            <div>
                              <Money valor={cot.total} size="sm" />
                              <p
                                className={`label-mono mt-0.5 ${
                                  dias >= 5 &&
                                  cot.etapa !== 'cerrada' &&
                                  cot.etapa !== 'perdida'
                                    ? 'text-oxblood'
                                    : 'text-ink-4'
                                }`}
                              >
                                {cot.etapa === 'cerrada'
                                  ? tiempoRelativo(cot.cerradaEn ?? cot.creadaEn)
                                  : `${dias} d sin mover`}
                              </p>
                            </div>
                            <MenuEtapa
                              actual={cot.etapa}
                              onMover={(e) => mover(cot.id, e)}
                            />
                          </div>
                        </article>
                      )
                    })
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-ink-4">
        Arrastra una tarjeta para cambiar su etapa. Con teclado, usa el botón “Mover”
        de cada tarjeta.
      </p>

      <Drawer
        abierto={!!seleccionada}
        onCerrar={cerrarDetalle}
        titulo={seleccionada?.folio ?? ''}
        pie={
          <>
            <Button variante="ghost" onClick={cerrarDetalle}>
              Cerrar
            </Button>
            <Button
              variante="secondary"
              onClick={async () => {
                if (!seleccionada) return
                const cli = clientes.find((c) => c.id === seleccionada.clienteId)
                if (!cli) return
                const { generarPDFCotizacion } = await import('../lib/pdf')
                await generarPDFCotizacion(seleccionada, cli, config, productos)
                avisar('PDF generado.')
              }}
            >
              <FileDown className="size-3.5" aria-hidden />
              PDF
            </Button>
            <Button
              variante="primary"
              onClick={() => {
                if (!seleccionada) return
                const cli = clientes.find((c) => c.id === seleccionada.clienteId)
                if (!cli) return
                window.open(
                  enlaceWhatsapp(
                    cli.telefono,
                    mensajeCotizacion(seleccionada, cli, config, productos),
                  ),
                  '_blank',
                  'noopener,noreferrer',
                )
              }}
            >
              <MessageCircle className="size-3.5" aria-hidden />
              Enviar por WhatsApp
            </Button>
          </>
        }
      >
        {seleccionada ? <DetalleCotizacion cot={seleccionada} /> : null}
      </Drawer>
    </>
  )
}

function DetalleCotizacion({ cot }: { cot: Cotizacion }) {
  const clientes = useCrm((s) => s.clientes)
  const productos = useCrm((s) => s.productos)
  const moverEtapa = useCrm((s) => s.moverEtapa)
  const avisar = useToast().avisar
  const cli = clientes.find((c) => c.id === cot.clienteId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <EtapaBadge etapa={cot.etapa} />
        <Badge tono="muted">
          {VENDEDORES.find((v) => v.id === cot.vendedor)?.nombre ?? cot.vendedor}
        </Badge>
        <Badge tono="muted">{fecha(cot.creadaEn)}</Badge>
      </div>

      <div>
        <p className="label-tech text-ink-4">Cliente</p>
        <p className="mt-1 text-[15px] font-semibold text-ink">
          {cli?.nombre ?? 'Cliente eliminado'}
        </p>
        {cli ? (
          <p className="label-mono text-ink-3">
            {cli.telefono} · {cli.ciudad}
          </p>
        ) : null}
      </div>

      <div className="border border-rule bg-paper-2">
        <ul>
          {cot.lineas.map((l) => {
            const p = productos.find((x) => x.id === l.productoId)
            return (
              <li
                key={l.productoId}
                className="flex items-start justify-between gap-3 border-b border-rule/70 px-3 py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-ink">
                    {p?.nombre ?? 'Producto retirado'}
                  </p>
                  <p className="label-mono text-ink-4">
                    {p?.sku} · {l.cantidad} u.
                    {l.descuentoPct > 0 ? ` · −${l.descuentoPct}%` : ''}
                  </p>
                </div>
                <Money
                  valor={l.precioUnitario * l.cantidad}
                  size="sm"
                  className="shrink-0"
                />
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-rule bg-paper-3/50 px-3 py-2">
          <span className="label-tech text-ink-3">Total</span>
          <Money valor={cot.total} size="lg" />
        </div>
      </div>

      <div>
        <p className="label-tech text-ink-4">Plan de pago</p>
        <p className="mt-1 text-[13px] text-ink">
          {cot.plan.meses === 0
            ? 'Contado'
            : `${cot.plan.meses} cuotas de ${new Intl.NumberFormat('es-GT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cot.total / cot.plan.meses)} Q`}
        </p>
      </div>

      {cot.notas ? (
        <div>
          <p className="label-tech text-ink-4">Notas</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{cot.notas}</p>
        </div>
      ) : null}

      <div>
        <p className="label-tech mb-1.5 text-ink-4">Mover a</p>
        <div className="flex flex-wrap gap-1.5">
          {ORDEN.map((e) => (
            <Button
              key={e}
              tamano="sm"
              variante={e === cot.etapa ? 'primary' : 'secondary'}
              onClick={() => {
                moverEtapa(cot.id, e)
                avisar(`Cotización movida a “${ETAPA_INFO[e].nombre}”.`)
              }}
            >
              {ETAPA_INFO[e].nombre}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
