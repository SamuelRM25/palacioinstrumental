import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { SearchInput, Select } from '../components/ui/Field'
import { Tabla } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { useCrm } from '../store/crmStore'
import type { Cliente } from '../types'
import { tiempoRelativo } from '../lib/format'

const TIPOS = [
  { valor: 'todos', etiqueta: 'Todos los tipos' },
  { valor: 'consumidor', etiqueta: 'Consumidores' },
  { valor: 'banda', etiqueta: 'Bandas' },
  { valor: 'estudio', etiqueta: 'Estudios' },
  { valor: 'evento', etiqueta: 'Eventos' },
  { valor: 'colegio', etiqueta: 'Colegios e instituciones' },
]

export default function Clientes() {
  const navegar = useNavigate()
  const clientes = useCrm((s) => s.clientes)
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const [busqueda, setBusqueda] = useState('')
  const [tipo, setTipo] = useState('todos')

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return clientes
      .filter((c) => {
        if (tipo !== 'todos' && c.tipo !== tipo) return false
        if (!q) return true
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.telefono.toLowerCase().includes(q) ||
          c.ciudad.toLowerCase().includes(q)
        )
      })
      .map((c) => {
        const suyas = cotizaciones.filter((q2) => q2.clienteId === c.id)
        const valorTotal = suyas
          .filter((q2) => q2.etapa === 'cerrada')
          .reduce((a, q2) => a + q2.total, 0)
        return { ...c, cotizaciones: suyas.length, valorTotal }
      })
      .sort((a, b) => b.valorTotal - a.valorTotal)
  }, [clientes, cotizaciones, busqueda, tipo])

  const columnas = [
    {
      clave: 'nombre',
      encabezado: 'Cliente',
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink">
            {c.nombre}
          </span>
          <span className="label-mono block text-ink-4">{c.telefono}</span>
        </span>
      ),
    },
    {
      clave: 'tipo',
      encabezado: 'Tipo',
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <Badge tono="muted">{c.tipo}</Badge>
      ),
    },
    {
      clave: 'ciudad',
      encabezado: 'Ciudad',
      secundaria: true,
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <span className="text-[12.5px] text-ink-3">{c.ciudad}</span>
      ),
    },
    {
      clave: 'cotizaciones',
      encabezado: 'Cotizaciones',
      alinear: 'centro' as const,
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <span className="font-mono text-[12px] text-ink-3">{c.cotizaciones}</span>
      ),
    },
    {
      clave: 'valor',
      encabezado: 'Comprado',
      alinear: 'derecha' as const,
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <Money valor={c.valorTotal} />
      ),
    },
    {
      clave: 'actividad',
      encabezado: 'Última actividad',
      alinear: 'derecha' as const,
      secundaria: true,
      render: (c: Cliente & { cotizaciones: number; valorTotal: number }) => (
        <span className="label-mono text-ink-3">
          {tiempoRelativo(c.ultimaActividad)}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          etiqueta="Buscar por nombre, teléfono o ciudad"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-56 flex-1 sm:max-w-xs"
        />
        <Select
          aria-label="Filtrar por tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-auto min-w-48"
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </Select>
      </div>

      <div className="border border-rule bg-paper-2">
        <Tabla
          columnas={columnas}
          filas={filas}
          claveFila={(c) => c.id}
          onFilaClick={(c) => navegar(`/clientes/${c.id}`)}
          vacio={
            <EmptyState
              titulo="Sin clientes en la cartera"
              descripcion="Agrega clientes desde el cotizador para empezar a dar seguimiento."
            />
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="label-mono text-ink-4">
          {filas.length} cliente{filas.length === 1 ? '' : 's'}
        </p>
        <Button variante="secondary" onClick={() => navegar('/cotizador')}>
          Ir al cotizador
        </Button>
      </div>
    </>
  )
}
