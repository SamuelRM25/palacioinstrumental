import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EtapaBadge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { SearchInput, Select } from '../components/ui/Field'
import { Tabla } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { useCrm } from '../store/crmStore'
import { ETAPAS, VENDEDORES } from '../data/config'
import type { Cotizacion } from '../types'
import { fecha } from '../lib/format'

export default function Cotizaciones() {
  const navegar = useNavigate()
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const clientes = useCrm((s) => s.clientes)
  const [busqueda, setBusqueda] = useState('')
  const [etapa, setEtapa] = useState('todas')

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return cotizaciones
      .filter((c) => {
        if (etapa !== 'todas' && c.etapa !== etapa) return false
        if (!q) return true
        const cli = clientes.find((x) => x.id === c.clienteId)
        return (
          c.folio.toLowerCase().includes(q) ||
          (cli?.nombre.toLowerCase().includes(q) ?? false)
        )
      })
      .sort((a, b) => (a.creadaEn < b.creadaEn ? 1 : -1))
  }, [cotizaciones, clientes, busqueda, etapa])

  const columnas = [
    {
      clave: 'folio',
      encabezado: 'Folio',
      render: (c: Cotizacion) => (
        <span className="font-mono text-[12px] text-ink">{c.folio}</span>
      ),
    },
    {
      clave: 'cliente',
      encabezado: 'Cliente',
      render: (c: Cotizacion) => {
        const cli = clientes.find((x) => x.id === c.clienteId)
        return (
          <span className="block truncate">
            <span className="block truncate text-[13px] text-ink">
              {cli?.nombre ?? 'Cliente eliminado'}
            </span>
            <span className="label-mono block text-ink-4">{cli?.ciudad}</span>
          </span>
        )
      },
    },
    {
      clave: 'etapa',
      encabezado: 'Etapa',
      render: (c: Cotizacion) => <EtapaBadge etapa={c.etapa} />,
    },
    {
      clave: 'vendedor',
      encabezado: 'Vendedor',
      secundaria: true,
      render: (c: Cotizacion) => (
        <span className="text-[12.5px] text-ink-3">
          {VENDEDORES.find((v) => v.id === c.vendedor)?.nombre ?? c.vendedor}
        </span>
      ),
    },
    {
      clave: 'fecha',
      encabezado: 'Fecha',
      secundaria: true,
      render: (c: Cotizacion) => (
        <span className="label-mono text-ink-3">{fecha(c.creadaEn)}</span>
      ),
    },
    {
      clave: 'total',
      encabezado: 'Total',
      alinear: 'derecha' as const,
      render: (c: Cotizacion) => <Money valor={c.total} />,
    },
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          etiqueta="Buscar por folio o cliente"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-56 flex-1 sm:max-w-xs"
        />
        <div className="w-44">
          <Select
            aria-label="Filtrar por etapa"
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
          >
            <option value="todas">Todas las etapas</option>
            {ETAPAS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
        </div>
        <div className="ml-auto">
          <Button variante="primary" onClick={() => navegar('/crm/cotizador')}>
            Nueva cotización
          </Button>
        </div>
      </div>

      <div className="border border-rule bg-paper-2">
        <Tabla
          columnas={columnas}
          filas={filas}
          claveFila={(c) => c.id}
          onFilaClick={(c) => navegar(`/crm/pipeline?cotizacion=${c.id}`)}
          vacio={
            <EmptyState
              titulo="Sin cotizaciones que coincidan"
              descripcion="Ajusta los filtros o crea una cotización nueva."
            />
          }
        />
      </div>

      <p className="mt-3 label-mono text-ink-4">
        {filas.length} cotización{filas.length === 1 ? '' : 'es'} en la lista
      </p>
    </>
  )
}
