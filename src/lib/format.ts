const fmtMoneda = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const fmtMonedaEntera = new Intl.NumberFormat('es-GT', {
  maximumFractionDigits: 0,
})

/** "Q 1,234.50" */
export function moneda(n: number): string {
  return `Q ${fmtMoneda.format(n)}`
}

/** "Q1,234" — para rótulos de KPI donde los centavos no aportan. */
export function monedaCorta(n: number): string {
  return `Q${fmtMonedaEntera.format(n)}`
}

/** "Q12.4K" — para ejes de gráficos. */
export function monedaCompakta(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `Q${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `Q${(n / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`
  return `Q${fmtMonedaEntera.format(n)}`
}

export function numero(n: number): string {
  return fmtMonedaEntera.format(n)
}

export function porcentaje(n: number, decimales = 0): string {
  return `${n.toFixed(decimales)}%`
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "23 oct 2026" */
export function fecha(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** "23 oct" */
export function fechaCorta(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

/** Etiqueta de semana en curso: "sem 43" */
export function etiquetaSemana(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const inicio = new Date(d.getFullYear(), 0, 1)
  const semana = Math.ceil(((d.getTime() - inicio.getTime()) / 86400000 + inicio.getDay() + 1) / 7)
  return `sem ${semana}`
}

export function diasDesde(iso: string): number {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return 0
  const hoy = new Date()
  hoy.setHours(12, 0, 0, 0)
  return Math.max(0, Math.round((hoy.getTime() - d.getTime()) / 86400000))
}

/** "hace 3 días" / "hoy" */
export function tiempoRelativo(iso: string): string {
  const d = diasDesde(iso)
  if (d === 0) return 'hoy'
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  if (d < 30) return `hace ${Math.floor(d / 7)} sem`
  if (d < 365) return `hace ${Math.floor(d / 30)} meses`
  return `hace ${Math.floor(d / 365)} años`
}

/** Normaliza un teléfono a dígitos, con prefijo de Guatemala cuando falta. */
export function telefonoDigitos(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, '')
  if (soloDigitos.startsWith('502')) return soloDigitos
  if (soloDigitos.length === 8) return `502${soloDigitos}`
  return soloDigitos
}

export function slug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
