import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { Cliente, ConfigTienda, Cotizacion, Producto } from '../types'
import { fecha, moneda } from './format'

const TINTA: [number, number, number] = [23, 19, 15]
const TINTA_SUAVE: [number, number, number] = [110, 100, 89]
const OX: [number, number, number] = [110, 31, 44]
const LATON: [number, number, number] = [168, 130, 58]
const PAPEL: [number, number, number] = [244, 239, 229]
const REGLA: [number, number, number] = [201, 191, 174]

let cacheLogo: string | null | undefined

/** Carga el escudo una sola vez y lo reutiliza entre cotizaciones. */
function cargarEscudo(): Promise<string | null> {
  if (cacheLogo !== undefined) return Promise.resolve(cacheLogo)
  return fetch('/logo.png')
    .then((r) => (r.ok ? r.blob() : null))
    .then(
      (blob) =>
        new Promise<string | null>((resolve) => {
          if (!blob) {
            cacheLogo = null
            resolve(null)
            return
          }
          const lector = new FileReader()
          lector.onload = () => {
            cacheLogo = String(lector.result)
            resolve(cacheLogo)
          }
          lector.onerror = () => {
            cacheLogo = null
            resolve(null)
          }
          lector.readAsDataURL(blob)
        }),
    )
    .catch(() => {
      cacheLogo = null
      return null
    })
}

