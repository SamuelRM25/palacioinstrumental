import type { Categoria, ConfigTienda, Vendedor } from '../types'

export const CATEGORIAS: Categoria[] = [
  { id: 'guitarras', nombre: 'Guitarras', corto: 'Guitarras' },
  { id: 'bajos', nombre: 'Bajos', corto: 'Bajos' },
  { id: 'teclados', nombre: 'Teclados y pianos', corto: 'Teclados' },
  { id: 'bateria', nombre: 'Batería y percusión', corto: 'Batería' },
  { id: 'amplificadores', nombre: 'Amplificadores', corto: 'Amplif.' },
  { id: 'audio', nombre: 'Audio profesional', corto: 'Audio' },
  { id: 'grabacion', nombre: 'Estudio y grabación', corto: 'Estudio' },
  { id: 'microfonos', nombre: 'Micrófonos', corto: 'Micrófonos' },
  { id: 'cables-cuerdas', nombre: 'Cables y cuerdas', corto: 'Cables' },
  { id: 'dj', nombre: 'DJ y controladores', corto: 'DJ' },
  { id: 'accesorios', nombre: 'Accesorios', corto: 'Accesorios' },
  { id: 'vientos', nombre: 'Vientos', corto: 'Vientos' },
]

export const VENDEDORES: Vendedor[] = [
  { id: 'v1', nombre: 'Ana Lucía Batres', inicial: 'AB' },
  { id: 'v2', nombre: 'Mario Estrada', inicial: 'ME' },
  { id: 'v3', nombre: 'Karla Quiñónez', inicial: 'KQ' },
]

export const CONFIG_TIENDA: ConfigTienda = {
  nombre: 'Palacio Instrumental',
  lema: 'Instrumentos y audio profesional · desde 1978',
  whatsapp: '50232346362',
  telefono: '+502 3234-6362',
  email: 'ventas@palacioinstrumental.com',
  direccion: 'Las Vegas, Zona 11, Huehuetenango, Huehuetenango',
  horarios: 'Lunes a viernes 9:00–18:00 · Sábados 9:00–13:00',
  ivaPct: 12,
  mesesCredito: [0, 3, 6, 12],
  interesPct: 8.5,
  envioLocal: 0,
  envioNacional: 90,
  envioGratisDesde: 1500,
  garantiaMeses: 12,
}

/** Etapas del pipeline, en orden. El orden codifica la secuencia real de venta. */
export const ETAPAS = [
  { id: 'nuevo', nombre: 'Nueva', descripcion: 'Petición recibida, sin responder' },
  { id: 'enviada', nombre: 'Enviada', descripcion: 'Cotización entregada al cliente' },
  { id: 'negociando', nombre: 'Negociando', descripcion: 'En discusión de precio o configuración' },
  { id: 'aprobada', nombre: 'Aprobada', descripcion: 'Aceptada, pendiente de coordinar entrega' },
  { id: 'cerrada', nombre: 'Cerrada', descripcion: 'Venta concretada' },
  { id: 'perdida', nombre: 'Perdida', descripcion: 'Sin cierre' },
] as const

export const ETAPA_INFO: Record<string, { nombre: string; descripcion: string; color: string }> = {
  nuevo: { nombre: 'Nueva', descripcion: 'Petición recibida, sin responder', color: 'ink' },
  enviada: { nombre: 'Enviada', descripcion: 'Cotización entregada al cliente', color: 'brass' },
  negociando: { nombre: 'Negociando', descripcion: 'En discusión de precio o configuración', color: 'amber' },
  aprobada: { nombre: 'Aprobada', descripcion: 'Aceptada, pendiente de coordinar entrega', color: 'pine' },
  cerrada: { nombre: 'Cerrada', descripcion: 'Venta concretada', color: 'oxblood' },
  perdida: { nombre: 'Perdida', descripcion: 'Sin cierre', color: 'muted' },
}
