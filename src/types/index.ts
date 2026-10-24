export type CategoriaId =
  | 'guitarras'
  | 'bajos'
  | 'teclados'
  | 'bateria'
  | 'amplificadores'
  | 'audio'
  | 'grabacion'
  | 'microfonos'
  | 'cables-cuerdas'
  | 'dj'
  | 'accesorios'
  | 'vientos'

export interface Categoria {
  id: CategoriaId
  nombre: string
  /** Etiqueta corta para el diapasón, donde el espacio es escaso. */
  corto: string
}

export interface Spec {
  etiqueta: string
  valor: string
}

export interface Producto {
  id: string
  sku: string
  nombre: string
  marca: string
  categoria: CategoriaId
  precio: number
  costo: number
  stock: number
  reservado: number
  specs: Spec[]
  destacado?: boolean
  nuevo?: boolean
}

export type TipoCliente = 'consumidor' | 'banda' | 'estudio' | 'evento' | 'colegio'
export type CanalCliente = 'whatsapp' | 'visita' | 'telefono' | 'web' | 'referido'

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  email?: string
  tipo: TipoCliente
  canal: CanalCliente
  ciudad: string
  notas: string
  creadoEn: string
  ultimaActividad: string
}

export type Etapa = 'nuevo' | 'enviada' | 'negociando' | 'aprobada' | 'cerrada' | 'perdida'

export interface LineaCotizacion {
  productoId: string
  cantidad: number
  precioUnitario: number
  descuentoPct: number
}

export interface PlanPago {
  /** 0 = contado. */
  meses: number
  interesPct: number
}

export interface Cotizacion {
  id: string
  folio: string
  clienteId: string
  lineas: LineaCotizacion[]
  subtotal: number
  descuento: number
  envio: number
  total: number
  plan: PlanPago
  etapa: Etapa
  vendedor: string
  creadaEn: string
  notas: string
  enviadaEn?: string
  cerradaEn?: string
}

export interface Vendedor {
  id: string
  nombre: string
  inicial: string
}

export interface ConfigTienda {
  nombre: string
  lema: string
  whatsapp: string
  telefono: string
  email: string
  direccion: string
  horarios: string
  ivaPct: number
  mesesCredito: number[]
  interesPct: number
  envioLocal: number
  envioNacional: number
  envioGratisDesde: number
  garantiaMeses: number
}
