/**
 * Recorta el PNG del logo a su contenido real y genera las variantes que
 * usa la tienda:
 *
 *   public/logo.png              lockup completo, en tinta
 *   public/logo-blanco.png       lockup completo, en blanco (fondo oscuro)
 *   public/logo-escudo.png       sólo la marca (cabeza + arco), en tinta
 *   public/logo-escudo-blanco.png la marca en blanco
 *
 *   node scripts/logo.mjs
 *
 * Sin dependencias: decodifica y codifica PNG a mano con zlib.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync, inflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGEN = join(RAIZ, 'public', 'logo.png')

/** Fracción del alto donde termina la marca y empieza el texto. */
const CORTE_MARCA = 0.49

const FIRMA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/* ── lectura ─────────────────────────────────────────────── */

function leerChunks(buffer) {
  if (!buffer.subarray(0, 8).equals(FIRMA)) throw new Error('no es un PNG')
  const chunks = []
  let i = 8
  while (i < buffer.length) {
    const largo = buffer.readUInt32BE(i)
    const tipo = buffer.toString('ascii', i + 4, i + 8)
    chunks.push({ tipo, datos: buffer.subarray(i + 8, i + 8 + largo) })
    i += 12 + largo
  }
  return chunks
}

const CANALES = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

/** Devuelve los píxeles como Buffer RGBA. */
function aRGBA(buffer) {
  const chunks = leerChunks(buffer)
  const c = chunks.find((x) => x.tipo === 'IHDR')
  const ancho = c.datos.readUInt32BE(0)
  const alto = c.datos.readUInt32BE(4)
  const profundidad = c.datos[8]
  const tipoColor = c.datos[9]
  const interlace = c.datos[12]

  if (interlace !== 0) throw new Error('PNG entrelazado no soportado')
  if (profundidad !== 8) throw new Error('sólo profundidad 8')

  const canales = CANALES[tipoColor]
  const idat = Buffer.concat(
    chunks.filter((x) => x.tipo === 'IDAT').map((x) => x.datos),
  )
  const crudo = inflateSync(idat)

  const bpp = canales
  const paso = ancho * bpp
  const pixeles = Buffer.alloc(ancho * alto * 4)
  const fila = Buffer.alloc(paso)
  let anterior = Buffer.alloc(paso)
  let offset = 0

  for (let y = 0; y < alto; y++) {
    const filtro = crudo[offset++]
    for (let x = 0; x < paso; x++) fila[x] = crudo[offset + x]
    offset += paso

    for (let x = 0; x < paso; x++) {
      const a = x >= bpp ? fila[x - bpp] : 0
      const b = anterior[x]
      const cc = x >= bpp ? anterior[x - bpp] : 0
      switch (filtro) {
        case 1:
          fila[x] = (fila[x] + a) & 0xff
          break
        case 2:
          fila[x] = (fila[x] + b) & 0xff
          break
        case 3:
          fila[x] = (fila[x] + ((a + b) >> 1)) & 0xff
          break
        case 4:
          fila[x] = (fila[x] + paeth(a, b, cc)) & 0xff
          break
      }
    }

    for (let x = 0; x < ancho; x++) {
      const p = x * canales
      const d = (y * ancho + x) * 4
      if (canales === 4) {
        pixeles[d] = fila[p]
        pixeles[d + 1] = fila[p + 1]
        pixeles[d + 2] = fila[p + 2]
        pixeles[d + 3] = fila[p + 3]
      } else if (canales === 3) {
        pixeles[d] = fila[p]
        pixeles[d + 1] = fila[p + 1]
        pixeles[d + 2] = fila[p + 2]
        pixeles[d + 3] = 255
      } else if (canales === 2) {
        pixeles[d] = pixeles[d + 1] = pixeles[d + 2] = fila[p]
        pixeles[d + 3] = fila[p + 1]
      } else {
        pixeles[d] = pixeles[d + 1] = pixeles[d + 2] = fila[p]
        pixeles[d + 3] = 255
      }
    }
    anterior = Buffer.from(fila)
  }

  return { ancho, alto, pixeles }
}