export async function generarPDFCotizacion(
  cot: Cotizacion,
  cliente: Cliente,
  config: ConfigTienda,
  productos: Producto[],
): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const ancho = doc.internal.pageSize.getWidth()
  const alto = doc.internal.pageSize.getHeight()
  const M = 44
  const escudo = await cargarEscudo()

  // ── Fondo de papel y filete superior ──────────────────────────────────
  doc.setFillColor(...PAPEL)
  doc.rect(0, 0, ancho, alto, 'F')
  doc.setFillColor(...OX)
  doc.rect(0, 0, ancho, 6, 'F')

  let y = 46

  // ── Encabezado ──────────────────────────────────────────────────────────
  if (escudo) {
    try {
      doc.addImage(escudo, 'PNG', M, y - 4, 74, 74)
    } catch {
      /* si el escudo no se puede decodificar, el documento sigue su curso */
    }
  }
  doc.setTextColor(...OX)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('COTIZACIÓN', M + (escudo ? 92 : 0), y + 8)

  doc.setTextColor(...TINTA)
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.text(config.nombre, M + (escudo ? 92 : 0), y + 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TINTA_SUAVE)
  doc.text(config.lema, M + (escudo ? 92 : 0), y + 42)

  // Bloque folio + fecha, a la derecha
  doc.setTextColor(...TINTA)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(cot.folio, ancho - M, y + 10, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TINTA_SUAVE)
  doc.text(fecha(cot.creadaEn), ancho - M, y + 24, { align: 'right' })
  doc.text(`Válida por 15 días`, ancho - M, y + 36, { align: 'right' })

  y += 96
  doc.setDrawColor(...REGLA)
  doc.setLineWidth(0.75)
  doc.line(M, y, ancho - M, y)
  y += 26

  // ── Cliente y tienda ────────────────────────────────────────────────────
  const bloqueIzq = [
    ['CLIENTE', cliente.nombre],
    ['Teléfono', cliente.telefono],
    ...(cliente.email ? [['Correo', cliente.email]] : []),
    ['Ciudad', cliente.ciudad],
  ]
  const bloqueDer = [
    [config.nombre, config.direccion],
    ['', config.telefono],
    ['', config.email],
    ['', config.horarios],
  ]

  let yi = y
  bloqueIzq.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...OX)
    doc.text(k.toUpperCase(), M, yi)
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...TINTA)
    doc.text(v, M, yi + 11)
    yi += i === 0 ? 26 : 14
  })

  let yd = y
  bloqueDer.forEach(([k, v], i) => {
    doc.setFont('helvetica', i === 0 ? 'bold' : 'normal')
    doc.setFontSize(i === 0 ? 9 : 8)
    doc.setTextColor(...TINTA)
    doc.text(k, ancho - M, yd, { align: 'right' })
    if (v) {
      doc.setTextColor(...TINTA_SUAVE)
      doc.text(v, ancho - M, yd + 11, { align: 'right' })
    }
    yd += i === 0 ? 24 : 12
  })

  y = Math.max(yi, yd) + 18

  // ── Tabla de artículos ──────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Producto', 'SKU', 'Cant.', 'Precio', 'Dcto.', 'Total']],
    body: cot.lineas.map((l) => {
      const p = productos.find((x) => x.id === l.productoId)
      return [
        p ? p.nombre : 'Producto retirado',
        p ? p.sku : '—',
        String(l.cantidad),
        moneda(l.precioUnitario),
        l.descuentoPct > 0 ? `${l.descuentoPct}%` : '—',
        moneda(l.precioUnitario * l.cantidad),
      ]
    }),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 8,
      textColor: TINTA,
      lineColor: REGLA,
      lineWidth: 0.5,
    },
    headStyles: {
      fontSize: 7,
      fontStyle: 'bold',
      textColor: OX,
      lineWidth: { bottom: 1 },
      lineColor: OX,
    },
    bodyStyles: { lineWidth: { bottom: 0.5 }, lineColor: REGLA },
    columnStyles: {
      0: { cellWidth: 168 },
      1: { cellWidth: 84, font: 'courier', fontSize: 7.5, textColor: TINTA_SUAVE },
      2: { cellWidth: 34, halign: 'center' },
      3: { cellWidth: 78, halign: 'right', font: 'courier' },
      4: { cellWidth: 44, halign: 'right', font: 'courier' },
      5: { cellWidth: 88, halign: 'right', font: 'courier' },
    },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22

  // ── Totales ─────────────────────────────────────────────────────────────
  const xTotales = ancho - M - 210
  const filas: [string, string, boolean][] = [
    ['Subtotal', moneda(cot.subtotal), false],
    ...(cot.descuento > 0
      ? ([['Descuento', `− ${moneda(cot.descuento)}`, false]] as [string, string, boolean][])
      : []),
    ['Envío', cot.envio === 0 ? 'Sin costo' : moneda(cot.envio), false],
  ]

  filas.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...TINTA_SUAVE)
    doc.text(k, xTotales, y)
    doc.setTextColor(...TINTA)
    doc.text(v, ancho - M, y, { align: 'right' })
    y += 15
  })

  doc.setDrawColor(...OX)
  doc.setLineWidth(1)
  doc.line(xTotales, y - 4, ancho - M, y - 4)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...OX)
  doc.text('TOTAL', xTotales, y)
  doc.setFontSize(16)
  doc.setTextColor(...TINTA)
  doc.text(moneda(cot.total), ancho - M, y + 1, { align: 'right' })
  y += 22

  // Plan de pago
  const plan =
    cot.plan.meses === 0
      ? 'Pago contra entrega'
      : `${cot.plan.meses} cuotas de ${moneda(cot.total / cot.plan.meses)} (${cot.plan.interesPct}% de interés)`
  doc.setFillColor(...PAPEL)
  doc.setDrawColor(...LATON)
  doc.setLineWidth(0.75)
  doc.roundedRect(xTotales, y, 210, 34, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...OX)
  doc.text('PLAN DE PAGO', xTotales + 10, y + 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...TINTA)
  doc.text(plan, xTotales + 10, y + 26)

  // ── Condiciones ─────────────────────────────────────────────────────────
  y += 54
  doc.setDrawColor(...REGLA)
  doc.setLineWidth(0.75)
  doc.line(M, y, ancho - M, y)
  y += 18

  const condiciones = [
    `Garantía de ${config.garantiaMeses} meses sobre defectos de fábrica, en los artículos de marca.`,
    cot.envio === 0
      ? 'Envío sin costo dentro de la ciudad Capital.'
      : `Envío nacional: ${moneda(config.envioNacional)}. Sin costo en compras mayores a ${moneda(config.envioGratisDesde)}.`,
    'Precios en quetzales, con IVA incluido.',
    'Precio y disponibilidad sujetos a confirmación al momento de confirmar el pedido.',
  ]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...OX)
  doc.text('CONDICIONES', M, y)
  y += 13
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TINTA_SUAVE)
  for (const c of condiciones) {
    const partes = doc.splitTextToSize(`·  ${c}`, ancho - M * 2)
    doc.text(partes, M, y)
    y += partes.length * 11 + 3
  }

  // ── Pie ─────────────────────────────────────────────────────────────────
  const pieY = alto - 46
  doc.setDrawColor(...REGLA)
  doc.line(M, pieY - 14, ancho - M, pieY - 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TINTA_SUAVE)
  doc.text(`${config.nombre} · ${config.direccion}`, M, pieY)
  doc.text(`${config.telefono} · ${config.email}`, M, pieY + 10)
  doc.text('Documento de demostración sin valor fiscal', ancho - M, pieY, {
    align: 'right',
  })
  doc.text(cot.folio, ancho - M, pieY + 10, { align: 'right' })

  doc.save(`${cot.folio}-${cliente.nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}
