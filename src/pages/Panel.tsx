import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, CalendarClock, PackageSearch } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, Punto } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Trastes } from '../components/ui/Rule'
import {
  BarrasHorizontales,
  BarrasVerticales,
  Embudo,
} from '../components/charts/Charts'
import { useCrm } from '../store/crmStore'
import {
  actividadReciente,
  calcularKpis,
  cotizacionesPorSemana,
  embudo,
  requiereAtencion,
  ventasPorCategoria,
} from '../lib/analytics'
import { CATEGORIAS } from '../data/config'
import { monedaCorta, numero, tiempoRelativo } from '../lib/format'

export default function Panel() {
  const navegar = useNavigate()
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const clientes = useCrm((s) => s.clientes)
  const productos = useCrm((s) => s.productos)

  const kpis = useMemo(
    () => calcularKpis(cotizaciones, productos),
    [cotizaciones, productos],
  )
  const semanas = useMemo(() => cotizacionesPorSemana(cotizaciones, 8), [cotizaciones])
  const porCategoria = useMemo(
    () => ventasPorCategoria(cotizaciones, productos),
    [cotizaciones, productos],
  )
  const etapas = useMemo(() => embudo(cotizaciones), [cotizaciones])
  const atencion = useMemo(
    () => requiereAtencion(cotizaciones, clientes, productos),
    [cotizaciones, clientes, productos],
  )
  const actividad = useMemo(() => actividadReciente(cotizaciones), [cotizaciones])

  const variacionVentas = kpis.ventasMesAnterior
    ? ((kpis.ventasMes - kpis.ventasMesAnterior) / kpis.ventasMesAnterior) * 100
    : 0

  const nombreCategoria = (id: string) =>
    CATEGORIAS.find((c) => c.id === id)?.nombre ?? id

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-ink-3">
            {kpis.sinResponder > 0 ? (
              <>
                <span className="font-semibold text-oxblood">
                  {kpis.sinResponder}
                </span>{' '}
                {kpis.sinResponder === 1
                  ? 'cotización sin respuesta'
                  : 'cotizaciones sin respuesta'}
                . El resto avanza según lo previsto.
              </>
            ) : (
              'Todo el pipeline está al día. Ninguna cotización esperando respuesta.'
            )}
          </p>
        </div>
        <Button variante="primary" onClick={() => navegar('/cotizador')}>
          Nueva cotización
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          etiqueta="Ventas del mes"
          valor={monedaCorta(kpis.ventasMes)}
          variacion={{
            valor: `${variacionVentas >= 0 ? '+' : ''}${Math.round(variacionVentas)}%`,
            direccion:
              variacionVentas > 0 ? 'sube' : variacionVentas < 0 ? 'baja' : 'igual',
          }}
          pie="vs. mes anterior"
          acento="oxblood"
        />
        <StatCard
          etiqueta="Cotizaciones abiertas"
          valor={numero(kpis.cotizacionesAbiertas)}
          pie={`${monedaCorta(kpis.valorPipeline)} en juego`}
          acento="brass"
        />
        <StatCard
          etiqueta="Valor del pipeline"
          valor={monedaCorta(kpis.valorPipeline)}
          pie="en cotizaciones no cerradas"
        />
        <StatCard
          etiqueta="Tasa de cierre"
          valor={`${Math.round(kpis.tasaCierre)}%`}
          pie="sobre cotizaciones decididas"
          acento="pine"
        />
        <StatCard
          etiqueta="Ticket promedio"
          valor={monedaCorta(kpis.ticketPromedio)}
          pie="por venta cerrada"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {/* Columna principal */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card acento="none">
            <CardHeader
              eyebrow="Últimas 8 semanas"
              titulo="Cotizaciones por semana"
              descripcion="Barra clara: monto total de la semana. Barra sólida: monto ya cerrado."
              acciones={
                <Link
                  to="/pipeline"
                  className="label-tech inline-flex items-center gap-1 text-oxblood transition-colors hover:text-oxblood-hi"
                >
                  Ver pipeline
                  <ArrowUpRight className="size-3" aria-hidden />
                </Link>
              }
            />
            <CardBody>
              <BarrasVerticales
                datos={semanas.map((s) => ({
                  etiqueta: s.etiqueta,
                  valor: s.monto,
                  anidado: s.montoCerrado,
                }))}
                alto={160}
                color="oxblood"
                formato={(n) => monedaCorta(n)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Ventas cerradas"
              titulo="Por familia de instrumento"
              descripcion="Reparto del monto facturado por categoría."
            />
            <CardBody>
              {porCategoria.length === 0 ? (
                <EmptyState
                  titulo="Todavía no hay ventas cerradas"
                  descripcion="En cuanto se cierre una cotización, aquí verás el reparto por familia."
                  icono={<PackageSearch className="size-5" />}
                />
              ) : (
                <BarrasHorizontales
                  datos={porCategoria.map((c) => ({
                    etiqueta: nombreCategoria(c.categoria),
                    valor: c.monto,
                    detalle: `${c.unidades} u.`,
                  }))}
                  color="brass"
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader eyebrow="Conversión" titulo="Embudo" />
            <CardBody>
              <Embudo
                etapas={etapas.map((e) => ({
                  ...e,
                  nombre:
                    e.id === 'nuevo'
                      ? 'Nueva'
                      : e.id === 'enviada'
                        ? 'Enviada'
                        : e.id === 'negociando'
                          ? 'Negociando'
                          : e.id === 'aprobada'
                            ? 'Aprobada'
                            : 'Cerrada',
                }))}
              />
            </CardBody>
          </Card>

          <Card acento="oxblood">
            <CardHeader
              eyebrow="Acciones pendientes"
              titulo="Requiere atención"
              acciones={
                atencion.length > 0 ? (
                  <Badge tono="oxblood">{atencion.length}</Badge>
                ) : undefined
              }
            />
            <div className="p-0">
              {atencion.length === 0 ? (
                <EmptyState
                  titulo="Nada que escalar"
                  descripcion="Sin cotizaciones estancadas ni faltantes de existencias."
                />
              ) : (
                <ul>
                  {atencion.slice(0, 7).map((a) => (
                    <li
                      key={a.id}
                      className="border-b border-rule/70 last:border-b-0"
                    >
                      <Link
                        to={a.uri}
                        className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-paper-3/60"
                      >
                        <span
                          aria-hidden
                          className={`mt-1 shrink-0 ${
                            a.severidad === 'alta' ? 'text-oxblood' : 'text-amber'
                          }`}
                        >
                          <AlertTriangle className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-ink">
                            {a.titulo}
                          </span>
                          <span className="block text-[11.5px] text-ink-3">
                            {a.detalle}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {atencion.length > 7 ? (
                <div className="border-t border-rule px-4 py-2">
                  <Link
                    to="/pipeline"
                    className="label-tech inline-flex items-center gap-1 text-oxblood transition-colors hover:text-oxblood-hi"
                  >
                    Revisar las {atencion.length} pendientes
                    <ArrowUpRight className="size-3" aria-hidden />
                  </Link>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Últimos movimientos" titulo="Actividad" />
            <CardBody>
              {actividad.length === 0 ? (
                <p className="text-[13px] text-ink-3">Sin movimientos aún.</p>
              ) : (
                <ol className="relative flex flex-col gap-3 pl-4">
                  <span
                    aria-hidden
                    className="absolute top-1 bottom-1 left-[3px] w-px bg-rule"
                  />
                  {actividad.map((a) => (
                    <li key={a.id} className="relative">
                      <span
                        aria-hidden
                        className="absolute top-1.5 -left-4 size-[7px] rounded-full border border-paper bg-brass"
                      />
                      <p className="text-[12.5px] text-ink">{a.texto}</p>
                      <p className="label-mono text-ink-4">
                        {tiempoRelativo(a.cuando)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Trastes className="mt-6" inlay />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Punto tono="oxblood" />
        <p className="text-[12px] text-ink-3">
          Cifras de demostración. El equipo puede editarlas desde{' '}
          <Link to="/configuracion" className="text-oxblood underline underline-offset-2">
            Configuración
          </Link>
          .
        </p>
      </div>
      <div className="mt-1 flex items-center gap-2 text-ink-4">
        <CalendarClock className="size-3.5" aria-hidden />
        <span className="label-mono">
          Actualizado {new Date().toLocaleDateString('es-GT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </>
  )
}
