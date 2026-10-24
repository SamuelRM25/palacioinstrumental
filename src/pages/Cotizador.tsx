import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  FileDown,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Button, IconButton } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { Field, Input, SearchInput, Select, Textarea } from '../components/ui/Field'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Fretboard } from '../components/brand/Fretboard'
import { useCrm } from '../store/crmStore'
import { CATEGORIAS, VENDEDORES } from '../data/config'
import { calcularTotales } from '../data/cotizaciones'
import type { CategoriaId, LineaCotizacion, TipoCliente } from '../types'
import { moneda } from '../lib/format'
import { enlaceWhatsapp, mensajeCotizacion } from '../lib/whatsapp'
import { useToast } from '../components/ui/toastContext'

const TIPOS: { valor: TipoCliente; etiqueta: string }[] = [
  { valor: 'consumidor', etiqueta: 'Consumidor' },
  { valor: 'banda', etiqueta: 'Banda' },
  { valor: 'estudio', etiqueta: 'Estudio' },
  { valor: 'evento', etiqueta: 'Evento' },
  { valor: 'colegio', etiqueta: 'Colegio / institución' },
]

export default function Cotizador() {
  const navegar = useNavigate()
  const avisar = useToast().avisar

  const productos = useCrm((s) => s.productos)
  const clientes = useCrm((s) => s.clientes)
  const config = useCrm((s) => s.config)
  const crearCotizacion = useCrm((s) => s.crearCotizacion)
  const crearCliente = useCrm((s) => s.crearCliente)

  const [clienteId, setClienteId] = useState('')
  const [lineas, setLineas] = useState<LineaCotizacion[]>([])
  const [meses, setMeses] = useState(0)
  const [notas, setNotas] = useState('')
  const [vendedor, setVendedor] = useState(VENDEDORES[0].id)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<CategoriaId | 'todas'>('todas')
  const [modalCliente, setModalCliente] = useState(false)
  const [cotizacionId, setCotizacionId] = useState<string | null>(null)

  const totales = useMemo(() => calcularTotales(lineas), [lineas])

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      if (categoria !== 'todas' && p.categoria !== categoria) return false
      if (!q) return true
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      )
    })
  }, [productos, busqueda, categoria])

  const conteoPorCategoria = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const p of productos) mapa.set(p.categoria, (mapa.get(p.categoria) ?? 0) + 1)
    return mapa
  }, [productos])

  const cliente = clientes.find((c) => c.id === clienteId) ?? null

  const agregar = (productoId: string) => {
    const p = productos.find((x) => x.id === productoId)
    if (!p) return
    setLineas((prev) => {
      const existente = prev.find((l) => l.productoId === productoId)
      if (existente) {
        return prev.map((l) =>
          l.productoId === productoId ? { ...l, cantidad: l.cantidad + 1 } : l,
        )
      }
      return [
        ...prev,
        { productoId, cantidad: 1, precioUnitario: p.precio, descuentoPct: 0 },
      ]
    })
    setCotizacionId(null)
  }

  const cambiarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setLineas((prev) => prev.filter((l) => l.productoId !== productoId))
      return
    }
    setLineas((prev) =>
      prev.map((l) => (l.productoId === productoId ? { ...l, cantidad } : l)),
    )
  }

  const cambiarDescuento = (productoId: string, descuentoPct: number) => {
    setLineas((prev) =>
      prev.map((l) =>
        l.productoId === productoId
          ? { ...l, descuentoPct: Math.min(100, Math.max(0, descuentoPct)) }
          : l,
      ),
    )
  }

  const quitar = (productoId: string) => {
    setLineas((prev) => prev.filter((l) => l.productoId !== productoId))
  }

  const puedeGuardar = clienteId !== '' && lineas.length > 0

  const guardar = () => {
    if (!puedeGuardar) return
    const nueva = crearCotizacion({
      clienteId,
      lineas,
      plan: { meses, interesPct: meses === 0 ? 0 : config.interesPct },
      notas,
      vendedor,
    })
    setCotizacionId(nueva.id)
    avisar(`${nueva.folio} guardada en el pipeline.`)
    return nueva
  }

  const abrirVistaCliente = () => {
    const guardada = cotizacionId
      ? useCrm.getState().cotizaciones.find((c) => c.id === cotizacionId)
      : null
    const quote = guardada ?? guardar()
    if (!quote) return
    window.open(`/cotizacion/${quote.id}`, '_blank', 'noopener,noreferrer')
  }

  const enviarWhatsapp = () => {
    if (!cliente || lineas.length === 0) return
    const preliminar = {
      id: cotizacionId ?? 'preliminar',
      folio: 'COT-PRELIMINAR',
      clienteId,
      lineas,
      subtotal: totales.subtotal,
      descuento: totales.descuento,
      envio: totales.envio,
      total: totales.total,
      plan: { meses, interesPct: meses === 0 ? 0 : config.interesPct },
      etapa: 'nuevo' as const,
      vendedor,
      creadaEn: new Date().toISOString().slice(0, 10),
      notas,
    }
    window.open(
      enlaceWhatsapp(
        cliente.telefono,
        mensajeCotizacion(preliminar, cliente, config, productos),
      ),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const generarPDF = async () => {
    if (!cliente || lineas.length === 0) return
    const preliminar = {
      id: cotizacionId ?? 'preliminar',
      folio: cotizacionId
        ? (useCrm.getState().cotizaciones.find((c) => c.id === cotizacionId)?.folio ??
          'COT-PRELIMINAR')
        : 'COT-PRELIMINAR',
      clienteId,
      lineas,
      subtotal: totales.subtotal,
      descuento: totales.descuento,
      envio: totales.envio,
      plan: { meses, interesPct: meses === 0 ? 0 : config.interesPct },
      etapa: 'nuevo' as const,
      vendedor,
      creadaEn: new Date().toISOString().slice(0, 10),
      notas,
      total: totales.total,
    }
    const { generarPDFCotizacion } = await import('../lib/pdf')
    await generarPDFCotizacion(preliminar, cliente, config, productos)
    avisar('PDF generado.')
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)_18rem]">
        {/* ── Selector de cliente y productos ─────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 border border-rule bg-paper-2">
            <header className="flex items-center justify-between border-b border-rule px-3 py-2">
              <h2 className="label-tech text-ink">Cliente</h2>
              <Button
                tamano="sm"
                variante="ghost"
                onClick={() => setModalCliente(true)}
              >
                <UserPlus className="size-3.5" aria-hidden />
                Nuevo
              </Button>
            </header>
            <div className="p-3">
              {clientes.length === 0 ? (
                <p className="text-[12.5px] text-ink-3">
                  Todavía no hay clientes registrados.
                </p>
              ) : (
                <Select
                  aria-label="Elegir cliente"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Elegir cliente…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              )}
              {cliente ? (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="label-mono text-ink-3">
                    {cliente.telefono}
                  </span>
                  <Badge tono="muted">{cliente.tipo}</Badge>
                </div>
              ) : null}
            </div>
          </section>

          <section className="min-w-0 overflow-hidden border border-rule bg-paper-2">
            <header className="border-b border-rule px-3 py-2">
              <h2 className="label-tech text-ink">Catálogo</h2>
            </header>
            <div className="flex items-center gap-2 px-3 pt-3">
              <SearchInput
                etiqueta="Buscar instrumento"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1"
              />
              <Button
                tamano="sm"
                variante={categoria === 'todas' ? 'primary' : 'secondary'}
                onClick={() => setCategoria('todas')}
                aria-pressed={categoria === 'todas'}
              >
                Todas
              </Button>
            </div>

            {/* El diapasón: navegación por familias */}
            <div className="px-3 pt-3">
              <Fretboard
                valor={categoria === 'todas' ? '' : categoria}
                onChange={(v) => setCategoria(v as CategoriaId)}
                opciones={CATEGORIAS.map((c) => ({
                  valor: c.id,
                  etiqueta: c.corto,
                  conteo: conteoPorCategoria.get(c.id) ?? 0,
                }))}
              />
            </div>

            <ul className="max-h-80 overflow-y-auto border-t border-rule">
              {productosFiltrados.map((p) => {
                const disponible = p.stock - p.reservado
                const agotado = disponible <= 0
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => agregar(p.id)}
                      disabled={agotado}
                      className="flex w-full items-start gap-2 border-b border-rule/70 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-paper-3/60 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-ink">
                          {p.nombre}
                        </span>
                        <span className="label-mono block text-ink-4">
                          {p.marca} · {p.sku}
                        </span>
                        <span
                          className={`label-mono ${
                            agotado ? 'text-oxblood' : 'text-ink-4'
                          }`}
                        >
                          {agotado ? 'Sin existencias' : `${disponible} disponibles`}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <Money valor={p.precio} size="sm" />
                        <span
                          aria-hidden
                          className="mt-1 flex items-center justify-end text-ink-4"
                        >
                          <Plus className="size-3.5" />
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
              {productosFiltrados.length === 0 ? (
                <li className="px-3 py-6 text-center text-[12px] text-ink-4">
                  Nada coincide con esa búsqueda.
                </li>
              ) : null}
            </ul>
          </section>
        </div>

        {/* ── Líneas de la cotización ────────────────────────────────── */}
        <section className="flex min-w-0 flex-col border border-rule bg-paper-2">
          <header className="flex items-center justify-between border-b border-rule px-3 py-2">
            <h2 className="label-tech text-ink">
              Cotización
              {lineas.length > 0 ? (
                <span className="ml-2 font-mono text-ink-4">
                  {lineas.length} línea{lineas.length === 1 ? '' : 's'}
                </span>
              ) : null}
            </h2>
            {cotizacionId ? (
              <Badge tono="pine">Guardada</Badge>
            ) : (
              <Badge tono="brass">Borrador</Badge>
            )}
          </header>

          {lineas.length === 0 ? (
            <EmptyState
              titulo="La cotización está vacía"
              descripcion="Elige una familia en el diapasón y agrega instrumentos desde el catálogo."
              icono={<Plus className="size-5" />}
            />
          ) : (
            <ul className="flex-1">
              {lineas.map((l) => {
                const p = productos.find((x) => x.id === l.productoId)
                if (!p) return null
                const totalLinea =
                  l.precioUnitario * l.cantidad * (1 - l.descuentoPct / 100)
                return (
                  <li
                    key={l.productoId}
                    className="flex flex-wrap items-start gap-3 border-b border-rule/70 px-3 py-2.5 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-ink">{p.nombre}</p>
                      <p className="label-mono text-ink-4">
                        {p.marca} · {p.sku} · {moneda(p.precio)} c/u
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        {p.specs.slice(0, 3).map((s) => (
                          <li key={s.etiqueta} className="label-mono text-ink-4">
                            {s.etiqueta}: {s.valor}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <label
                          htmlFor={`cant-${l.productoId}`}
                          className="label-tech text-ink-4"
                        >
                          Cant.
                        </label>
                        <input
                          id={`cant-${l.productoId}`}
                          type="number"
                          min={1}
                          value={l.cantidad}
                          onChange={(e) =>
                            cambiarCantidad(l.productoId, Number(e.target.value))
                          }
                          className="h-7 w-14 rounded-xs border border-rule-2 bg-paper px-1.5 text-center font-mono text-[12px] text-ink focus:border-ink-3 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label
                          htmlFor={`dto-${l.productoId}`}
                          className="label-tech text-ink-4"
                        >
                          Dcto.
                        </label>
                        <input
                          id={`dto-${l.productoId}`}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={l.descuentoPct}
                          onChange={(e) =>
                            cambiarDescuento(l.productoId, Number(e.target.value))
                          }
                          className="h-7 w-14 rounded-xs border border-rule-2 bg-paper px-1.5 text-center font-mono text-[12px] text-ink focus:border-ink-3 focus:outline-none"
                        />
                      </div>
                      <div className="w-24 text-right">
                        <Money valor={totalLinea} size="sm" />
                      </div>
                      <IconButton
                        etiqueta={`Quitar ${p.nombre}`}
                        onClick={() => quitar(l.productoId)}
                        className="hover:text-oxblood"
                      >
                        <Trash2 className="size-3.5" />
                      </IconButton>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="border-t border-rule p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field etiqueta="Vendedor responsable" htmlFor="vendedor">
                <Select
                  id="vendedor"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                >
                  {VENDEDORES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                etiqueta="Plan de pago"
                htmlFor="plan"
                ayuda={
                  meses === 0
                    ? 'Pago contra entrega'
                    : `${config.interesPct}% de interés sobre el saldo`
                }
              >
                <Select
                  id="plan"
                  value={String(meses)}
                  onChange={(e) => setMeses(Number(e.target.value))}
                >
                  {config.mesesCredito.map((m) => (
                    <option key={m} value={m}>
                      {m === 0 ? 'Contado' : `${m} meses`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field etiqueta="Notas para el cliente" htmlFor="notas" className="mt-3">
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Condiciones especiales, tiempos de entrega, accesorios incluidos…"
              />
            </Field>
          </div>
        </section>

        {/* ── Totales y acciones ──────────────────────────────────────── */}
        <aside className="flex min-w-0 flex-col gap-3">
          <div className="border border-rule border-t-2 border-t-oxblood bg-paper-2 p-3">
            <h2 className="label-tech text-ink">Totales</h2>
            <dl className="mt-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-[12.5px] text-ink-3">Subtotal</dt>
                <dd>
                  <Money valor={totales.subtotal} size="sm" />
                </dd>
              </div>
              {totales.descuento > 0 ? (
                <div className="flex items-center justify-between">
                  <dt className="text-[12.5px] text-ink-3">Descuento</dt>
                  <dd>
                    <Money valor={-totales.descuento} size="sm" conSigno />
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <dt className="text-[12.5px] text-ink-3">Envío</dt>
                <dd>
                  {totales.envio === 0 ? (
                    <span className="label-mono text-pine">Sin costo</span>
                  ) : (
                    <Money valor={totales.envio} size="sm" />
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex items-end justify-between border-t border-rule pt-3">
              <span className="label-tech text-ink-3">Total</span>
              <Money valor={totales.total} size="lg" />
            </div>

            {meses > 0 ? (
              <div className="mt-2 rounded-xs border border-brass/40 bg-brass-soft px-2.5 py-2">
                <p className="label-tech text-brass-ink">
                  {meses} cuotas de {moneda(totales.total / meses)}
                </p>
                <p className="mt-0.5 text-[11px] text-brass-ink/80">
                  Tasa {config.interesPct}% · Total con interés{' '}
                  {moneda(totales.total * (1 + (config.interesPct / 100) * (meses / 12)))}
                </p>
              </div>
            ) : null}

            {config.ivaPct > 0 ? (
              <p className="mt-2 label-mono text-ink-4">
                IVA de {config.ivaPct}% incluido en los precios
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variante="primary"
              onClick={() => {
                const q = guardar()
                if (q) navegar(`/pipeline?cotizacion=${q.id}`)
              }}
              disabled={!puedeGuardar}
            >
              <Save className="size-3.5" aria-hidden />
              Guardar en el pipeline
            </Button>
            <Button
              variante="secondary"
              onClick={abrirVistaCliente}
              disabled={!puedeGuardar}
            >
              <Eye className="size-3.5" aria-hidden />
              Ver como el cliente
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variante="secondary" onClick={generarPDF} disabled={!puedeGuardar}>
                <FileDown className="size-3.5" aria-hidden />
                PDF
              </Button>
              <Button
                variante="secondary"
                onClick={enviarWhatsapp}
                disabled={!cliente || lineas.length === 0}
              >
                <MessageCircle className="size-3.5" aria-hidden />
                WhatsApp
              </Button>
            </div>
          </div>

          {!puedeGuardar ? (
            <p className="text-[11.5px] leading-snug text-ink-4">
              Para guardar la cotización hace falta un cliente y al menos un
              artículo.
            </p>
          ) : null}
        </aside>
      </div>

      <ModalCliente
        abierto={modalCliente}
        onCerrar={() => setModalCliente(false)}
        onCrear={(datos) => {
          const nuevo = crearCliente(datos)
          setClienteId(nuevo.id)
          setModalCliente(false)
          avisar(`${nuevo.nombre} agregado a la cartera.`)
        }}
      />
    </>
  )
}

function ModalCliente({
  abierto,
  onCerrar,
  onCrear,
}: {
  abierto: boolean
  onCerrar: () => void
  onCrear: (datos: {
    nombre: string
    telefono: string
    email?: string
    tipo: TipoCliente
    canal: 'whatsapp' | 'visita' | 'telefono' | 'web' | 'referido'
    ciudad: string
    notas: string
  }) => void
}) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState<TipoCliente>('consumidor')
  const [ciudad, setCiudad] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState('')

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Escribe el nombre del cliente.')
      return
    }
    if (!telefono.trim()) {
      setError('Escribe un teléfono de contacto.')
      return
    }
    setError('')
    onCrear({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email.trim() || undefined,
      tipo,
      canal: 'whatsapp',
      ciudad: ciudad.trim() || 'Ciudad de Guatemala',
      notas: notas.trim(),
    })
    setNombre('')
    setTelefono('')
    setEmail('')
    setCiudad('')
    setNotas('')
  }

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Nuevo cliente"
      eyebrow="Cartera"
      descripcion="Registra lo mínimo para poder cotizar y dar seguimiento."
      ancho="sm"
      pie={
        <>
          <Button variante="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="primary" onClick={enviar}>
            Guardar cliente
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="flex flex-col gap-3">
        {error ? (
          <p role="alert" className="rounded-xs border border-oxblood/40 bg-oxblood-soft px-2.5 py-1.5 text-[12px] text-oxblood">
            {error}
          </p>
        ) : null}
        <Field etiqueta="Nombre" htmlFor="nc-nombre" requerido>
          <Input
            id="nc-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field etiqueta="Teléfono" htmlFor="nc-tel" requerido>
          <Input
            id="nc-tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+502 5123 4567"
            autoComplete="off"
          />
        </Field>
        <Field etiqueta="Correo" htmlFor="nc-mail">
          <Input
            id="nc-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field etiqueta="Tipo" htmlFor="nc-tipo">
            <Select
              id="nc-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoCliente)}
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </Select>
          </Field>
          <Field etiqueta="Ciudad" htmlFor="nc-ciudad">
            <Input
              id="nc-ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              autoComplete="off"
            />
          </Field>
        </div>
        <Field etiqueta="Notas" htmlFor="nc-notas">
          <Textarea
            id="nc-notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Qué busca, para qué evento, cómo prefiere que le escriban…"
          />
        </Field>
      </form>
    </Modal>
  )
}
