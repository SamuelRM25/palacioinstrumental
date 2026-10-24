import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Money } from '../components/ui/Money'
import { SearchInput, Select } from '../components/ui/Field'
import { Tabla } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { useCrm } from '../store/crmStore'
import { CATEGORIAS } from '../data/config'
import type { Producto } from '../types'

export default function Inventario() {
  const [params] = useSearchParams()
  const productos = useCrm((s) => s.productos)
  const ajustarStock = useCrm((s) => s.ajustarStock)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [soloStockBajo, setSoloStockBajo] = useState(false)

  const destacadoId = params.get('producto')

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      if (categoria !== 'todas' && p.categoria !== categoria) return false
      if (soloStockBajo && p.stock - p.reservado > 2) return false
      if (!q) return true
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      )
    })
  }, [productos, busqueda, categoria, soloStockBajo])

  const nombreCategoria = (id: string) =>
    CATEGORIAS.find((c) => c.id === id)?.nombre ?? id

  const columnas = [
    {
      clave: 'sku',
      encabezado: 'SKU',
      render: (p: Producto) => (
        <span className="font-mono text-[11.5px] text-ink-3">{p.sku}</span>
      ),
    },
    {
      clave: 'nombre',
      encabezado: 'Artículo',
      render: (p: Producto) => (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] text-ink">{p.nombre}</span>
          <span className="label-mono block text-ink-4">
            {p.marca} · {nombreCategoria(p.categoria)}
          </span>
        </span>
      ),
    },
    {
      clave: 'precio',
      encabezado: 'Precio',
      alinear: 'derecha' as const,
      render: (p: Producto) => <Money valor={p.precio} />,
    },
    {
      clave: 'costo',
      encabezado: 'Costo',
      alinear: 'derecha' as const,
      secundaria: true,
      render: (p: Producto) => (
        <Money valor={p.costo} size="sm" className="text-ink-3" />
      ),
    },
    {
      clave: 'stock',
      encabezado: 'Existencias',
      alinear: 'centro' as const,
      render: (p: Producto) => {
        const disponible = p.stock - p.reservado
        const estado =
          disponible <= 0 ? 'oxblood' : disponible <= 2 ? 'amber' : 'pine'
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={`inline-flex h-6 items-center rounded-xs border border-rule-2 ${
                destacadoId === p.id ? 'bg-paper-3' : 'bg-paper'
              }`}
            >
              <button
                type="button"
                aria-label={`Quitar una unidad de ${p.nombre}`}
                onClick={(e) => {
                  e.stopPropagation()
                  ajustarStock(p.id, -1)
                }}
                className="flex h-6 w-6 items-center justify-center text-ink-3 transition-colors hover:text-oxblood"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center font-mono text-[12px] text-ink">
                {p.stock}
              </span>
              <button
                type="button"
                aria-label={`Agregar una unidad de ${p.nombre}`}
                onClick={(e) => {
                  e.stopPropagation()
                  ajustarStock(p.id, 1)
                }}
                className="flex h-6 w-6 items-center justify-center text-ink-3 transition-colors hover:text-ink"
              >
                <Plus className="size-3" />
              </button>
            </span>
            <Badge tono={estado}>
              {disponible <= 0 ? 'Agotado' : `${disponible} disp.`}
            </Badge>
          </span>
        )
      },
    },
    {
      clave: 'reservado',
      encabezado: 'Reservado',
      alinear: 'centro' as const,
      secundaria: true,
      render: (p: Producto) => (
        <span className="font-mono text-[12px] text-ink-3">{p.reservado}</span>
      ),
    },
  ]

  const bajos = productos.filter((p) => p.stock - p.reservado <= 2).length

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          etiqueta="Buscar por nombre, marca o SKU"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-56 flex-1 sm:max-w-xs"
        />
        <div className="w-48">
          <Select
            aria-label="Filtrar por categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variante={soloStockBajo ? 'primary' : 'secondary'}
          onClick={() => setSoloStockBajo((v) => !v)}
        >
          Solo stock bajo{bajos > 0 ? ` (${bajos})` : ''}
        </Button>
      </div>

      <div className="border border-rule bg-paper-2">
        <Tabla
          columnas={columnas}
          filas={filas}
          claveFila={(p) => p.id}
          filaActiva={destacadoId ?? undefined}
          vacio={
            <EmptyState
              titulo="Sin artículos que coincidan"
              descripcion="Cambia los filtros o busca por otra referencia."
            />
          }
        />
      </div>

      <p className="mt-3 label-mono text-ink-4">
        {filas.length} artículo{filas.length === 1 ? '' : 's'} · {bajos} con
        existencias bajas
      </p>
    </>
  )
}
