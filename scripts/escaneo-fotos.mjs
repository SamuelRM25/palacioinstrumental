/**
 * Escanea `public/productos/` y genera `src/data/fotos.generated.ts`
 * con el mapa SKU → ruta de la fotografía.
 *
 *   node scripts/escaneo-fotos.mjs
 *
 * Basta con dejar un archivo llamado `{SKU}.jpg` (o .jpeg/.png/.webp,
 * sin distinguir mayúsculas) en esa carpeta para que la tienda lo use
 * automáticamente. Si no hay foto, la ilustración de estudio aparece.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const CARPETA = join(RAIZ, 'public', 'productos')
const SALIDA = join(RAIZ, 'src', 'data', 'fotos.generated.ts')

const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

/** El SKU del catálogo, para avisar de fotos que no corresponden a nada. */
function skusDelCatalogo() {
  const fuente = readFileSync(join(RAIZ, 'src', 'data', 'catalogo.ts'), 'utf8')
  return new Set([...fuente.matchAll(/sku:\s*'([^']+)'/g)].map((m) => m[1]))
}

const fotos = {}

if (existsSync(CARPETA)) {
  const skus = skusDelCatalogo()
  const huerfanos = []

  for (const archivo of readdirSync(CARPETA)) {
    const punto = archivo.lastIndexOf('.')
    if (punto < 0) continue
    const extension = archivo.slice(punto).toLowerCase()
    if (!EXTENSIONES.includes(extension)) continue

    const sku = archivo.slice(0, punto).toUpperCase()
    if (!skus.has(sku)) {
      huerfanos.push(archivo)
      continue
    }
    fotos[sku] = `/productos/${archivo}`
  }

  if (huerfanos.length) {
    console.log(`sin coincidencia en el catálogo: ${huerfanos.join(', ')}`)
  }
}

const cuerpo = `/* Generado por scripts/escaneo-fotos.mjs — no editar a mano. */

export const FOTOS: Record<string, string> = ${JSON.stringify(fotos, null, 2)}
`

writeFileSync(SALIDA, cuerpo)
console.log(
  `fotos: ${Object.keys(fotos).length} · escrito ${SALIDA.replace(RAIZ + '/', '')}`,
)
