import type { CategoriaId, Producto } from '../types'
import { CATEGORIAS } from '../data/config'

/** Artículos de una familia. */
export function deFamilia(productos: Producto[], familia: CategoriaId): Producto[] {
  return productos.filter((p) => p.categoria === familia)
}

/** Cuántos artículos hay en cada familia. */
export function conteoPorFamilia(productos: Producto[]): Record<string, number> {
  const conteo: Record<string, number> = {}
  for (const familia of CATEGORIAS) {
    conteo[familia.id] = deFamilia(productos, familia.id).length
  }
  return conteo
}

/** Precio más bajo de una familia (o de todo el catálogo). */
export function precioDesde(
  productos: Producto[],
  familia?: CategoriaId,
): number {
  const lista = familia ? deFamilia(productos, familia) : productos
  if (!lista.length) return 0
  return Math.min(...lista.map((p) => p.precio))
}

/** Marcas del catálogo, ordenadas alfabéticamente. */
export function marcas(productos: Producto[]): string[] {
  return [...new Set(productos.map((p) => p.marca))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
}

/** Existencia real: lo reservado por cotizaciones ya no está disponible. */
export function disponibles(producto: Producto): number {
  return Math.max(0, producto.stock - producto.reservado)
}

export function estaAgotado(producto: Producto): boolean {
  return disponibles(producto) <= 0
}

/** Pocas existencias: se avisa antes de que se termine. */
export function quedanPocas(producto: Producto): boolean {
  const n = disponibles(producto)
  return n > 0 && n <= 2
}

/** Cinta sobre la imagen de la tarjeta: sólo lo que hay que saber al vuelo. */
export function estadoProducto(
  producto: Producto,
): { texto: string; tono: 'neutro' | 'alerta' | 'acento' | 'tinta' } | null {
  if (estaAgotado(producto)) return { texto: 'Agotado', tono: 'alerta' }
  if (producto.nuevo) return { texto: 'Novedad', tono: 'acento' }
  return null
}

/** En la ficha del artículo sí avisamos cuándo quedan pocas unidades. */
export function estadoFicha(
  producto: Producto,
): { texto: string; tono: 'neutro' | 'alerta' | 'acento' | 'tinta' } | null {
  if (estaAgotado(producto)) return { texto: 'Agotado', tono: 'alerta' }
  if (quedanPocas(producto)) return { texto: `Últimas ${disponibles(producto)}`, tono: 'neutro' }
  if (producto.nuevo) return { texto: 'Novedad', tono: 'acento' }
  return null
}

/** Total con interés simple proporcional al plazo. */
export function totalConInteres(
  base: number,
  meses: number,
  interesPct: number,
): number {
  if (meses <= 0) return base
  return base * (1 + (interesPct / 100) * (meses / 12))
}

/* ── filtros del catálogo ─────────────────────────────────── */

export const RANGOS_PRECIO = [
  { id: 'todos', etiqueta: 'Cualquier precio', min: 0, max: Number.POSITIVE_INFINITY },
  { id: 'bajo', etiqueta: 'Hasta Q500', min: 0, max: 500 },
  { id: 'medio', etiqueta: 'Q500 – Q1,500', min: 500, max: 1500 },
  { id: 'alto', etiqueta: 'Q1,500 – Q5,000', min: 1500, max: 5000 },
  { id: 'muy-alto', etiqueta: 'Q5,000 – Q15,000', min: 5000, max: 15000 },
  { id: 'top', etiqueta: 'Más de Q15,000', min: 15000, max: Number.POSITIVE_INFINITY },
]

export const ORDENES = [
  { id: 'relevancia', etiqueta: 'Relevancia' },
  { id: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { id: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { id: 'nombre', etiqueta: 'Nombre A–Z' },
  { id: 'nuevos', etiqueta: 'Novedades primero' },
]

export interface FiltrosCatalogo {
  /** `todas` o un id de familia. */
  familia: string
  /** Marca concreta o cadena vacía para todas. */
  marca: string
  /** Id del tramo de precio en `RANGOS_PRECIO`. */
  rango: string
  /** Sólo artículos con existencias. */
  solo: boolean
  /** Id del criterio en `ORDENES`. */
  orden: string
}

export const FILTROS_INICIALES: FiltrosCatalogo = {
  familia: 'todas',
  marca: '',
  rango: 'todos',
  solo: false,
  orden: 'relevancia',
}

/** Aplica los filtros al catálogo. */
export function aplicarFiltros(
  productos: Producto[],
  filtros: FiltrosCatalogo,
  consulta: string,
): Producto[] {
  const rango = RANGOS_PRECIO.find((r) => r.id === filtros.rango) ?? RANGOS_PRECIO[0]
  const texto = consulta.trim().toLowerCase()

  const filtrados = productos.filter((p) => {
    if (filtros.familia !== 'todas' && p.categoria !== filtros.familia) return false
    if (filtros.marca && p.marca !== filtros.marca) return false
    if (p.precio < rango.min || p.precio > rango.max) return false
    if (filtros.solo && estaAgotado(p)) return false
    if (texto) {
      const heno = [
        p.nombre,
        p.marca,
        p.sku,
        ...p.specs.map((s) => `${s.etiqueta} ${s.valor}`),
      ]
        .join(' ')
        .toLowerCase()
      if (!heno.includes(texto)) return false
    }
    return true
  })

  switch (filtros.orden) {
    case 'precio-asc':
      return [...filtrados].sort((a, b) => a.precio - b.precio)
    case 'precio-desc':
      return [...filtrados].sort((a, b) => b.precio - a.precio)
    case 'nombre':
      return [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    case 'nuevos':
      return [...filtrados].sort(
        (a, b) => Number(Boolean(b.nuevo)) - Number(Boolean(a.nuevo)),
      )
    default:
      return [...filtrados].sort(
        (a, b) =>
          Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)) ||
          b.precio - a.precio,
      )
  }
}

/** Marcas con su número de artículos, de más a menos vendidas. */
export function marcasConConteo(productos: Producto[]): { marca: string; n: number }[] {
  const conteo = new Map<string, number>()
  for (const p of productos) conteo.set(p.marca, (conteo.get(p.marca) ?? 0) + 1)
  return [...conteo.entries()]
    .map(([marca, n]) => ({ marca, n }))
    .sort((a, b) => b.n - a.n || a.marca.localeCompare(b.marca, 'es'))
}
