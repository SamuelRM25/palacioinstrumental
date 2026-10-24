import type { Cotizacion, LineaCotizacion, PlanPago } from '../types'
import { CONFIG_TIENDA } from './config'

interface Seed {
  id: string
  folio: string
  clienteId: string
  lineas: LineaCotizacion[]
  plan: PlanPago
  etapa: Cotizacion['etapa']
  vendedor: string
  creadaEn: string
  notas: string
  enviadaEn?: string
  cerradaEn?: string
  /** Override del envío; por defecto se calcula según el total. */
  envio?: number
}

const SEMILLAS: Seed[] = [
  {
    id: 'q001',
    folio: 'COT-2026-0041',
    clienteId: 'c001',
    lineas: [
      { productoId: 'p003', cantidad: 1, precioUnitario: 4850, descuentoPct: 5 },
      { productoId: 'p022', cantidad: 1, precioUnitario: 5800, descuentoPct: 0 },
    ],
    plan: { meses: 6, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'cerrada',
    vendedor: 'v1',
    creadaEn: '2026-08-31',
    enviadaEn: '2026-09-01',
    cerradaEn: '2026-09-12',
    notas: 'Entrega en el local de la zona 7. Cliente pidió afinación de la guitarra antes de salir.',
  },
  {
    id: 'q002',
    folio: 'COT-2026-0042',
    clienteId: 'c002',
    lineas: [
      { productoId: 'p016', cantidad: 2, precioUnitario: 9200, descuentoPct: 8 },
      { productoId: 'p049', cantidad: 10, precioUnitario: 90, descuentoPct: 0 },
    ],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'negociando',
    vendedor: 'v3',
    creadaEn: '2026-09-08',
    enviadaEn: '2026-09-09',
    notas: 'Piden 10% de descuento institucional. Pendiente de aprobación de dirección.',
  },
  {
    id: 'q003',
    folio: 'COT-2026-0043',
    clienteId: 'c003',
    lineas: [
      { productoId: 'p007', cantidad: 1, precioUnitario: 1850, descuentoPct: 0 },
      { productoId: 'p049', cantidad: 2, precioUnitario: 90, descuentoPct: 0 },
    ],
    plan: { meses: 3, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'cerrada',
    vendedor: 'v2',
    creadaEn: '2026-09-13',
    enviadaEn: '2026-09-13',
    cerradaEn: '2026-09-15',
    notas: 'Primera compra. Se llevó funda para guitarra aparte en mostrador.',
  },
  {
    id: 'q004',
    folio: 'COT-2026-0044',
    clienteId: 'c004',
    lineas: [
      { productoId: 'p029', cantidad: 2, precioUnitario: 2450, descuentoPct: 5 },
      { productoId: 'p034', cantidad: 2, precioUnitario: 2450, descuentoPct: 5 },
      { productoId: 'p040', cantidad: 2, precioUnitario: 420, descuentoPct: 0 },
    ],
    plan: { meses: 6, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'cerrada',
    vendedor: 'v1',
    creadaEn: '2026-09-21',
    enviadaEn: '2026-09-22',
    cerradaEn: '2026-09-30',
    notas: 'Sala de control completa. Coincide con el Studio Nómada de 2025.',
  },
  {
    id: 'q005',
    folio: 'COT-2026-0045',
    clienteId: 'c005',
    lineas: [
      { productoId: 'p025', cantidad: 2, precioUnitario: 7900, descuentoPct: 3 },
      { productoId: 'p026', cantidad: 2, precioUnitario: 8600, descuentoPct: 3 },
    ],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'enviada',
    vendedor: 'v2',
    creadaEn: '2026-09-29',
    enviadaEn: '2026-09-29',
    notas: 'Sistema para evento de 400 personas. Incluye instalación y prueba en sitio.',
  },
  {
    id: 'q006',
    folio: 'COT-2026-0046',
    clienteId: 'c006',
    lineas: [
      { productoId: 'p041', cantidad: 4, precioUnitario: 165, descuentoPct: 0 },
      { productoId: 'p038', cantidad: 3, precioUnitario: 95, descuentoPct: 10 },
    ],
    plan: { meses: 0, interesPct: 0 },
    etapa: 'cerrada',
    vendedor: 'v3',
    creadaEn: '2026-10-03',
    enviadaEn: '2026-10-03',
    cerradaEn: '2026-10-05',
    notas: 'Envío a Quetzaltenango por encomienda. Cobró contra entrega.',
  },
  {
    id: 'q007',
    folio: 'COT-2026-0047',
    clienteId: 'c007',
    lineas: [{ productoId: 'p043', cantidad: 1, precioUnitario: 3495, descuentoPct: 0 }],
    plan: { meses: 3, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'nuevo',
    vendedor: 'v1',
    creadaEn: '2026-10-17',
    notas: 'Llegó por la página web. Pregunta si incluye el cable.',
  },
  {
    id: 'q008',
    folio: 'COT-2026-0048',
    clienteId: 'c008',
    lineas: [
      { productoId: 'p020', cantidad: 2, precioUnitario: 4900, descuentoPct: 6 },
      { productoId: 'p037', cantidad: 12, precioUnitario: 185, descuentoPct: 0 },
    ],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'negociando',
    vendedor: 'v2',
    creadaEn: '2026-10-06',
    enviadaEn: '2026-10-07',
    notas: 'Gira de diciembre. Quiere 3 amplifiers de un solo modelo. Contrastar stock.',
  },
  {
    id: 'q009',
    folio: 'COT-2026-0049',
    clienteId: 'c009',
    lineas: [
      { productoId: 'p045', cantidad: 1, precioUnitario: 3495, descuentoPct: 0 },
      { productoId: 'p049', cantidad: 4, precioUnitario: 90, descuentoPct: 0 },
    ],
    plan: { meses: 6, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'enviada',
    vendedor: 'v3',
    creadaEn: '2026-10-12',
    enviadaEn: '2026-10-13',
    notas: 'Controlador DJ portátil para eventos en la costa.',
  },
  {
    id: 'q010',
    folio: 'COT-2026-0050',
    clienteId: 'c010',
    lineas: [{ productoId: 'p053', cantidad: 1, precioUnitario: 6900, descuentoPct: 0 }],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'nuevo',
    vendedor: 'v1',
    creadaEn: '2026-10-20',
    notas: 'Ahorró para saxofón alto. Pide detalles de garantía.',
  },
  {
    id: 'q011',
    folio: 'COT-2026-0051',
    clienteId: 'c011',
    lineas: [{ productoId: 'p012', cantidad: 1, precioUnitario: 7400, descuentoPct: 4 }],
    plan: { meses: 6, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'cerrada',
    vendedor: 'v2',
    creadaEn: '2026-10-09',
    enviadaEn: '2026-10-09',
    cerradaEn: '2026-10-14',
    notas: 'Piano para sala de ensayo. Incluyó pedal y banco en la cotización.',
  },
  {
    id: 'q012',
    folio: 'COT-2026-0052',
    clienteId: 'c012',
    lineas: [{ productoId: 'p030', cantidad: 1, precioUnitario: 2150, descuentoPct: 0 }],
    plan: { meses: 0, interesPct: 0 },
    etapa: 'perdida',
    vendedor: 'v3',
    creadaEn: '2026-09-18',
    enviadaEn: '2026-09-18',
    notas: 'Compró en otra tienda. Volver a contactar en diciembre.',
  },
  {
    id: 'q013',
    folio: 'COT-2026-0053',
    clienteId: 'c013',
    lineas: [
      { productoId: 'p017', cantidad: 1, precioUnitario: 12400, descuentoPct: 10 },
      { productoId: 'p018', cantidad: 2, precioUnitario: 3800, descuentoPct: 10 },
    ],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'negociando',
    vendedor: 'v1',
    creadaEn: '2026-10-15',
    enviadaEn: '2026-10-16',
    notas: 'Renovación del aula de percusión. Requiere dos cotizaciones separadas para el proyecto.',
  },
  {
    id: 'q014',
    folio: 'COT-2026-0054',
    clienteId: 'c014',
    lineas: [{ productoId: 'p047', cantidad: 1, precioUnitario: 310, descuentoPct: 0 }],
    plan: { meses: 0, interesPct: 0 },
    etapa: 'enviada',
    vendedor: 'v2',
    creadaEn: '2026-10-19',
    enviadaEn: '2026-10-19',
    notas: 'Slide para blues. Pregunta por slide de vidrio más grueso.',
  },
  {
    id: 'q015',
    folio: 'COT-2026-0055',
    clienteId: 'c010',
    lineas: [{ productoId: 'p006', cantidad: 1, precioUnitario: 4200, descuentoPct: 5 }],
    plan: { meses: 6, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'cerrada',
    vendedor: 'v3',
    creadaEn: '2026-10-01',
    enviadaEn: '2026-10-01',
    cerradaEn: '2026-10-07',
    notas: 'Guitarra acústica eléctrica como regalo de cumpleaños para su hermana.',
  },
  {
    id: 'q016',
    folio: 'COT-2026-0056',
    clienteId: 'c008',
    lineas: [{ productoId: 'p044', cantidad: 1, precioUnitario: 15995, descuentoPct: 5 }],
    plan: { meses: 12, interesPct: CONFIG_TIENDA.interesPct },
    etapa: 'nuevo',
    vendedor: 'v2',
    creadaEn: '2026-10-22',
    notas: 'Controlador de 4 canales para la sala de la banda. Espera confirmación de stock del proveedor.',
  },
]

/**
 * Calcula los importes derivados de una cotización a partir de sus líneas.
 * Se usa tanto para la semilla como para cada edición posterior, de modo que
 * subtotal, descuento y total nunca se desincronizan de las líneas.
 */
export function calcularTotales(lineas: LineaCotizacion[], envio?: number) {
  const subtotal = lineas.reduce(
    (acc, l) => acc + l.precioUnitario * l.cantidad,
    0,
  )
  const descuento = lineas.reduce(
    (acc, l) => acc + (l.precioUnitario * l.cantidad * l.descuentoPct) / 100,
    0,
  )
  const base = subtotal - descuento
  const envioCalculado =
    envio !== undefined
      ? envio
      : base >= CONFIG_TIENDA.envioGratisDesde
        ? 0
        : CONFIG_TIENDA.envioLocal
  const total = base + envioCalculado
  return { subtotal, descuento, envio: envioCalculado, total }
}

export const COTIZACIONES: Cotizacion[] = SEMILLAS.map((s) => {
  const totales = calcularTotales(s.lineas, s.envio)
  return {
    id: s.id,
    folio: s.folio,
    clienteId: s.clienteId,
    lineas: s.lineas,
    subtotal: totales.subtotal,
    descuento: totales.descuento,
    envio: totales.envio,
    total: totales.total,
    plan: s.plan,
    etapa: s.etapa,
    vendedor: s.vendedor,
    creadaEn: s.creadaEn,
    notas: s.notas,
    enviadaEn: s.enviadaEn,
    cerradaEn: s.cerradaEn,
  }
})

/** Foliador consecutivo para cotizaciones nuevas. */
export function siguienteFolio(existentes: Cotizacion[]): string {
  const anio = new Date().getFullYear()
  const nums = existentes
    .map((c) => {
      const m = c.folio.match(/COT-(\d{4})-(\d{4})/)
      return m && m[1] === String(anio) ? Number(m[2]) : 0
    })
    .filter((n) => n > 0)
  const siguiente = (nums.length ? Math.max(...nums) : 40) + 1
  return `COT-${anio}-${String(siguiente).padStart(4, '0')}`
}
