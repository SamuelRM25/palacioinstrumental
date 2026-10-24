import type { Cotizacion, Cliente, Producto } from '../types'
import { calcularTotales } from '../data/cotizaciones'
import { diasDesde } from './format'

export interface Kpis {
  ventasMes: number
  ventasMesAnterior: number
  cotizacionesAbiertas: number
  valorPipeline: number
  tasaCierre: number
  ticketPromedio: number
  stockBajo: number
  sinResponder: number
}

const ETAPAS_ABIERTAS = new Set(['nuevo', 'enviada', 'negociando', 'aprobada'])

function mesDe(iso: string): string {
  return iso.slice(0, 7)
}

export function calcularKpis(
  cotizaciones: Cotizacion[],
  productos: Producto[],
): Kpis {
  const hoy = new Date()
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
  const mesPrevioDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const mesPrevio = `${mesPrevioDate.getFullYear()}-${String(mesPrevioDate.getMonth() + 1).padStart(2, '0')}`

  const cerradas = cotizaciones.filter((c) => c.etapa === 'cerrada')
  const ventasMes = cerradas
    .filter((c) => mesDe(c.cerradaEn ?? c.creadaEn) === mesActual)
    .reduce((a, c) => a + c.total, 0)
  const ventasMesAnterior = cerradas
    .filter((c) => mesDe(c.cerradaEn ?? c.creadaEn) === mesPrevio)
    .reduce((a, c) => a + c.total, 0)

  const abiertas = cotizaciones.filter((c) => ETAPAS_ABIERTAS.has(c.etapa))
  const valorPipeline = abiertas.reduce((a, c) => a + c.total, 0)
  const decididas = cotizaciones.filter(
    (c) => c.etapa === 'cerrada' || c.etapa === 'perdida',
  )
  const tasaCierre = decididas.length
    ? (decididas.filter((c) => c.etapa === 'cerrada').length / decididas.length) * 100
    : 0
  const ticketPromedio = cerradas.length
    ? cerradas.reduce((a, c) => a + c.total, 0) / cerradas.length
    : 0

  const stockBajo = productos.filter((p) => p.stock - p.reservado <= 2).length
  const sinResponder = cotizaciones.filter(
    (c) => c.etapa === 'nuevo' && diasDesde(c.creadaEn) >= 3,
  ).length

  return {
    ventasMes,
    ventasMesAnterior,
    cotizacionesAbiertas: abiertas.length,
    valorPipeline,
    tasaCierre,
    ticketPromedio,
    stockBajo,
    sinResponder,
  }
}

export interface PuntoSemana {
  etiqueta: string
  inicio: string
  cotizaciones: number
  monto: number
  cerradas: number
  /** Monto de las cotizaciones cerradas dentro de la semana. */
  montoCerrado: number
}

/** Cotizaciones y monto agrupados por semana, de más antigua a más reciente. */
export function cotizacionesPorSemana(
  cotizaciones: Cotizacion[],
  semanas = 8,
): PuntoSemana[] {
  const hoy = new Date()
  hoy.setHours(12, 0, 0, 0)
  // Lunes de la semana actual.
  const inicioHoy = new Date(hoy)
  inicioHoy.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))

  const puntos: PuntoSemana[] = []
  for (let i = semanas - 1; i >= 0; i--) {
    const inicio = new Date(inicioHoy)
    inicio.setDate(inicioHoy.getDate() - i * 7)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    const iso = (d: Date) => d.toISOString().slice(0, 10)
    const dentro = cotizaciones.filter((c) => {
      const f = c.creadaEn.slice(0, 10)
      return f >= iso(inicio) && f <= iso(fin)
    })
    puntos.push({
      etiqueta: `${inicio.getDate()}/${inicio.getMonth() + 1}`,
      inicio: iso(inicio),
      cotizaciones: dentro.length,
      monto: dentro.reduce((a, c) => a + c.total, 0),
      cerradas: dentro.filter((c) => c.etapa === 'cerrada').length,
      montoCerrado: dentro
        .filter((c) => c.etapa === 'cerrada')
        .reduce((a, c) => a + c.total, 0),
    })
  }
  return puntos
}

export interface FilaCategoria {
  categoria: string
  monto: number
  unidades: number
}

export function ventasPorCategoria(
  cotizaciones: Cotizacion[],
  productos: Producto[],
): FilaCategoria[] {
  const porId = new Map(productos.map((p) => [p.id, p]))
  const mapa = new Map<string, FilaCategoria>()
  for (const cot of cotizaciones) {
    if (cot.etapa !== 'cerrada') continue
    for (const linea of cot.lineas) {
      const producto = porId.get(linea.productoId)
      if (!producto) continue
      const actual = mapa.get(producto.categoria) ?? {
        categoria: producto.categoria,
        monto: 0,
        unidades: 0,
      }
      actual.monto += linea.precioUnitario * linea.cantidad
      actual.unidades += linea.cantidad
      mapa.set(producto.categoria, actual)
    }
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto)
}

export interface EtapaEmbudo {
  id: string
  nombre: string
  conteo: number
  monto: number
  /** Porcentaje de la etapa anterior que avanzó. */
  conversion: number
}

