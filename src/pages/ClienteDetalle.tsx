import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Pencil } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge, EtapaBadge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useCrm } from '../store/crmStore'
import { fecha, tiempoRelativo } from '../lib/format'
import { enlaceWhatsapp } from '../lib/whatsapp'

export default function ClienteDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const cliente = useCrm((s) => s.clientes.find((c) => c.id === id))
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const config = useCrm((s) => s.config)
  const actualizarCliente = useCrm((s) => s.actualizarCliente)

  const suyas = useMemo(
    () =>
      cotizaciones
        .filter((c) => c.clienteId === id)
        .sort((a, b) => (a.creadaEn < b.creadaEn ? 1 : -1)),
    [cotizaciones, id],
  )

  const cerrado = suyas.filter((c) => c.etapa === 'cerrada')
  const totalComprado = cerrado.reduce((a, c) => a + c.total, 0)
  const enCurso = suyas.filter(
    (c) => c.etapa !== 'cerrada' && c.etapa !== 'perdida',
  )
  const valorEnCurso = enCurso.reduce((a, c) => a + c.total, 0)

  if (!cliente) {
    return (
      <EmptyState
        titulo="Cliente no encontrado"
        descripcion="Puede que se haya eliminado de la cartera."
        accion={{ etiqueta: 'Volver a la cartera', onClick: () => navegar('/clientes') }}
      />
    )
  }

  return (
    <>
      <Link
        to="/clientes"
        className="label-tech mb-3 inline-flex items-center gap-1.5 text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3" aria-hidden />
        Cartera
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[26px] leading-tight font-semibold tracking-tight text-ink">
            {cliente.nombre}
          </h2>
          <p className="label-mono mt-1 text-ink-3">
            {cliente.telefono}
            {cliente.email ? ` · ${cliente.email}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tono="muted">{cliente.tipo}</Badge>
            <Badge tono="muted">{cliente.ciudad}</Badge>
            <Badge tono="brass">Canal: {cliente.canal}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variante="secondary"
            onClick={() => {
              const nombre = window.prompt(
                'Nombre del cliente',
                cliente.nombre,
              )
              if (nombre && nombre.trim()) {
                actualizarCliente(cliente.id, { nombre: nombre.trim() })
              }
            }}
          >
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </Button>
          <Button
            variante="primary"
            onClick={() =>
              window.open(
                enlaceWhatsapp(
                  cliente.telefono,
                  `Hola ${cliente.nombre}, te escribe ${config.nombre}.`,
                ),
                '_blank',
                'noopener,noreferrer',
              )
            }
          >
            <MessageCircle className="size-3.5" aria-hidden />
            Escribir por WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader eyebrow="Historial" titulo="Cotizaciones" />
            <div className="p-0">
              {suyas.length === 0 ? (
                <EmptyState
                  titulo="Sin cotizaciones"
                  descripcion="Cuando le cotices, el historial aparecerá aquí."
                />
              ) : (
                <ul>
                  {suyas.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/pipeline?cotizacion=${c.id}`}
                        className="flex flex-wrap items-center gap-3 border-b border-rule/70 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-paper-3/60"
                      >
                        <span className="label-mono w-32 shrink-0 text-ink-4">
                          {c.folio}
                        </span>
                        <EtapaBadge etapa={c.etapa} />
                        <span className="label-mono text-ink-4">
                          {fecha(c.creadaEn)}
                        </span>
                        <span className="ml-auto">
                          <Money valor={c.total} size="sm" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {cliente.notas ? (
            <Card>
              <CardHeader eyebrow="Notas internas" titulo="Lo que hay que saber" />
              <CardBody>
                <p className="text-[13px] leading-relaxed text-ink-2">
                  {cliente.notas}
                </p>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <aside className="flex flex-col gap-3">
          <Card acento="oxblood">
            <CardHeader eyebrow="Histórico" titulo="Resumen" />
            <CardBody className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Comprado</span>
                <Money valor={totalComprado} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">En curso</span>
                <Money valor={valorEnCurso} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Cotizaciones</span>
                <span className="font-mono text-[12px] text-ink">{suyas.length}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader eyebrow="Registro" titulo="Ficha" />
            <CardBody className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Alta</span>
                <span className="label-mono text-ink-2">
                  {fecha(cliente.creadoEn)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Última actividad</span>
                <span className="label-mono text-ink-2">
                  {tiempoRelativo(cliente.ultimaActividad)}
                </span>
              </div>
            </CardBody>
          </Card>

          <Button variante="primary" onClick={() => navegar('/cotizador')}>
            Cotizar a este cliente
          </Button>
        </aside>
      </div>
    </>
  )
}