/* ── escritura ───────────────────────────────────────────── */

const TABLA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i++)
    c = TABLA_CRC[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

function escribirPNG(ancho, alto, pixeles) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA

  const paso = ancho * 4
  const crudo = Buffer.alloc(alto * (paso + 1))
  for (let y = 0; y < alto; y++) {
    crudo[y * (paso + 1)] = 0 // filtro None
    pixeles.copy(
      crudo,
      y * (paso + 1) + 1,
      y * paso,
      (y + 1) * paso,
    )
  }

  return Buffer.concat([
    FIRMA,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(crudo, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ── proceso ─────────────────────────────────────────────── */

const original = readFileSync(ORIGEN)
const img = aRGBA(original)

/** Caja de contenido visible (alfa por encima del umbral). */
function caja(px, ancho, alto, yDesde = 0, yHasta = alto) {
  const UMBRAL = 8
  let minX = ancho
  let minY = alto
  let maxX = -1
  let maxY = -1
  for (let y = yDesde; y < yHasta; y++) {
    for (let x = 0; x < ancho; x++) {
      if (px[(y * ancho + x) * 4 + 3] > UMBRAL) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return { minX, minY, maxX, maxY }
}

const global = caja(img.pixeles, img.ancho, img.alto)
if (global.maxX < 0) throw new Error('el PNG no tiene contenido visible')

const MARGEN = Math.round(Math.max(img.ancho, img.alto) * 0.02)
const x0 = Math.max(0, global.minX - MARGEN)
const y0 = Math.max(0, global.minY - MARGEN)
const x1 = Math.min(img.ancho, global.maxX + 1 + MARGEN)
const y1 = Math.min(img.alto, global.maxY + 1 + MARGEN)

console.log(
  `origen: ${img.ancho}×${img.alto} · recorte: (${x0},${y0}) → (${x1},${y1})`,
)

/**
 * Extrae una banda vertical del recorte y la escribe.
 * `blanco` mapea el arte a blanco puro.
 */
function banda(nombre, yDesde, yHasta, blanco) {
  const bandaPx = img.pixeles.subarray(
    yDesde * img.ancho * 4,
    yHasta * img.ancho * 4,
  )
  const cajaBanda = caja(bandaPx, img.ancho, yHasta - yDesde)
  if (cajaBanda.maxX < 0) {
    console.log(`  ${nombre}: banda vacía, se omite`)
    return
  }

  const mx = Math.round((x1 - x0) * 0.02)
  const bx0 = Math.max(0, cajaBanda.minX - mx)
  const bx1 = Math.min(img.ancho, cajaBanda.maxX + 1 + mx)
  const by0 = Math.max(0, cajaBanda.minY - mx)
  const by1 = Math.min(yHasta - yDesde, cajaBanda.maxY + 1 + mx)

  const ancho = bx1 - bx0
  const alto = by1 - by0
  const salida = Buffer.alloc(ancho * alto * 4)

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const origen = ((y + by0 + yDesde) * img.ancho + (x + bx0)) * 4
      const destino = (y * ancho + x) * 4
      const a = img.pixeles[origen + 3]
      if (blanco) {
        salida[destino] = 255
        salida[destino + 1] = 255
        salida[destino + 2] = 255
      } else {
        salida[destino] = img.pixeles[origen]
        salida[destino + 1] = img.pixeles[origen + 1]
        salida[destino + 2] = img.pixeles[origen + 2]
      }
      salida[destino + 3] = a
    }
  }

  writeFileSync(
    join(RAIZ, 'public', nombre),
    escribirPNG(ancho, alto, salida),
  )
  console.log(`  ${nombre}: ${ancho}×${alto}`)
}

const altoContenido = y1 - y0
const corte = y0 + Math.round(altoContenido * CORTE_MARCA)

console.log('escritos:')
banda('logo.png', y0, y1, false)
banda('logo-blanco.png', y0, y1, true)
banda('logo-escudo.png', y0, corte, false)
banda('logo-escudo-blanco.png', y0, corte, true)