const ORDEN_EMBUDO = ['nuevo', 'enviada', 'negociando', 'aprobada', 'cerrada']

export function embudo(cotizaciones: Cotizacion[]): EtapaEmbudo[] {
  const cuenta = ORDEN_EMBUDO.map((id) => {
    const items = cotizaciones.filter((c) => c.etapa === id)
    return {
      id,
      nombre: id,
      conteo: items.length,
      monto: items.reduce((a, c) => a + c.total, 0),
      conversion: 0,
    }
  })
  let anterior = cuenta[0]?.conteo ?? 0
  for (let i = 0; i < cuenta.length; i++) {
    if (i === 0) {
      cuenta[i].conversion = 100
    } else {
      cuenta[i].conversion = anterior ? (cuenta[i].conteo / anterior) * 100 : 0
      anterior = cuenta[i].conteo
    }
  }
  return cuenta
}

export interface Atencion {
  id: string
  tipo: 'sin-respuesta' | 'stock-bajo' | 'cliente-inactivo' | 'cotizacion-vieja'
  titulo: string
  detalle: string
  uri: string
  severidad: 'alta' | 'media'
}

/**
 * Lista de acciones concretas. Cada entrada apunta a algo que el equipo
 * puede resolver, no a una estadística.
 */
export function requiereAtencion(
  cotizaciones: Cotizacion[],
  clientes: Cliente[],
  productos: Producto[],
): Atencion[] {
  const items: Atencion[] = []

  for (const cot of cotizaciones) {
    const dias = diasDesde(cot.creadaEn)
    if (cot.etapa === 'nuevo' && dias >= 3) {
      items.push({
        id: `att-${cot.id}`,
        tipo: 'sin-respuesta',
        titulo: `Sin responder ${dias} días`,
        detalle: `${cot.folio} sigue en “Nueva”.`,
        uri: `/pipeline?cotizacion=${cot.id}`,
        severidad: dias >= 7 ? 'alta' : 'media',
      })
    } else if (cot.etapa === 'enviada' && dias >= 5) {
      items.push({
        id: `att-${cot.id}`,
        tipo: 'cotizacion-vieja',
        titulo: `Enviada hace ${dias} días`,
        detalle: `${cot.folio} no ha tenido respuesta.`,
        uri: `/pipeline?cotizacion=${cot.id}`,
        severidad: 'media',
      })
    }
  }

  for (const p of productos) {
    const disponible = p.stock - p.reservado
    if (disponible <= 0) {
      items.push({
        id: `att-${p.id}`,
        tipo: 'stock-bajo',
        titulo: 'Sin existencias',
        detalle: `${p.nombre} (${p.sku}) agotado.`,
        uri: `/inventario?producto=${p.id}`,
        severidad: 'alta',
      })
    } else if (disponible <= 2) {
      items.push({
        id: `att-${p.id}`,
        tipo: 'stock-bajo',
        titulo: `${disponible} en existencia`,
        detalle: `${p.nombre} (${p.sku}) necesita reposición.`,
        uri: `/inventario?producto=${p.id}`,
        severidad: 'media',
      })
    }
  }

  for (const cli of clientes) {
    const dias = diasDesde(cli.ultimaActividad)
    if (dias >= 75) {
      items.push({
        id: `att-${cli.id}`,
        tipo: 'cliente-inactivo',
        titulo: `${dias} días sin contacto`,
        detalle: `${cli.nombre} no tiene cotizaciones recientes.`,
        uri: `/clientes/${cli.id}`,
        severidad: 'media',
      })
    }
  }

  const peso: Record<Attention['severidad'], number> = { alta: 0, media: 1 }
  return items.sort((a, b) => peso[a.severidad] - peso[b.severidad])
}

export type Attention = Atencion

export interface Actividad {
  id: string
  texto: string
  cuando: string
  uri: string
}

/** Movimientos recientes derivados de las cotizaciones. */
export function actividadReciente(cotizaciones: Cotizacion[]): Actividad[] {
  const movimientos: Actividad[] = []
  for (const cot of cotizaciones) {
    movimientos.push({
      id: `${cot.id}-n`,
      texto: `Se creó ${cot.folio}`,
      cuando: cot.creadaEn,
      uri: `/pipeline?cotizacion=${cot.id}`,
    })
    if (cot.enviadaEn) {
      movimientos.push({
        id: `${cot.id}-e`,
        texto: `${cot.folio} se envió al cliente`,
        cuando: cot.enviadaEn,
        uri: `/pipeline?cotizacion=${cot.id}`,
      })
    }
    if (cot.cerradaEn) {
      movimientos.push({
        id: `${cot.id}-c`,
        texto: `${cot.folio} se cerró`,
        cuando: cot.cerradaEn,
        uri: `/pipeline?cotizacion=${cot.id}`,
      })
    }
  }
  return movimientos.sort((a, b) => (a.cuando < b.cuando ? 1 : -1)).slice(0, 8)
}

/** Recalcula los importes de una cotización tras editar sus líneas. */
export function recalcular(cot: Cotizacion): Cotizacion {
  const totales = calcularTotales(cot.lineas, cot.envio)
  return { ...cot, ...totales }
}
