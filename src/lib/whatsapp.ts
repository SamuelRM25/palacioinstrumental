import type { Cliente, ConfigTienda, Cotizacion, Producto } from '../types'
import { moneda, telefonoDigitos } from './format'

/** Enlace de WhatsApp con un mensaje ya redactado. */
export function enlaceWhatsapp(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefonoDigitos(telefono)}?text=${encodeURIComponent(mensaje)}`
}

/** Enlace de WhatsApp al número de la tienda (sin texto). */
export function enlaceWhatsappTienda(config: ConfigTienda, mensaje?: string): string {
  const base = `https://wa.me/${telefonoDigitos(config.whatsapp)}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}

/** Mensaje de contacto directo con el asesor. */
export function mensajeContacto(
  cliente: Cliente,
  config: ConfigTienda,
  contexto?: string,
): string {
  const partes = [`Hola ${config.nombre}, te escribo ${cliente.nombre}.`]
  if (contexto) partes.push(contexto)
  return partes.join(' ')
}

/** Resumen de la cotización para mandar por WhatsApp. */
export function mensajeCotizacion(
  cot: Cotizacion,
  cliente: Cliente,
  config: ConfigTienda,
  productos: Producto[],
): string {
  const lineas = cot.lineas.map((l) => {
    const p = productos.find((x) => x.id === l.productoId)
    const nombre = p ? p.nombre : 'Producto'
    return `• ${nombre} x${l.cantidad} — ${moneda(l.precioUnitario * l.cantidad)}`
  })

  const plan =
    cot.plan.meses === 0
      ? 'Contado'
      : `${cot.plan.meses} cuotas de ${moneda(cot.total / cot.plan.meses)}`

  return [
    `Hola ${cliente.nombre}, aquí tienes tu cotización de *${config.nombre}* (${cot.folio}).`,
    '',
    ...lineas,
    '',
    `*Total: ${moneda(cot.total)}*`,
    `Plan de pago: ${plan}`,
    cot.envio > 0 ? `Envío: ${moneda(cot.envio)}` : 'Envío sin costo',
    '',
    'Quedo al pendiente de tus comentarios.',
  ].join('\n')
}
