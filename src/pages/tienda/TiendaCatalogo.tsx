import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { SearchInput, Select } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { FichaProducto } from '../../components/tienda/FichaProducto'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { useToast } from '../../components/ui/toastContext'
import { CATEGORIAS } from '../../data/config'
import type { CategoriaId } from '../../types'

type Orden = 'destacados' | 'precio-asc' | 'precio-desc' | 'nombre' | 'nuevos'

const RANGOS = [
  { valor: 'todos', etiqueta: 'Cualquier precio', min: 0, max: Infinity },
  { valor: 'hasta-500', etiqueta: 'Hasta Q500', min: 0, max: 500 },
  { valor: '500-2000', etiqueta: 'Q500 – Q2,000', min: 500, max: 2000 },
  { valor: '2000-5000', etiqueta: 'Q2,000 – Q5,000', min: 2000, max: 5000 },
  { valor: '5000-10000', etiqueta: 'Q5,000 – Q10,000', min: 5000, max: 10000 },
  { valor: 'mas-10000', etiqueta: 'Más de Q10,000', min: 10000, max: Infinity },
]

const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: 'destacados', etiqueta: 'Destacados primero' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'nombre', etiqueta: 'Nombre (A–Z)' },
  { valor: 'nuevos', etiqueta: 'Novedades' },
]

export default function TiendaCatalogo() {
  const [params, setParams] = useSearchParams()
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)
  const avisar = useToast().avisar

  const categoria = (params.get('categoria') ?? 'todas') as CategoriaId | 'todas'
  const consulta = params.get('q') ?? ''
  const soloDisponibles = params.get('solo') === 'disponibles'

  const [busqueda, setBusqueda] = useState(consulta)
  const [marca, setMarca] = useState('todas')
  const [rango, setRango] = useState('todos')
  const [orden, setOrden] = useState<Orden>('destacados')

  const marcas = useMemo(
    () => [...new Set(productos.map((p) => p.marca))].sort(),
    [productos],
  )

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const limites = RANGOS.find((r) => r.valor === rango) ?? RANGOS[0]

    const lista = productos.filter((p) => {
      if (categoria !== 'todas' && p.categoria !== categoria) return false
      if (marca !== 'todas' && p.marca !== marca) return false
      if (p.precio < limites.min || p.precio > limites.max) return false
      if (soloDisponibles && p.stock - p.reservado <= 0) return false
      if (!q) return true
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.specs.some((s) => s.valor.toLowerCase().includes(q))
      )
    })

    switch (orden) {
      case 'precio-asc':
        return [...lista].sort((a, b) => a.precio - b.precio)
      case 'precio-desc':
        return [...lista].sort((a, b) => b.precio - a.precio)
      case 'nombre':
        return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      case 'nuevos':
        return [...lista].sort(
          (a, b) => Number(Boolean(b.nuevo)) - Number(Boolean(a.nuevo)),
        )
      default:
        return [...lista].sort(
          (a, b) => Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)),
        )
    }
  }, [productos, categoria, marca, rango, orden, busqueda, soloDisponibles])

  const hayFiltros =
    categoria !== 'todas' ||
    marca !== 'todas' ||
    rango !== 'todos' ||
    busqueda !== '' ||
    soloDisponibles

  const limpiar = () => {
    setParams(new URLSearchParams())
    setBusqueda('')
    setMarca('todas')
    setRango('todos')
  }

  const nombreCategoria =
    CATEGORIAS.find((c) => c.id === categoria)?.nombre ?? 'Instrumentos'

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <header>
        <p className="label-tech text-oxblood">Catálogo</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight font-semibold tracking-tight text-ink">
          {nombreCategoria}
        </h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-3">
          {filtrados.length} de {productos.length} referencias. Todos los
          precios están en quetzales, con IVA incluido.
        </p>
      </header>

      {/* Filtros */}
      <div className="mt-7 flex flex-wrap items-center gap-2 border-y border-rule py-3">
        <SearchInput
          etiqueta="Buscar por nombre, marca o referencia"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-w-52 flex-1 sm:max-w-72"
        />

        <div className="w-44">
          <Select
            aria-label="Filtrar por familia"
            value={categoria}
            onChange={(e) => {
              const p = new URLSearchParams(params)
              if (e.target.value === 'todas') p.delete('categoria')
              else p.set('categoria', e.target.value)
              setParams(p, { replace: true })
            }}
          >
            <option value="todas">Todas las familias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-40">
          <Select
            aria-label="Filtrar por marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          >
            <option value="todas">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-44">
          <Select
            aria-label="Filtrar por precio"
            value={rango}
            onChange={(e) => setRango(e.target.value)}
          >
            {RANGOS.map((r) => (
              <option key={r.valor} value={r.valor}>
                {r.etiqueta}
              </option>
            ))}
          </Select>
        </div>

        <Button
          variante={soloDisponibles ? 'primary' : 'secondary'}
          onClick={() => {
            const p = new URLSearchParams(params)
            if (soloDisponibles) p.delete('solo')
            else p.set('solo', 'disponibles')
            setParams(p, { replace: true })
          }}
        >
          Solo disponibles
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select
              aria-label="Ordenar resultados"
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
            >
              {ORDENES.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </Select>
          </div>
          {hayFiltros ? (
            <Button variante="ghost" onClick={limpiar}>
              Limpiar
            </Button>
          ) : null}
        </div>
      </div>

      {/* Resultados */}
      {filtrados.length === 0 ? (
        <EmptyState
          titulo="Ningún artículo coincide"
          descripcion="Probá con otra palabra, otra familia o quitá los filtros de precio."
          icono={<SearchX className="size-5" />}
          accion={{ etiqueta: 'Limpiar filtros', onClick: limpiar }}
        />
      ) : (
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((p) => (
            <FichaProducto
              key={p.id}
              producto={p}
              onAgregar={(prod) => {
                agregar(prod.id)
                avisar(`${prod.nombre} agregado al carrito.`)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
