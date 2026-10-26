import type { ReactNode } from 'react'
import type { CategoriaId } from '../../types'

/**
 * Ilustración de estudio por familia de producto.
 *
 * No es una foto: es una escena — fondo degradado de estudio, luz
 * cenital, silueta rellena del instrumento y sombra de contacto. Cada
 * SKU produce una variación distinta (dirección de la luz, inclinación)
 * para que el catálogo no se vea repetido.
 *
 * Si el producto tiene fotografía real, la tienda la usa en su lugar
 * (ver `ImagenProducto`).
 */

interface Tonos {
  /** Fondo de estudio: luz → sombra */
  fondo1: string
  fondo2: string
  /** Cuerpo del instrumento */
  cuerpo: string
  /** Sombra del cuerpo */
  cuerpo2: string
  /** Panel interior claro (pantallas, rejillas) */
  fondo3: string
  /** Metal, cuerdos o membrana */
  brillo: string
  hardware: string
}

const TONOS: Record<CategoriaId, Tonos> = {
  guitarras: {
    fondo1: '#efe6da',
    fondo3: '#f7f1e8',
    fondo2: '#d8c8b2',
    cuerpo: '#a9713f',
    cuerpo2: '#77491f',
    brillo: '#e2bd8d',
    hardware: '#c9cdd2',
  },
  bajos: {
    fondo1: '#e4e9ee',
    fondo3: '#f0f4f7',
    fondo2: '#c4cfd9',
    cuerpo: '#2f3846',
    cuerpo2: '#191f28',
    brillo: '#596576',
    hardware: '#c9cdd2',
  },
  teclados: {
    fondo1: '#e8ecef',
    fondo3: '#f3f5f7',
    fondo2: '#ccd4db',
    cuerpo: '#262b32',
    cuerpo2: '#14171c',
    brillo: '#f4f5f7',
    hardware: '#c9cdd2',
  },
  bateria: {
    fondo1: '#efe2d7',
    fondo3: '#f7efe8',
    fondo2: '#d9c3b0',
    cuerpo: '#b5502e',
    cuerpo2: '#83381c',
    brillo: '#e9dcc4',
    hardware: '#c9cdd2',
  },
  amplificadores: {
    fondo1: '#e4e6e9',
    fondo3: '#f1f3f5',
    fondo2: '#c3c9cf',
    cuerpo: '#31363d',
    cuerpo2: '#1b1f24',
    brillo: '#c89a4b',
    hardware: '#c9cdd2',
  },
  audio: {
    fondo1: '#e3ebf0',
    fondo3: '#eff5f8',
    fondo2: '#c3d3de',
    cuerpo: '#1f2b35',
    cuerpo2: '#121b23',
    brillo: '#00b8cc',
    hardware: '#c9cdd2',
  },
  grabacion: {
    fondo1: '#e8e7ef',
    fondo3: '#f3f2f7',
    fondo2: '#cdcadd',
    cuerpo: '#2c303b',
    cuerpo2: '#191c23',
    brillo: '#00b8cc',
    hardware: '#c9cdd2',
  },
  microfonos: {
    fondo1: '#e3ebe8',
    fondo3: '#eff5f3',
    fondo2: '#c3d7d2',
    cuerpo: '#3a4048',
    cuerpo2: '#242930',
    brillo: '#00b8cc',
    hardware: '#c9cdd2',
  },
  'cables-cuerdas': {
    fondo1: '#e9eae1',
    fondo3: '#f4f5ee',
    fondo2: '#cfd2c1',
    cuerpo: '#22262b',
    cuerpo2: '#121518',
    brillo: '#c89a4b',
    hardware: '#c9cdd2',
  },
  dj: {
    fondo1: '#e5e7f0',
    fondo3: '#f1f2f8',
    fondo2: '#c7cae1',
    cuerpo: '#282c35',
    cuerpo2: '#161920',
    brillo: '#00b8cc',
    hardware: '#c9cdd2',
  },
  accesorios: {
    fondo1: '#eaeaeb',
    fondo3: '#f3f4f4',
    fondo2: '#cfd0d2',
    cuerpo: '#30353b',
    cuerpo2: '#1d2126',
    brillo: '#00b8cc',
    hardware: '#c9cdd2',
  },
  vientos: {
    fondo1: '#f0e8d9',
    fondo3: '#f8f2e6',
    fondo2: '#dbcfb8',
    cuerpo: '#c89a4b',
    cuerpo2: '#96702f',
    brillo: '#e6c88d',
    hardware: '#c9cdd2',
  },
}

/* ── siluetas ─────────────────────────────────────────────────
   Cada una se dibuja dentro de un lienzo 200×200 y devuelve JSX.
   ─────────────────────────────────────────────────────────── */

function Guitarra({ t, variante }: { t: Tonos; variante: number }) {
  const largo = variante === 1 ? 26 : 20
  return (
    <g>
      {/* mástil y headstock */}
      <path d={`M94 20 h12 l2 66 h-16 z`} fill={t.cuerpo2} />
      <rect x="91" y="8" width="18" height="20" rx="5" fill={t.cuerpo} />
      <rect x="88" y="12" width="4" height="6" rx="2" fill={t.hardware} />
      <rect x="108" y="12" width="4" height="6" rx="2" fill={t.hardware} />
      <rect x="89" y="20" width="4" height="6" rx="2" fill={t.hardware} />
      <rect x="107" y="20" width="4" height="6" rx="2" fill={t.hardware} />
      {/* cuerpo */}
      <path
        d={`M100 84
            c18 0 ${largo + 9} 12 ${largo + 9} 26
            c0 10 -6 15 -6 23
            c0 13 11 21 11 32
            c0 18 -15 29 -34 29
            c-19 0 -34 -11 -34 -29
            c0 -11 11 -19 11 -32
            c0 -8 -6 -13 -6 -23
            c0 -14 11 -26 ${largo + 9} -26 z`}
        fill={t.cuerpo}
      />
      <path
        d={`M100 84 c18 0 ${largo + 9} 12 ${largo + 9} 26 c0 10 -6 15 -6 23 c0 13 11 21 11 32 c0 18 -15 29 -34 29 c-8 0 -15 -2 -20 -6 c22 6 38 -8 38 -28 c0 -11 -11 -19 -11 -32 c0 -8 6 -13 6 -23 c0 -12 -8 -21 -19 -25 c9 -2 19 -2 26 4 z`}
        fill={t.cuerpo2}
        opacity="0.45"
      />
      {/* pastillas y puente */}
      <rect x="88" y="104" width="24" height="7" rx="2" fill={t.cuerpo2} />
      <rect x="88" y="118" width="24" height="7" rx="2" fill={t.cuerpo2} />
      <rect x="83" y="134" width="34" height="6" rx="3" fill={t.hardware} />
      {/* cuerdas */}
      {[96, 99.5, 103].map((x) => (
        <line
          key={x}
          x1={x}
          y1="26"
          x2={x}
          y2="136"
          stroke={t.brillo}
          strokeWidth="0.8"
          opacity="0.75"
        />
      ))}
    </g>
  )
}

function Teclado({ t }: { t: Tonos }) {
  const teclas = 14
  const ancho = 164
  const paso = ancho / teclas
  const negras = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]
  return (
    <g>
      <rect x="18" y="70" width="164" height="76" rx="9" fill={t.cuerpo} />
      <rect x="18" y="70" width="164" height="20" rx="9" fill={t.cuerpo2} />
      <rect x="18" y="84" width="164" height="6" fill={t.cuerpo2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={46 + i * 26} cy="80" r="4" fill={t.hardware} />
      ))}
      <circle cx="168" cy="80" r="3.5" fill={t.brillo} />
      {Array.from({ length: teclas }).map((_, i) => (
        <rect
          key={i}
          x={18 + i * paso + 1}
          y="92"
          width={paso - 2}
          height="48"
          rx="2"
          fill={t.brillo}
        />
      ))}
      {negras.map((i) => (
        <rect
          key={i}
          x={18 + i * paso + paso * 0.62}
          y="92"
          width={paso * 0.72}
          height="28"
          rx="2"
          fill={t.cuerpo2}
        />
      ))}
    </g>
  )
}

function Bateria({ t }: { t: Tonos }) {
  return (
    <g>
      {/* bombo */}
      <ellipse cx="74" cy="128" rx="44" ry="42" fill={t.cuerpo} />
      <ellipse cx="74" cy="128" rx="36" ry="34" fill={t.brillo} />
      <ellipse cx="74" cy="128" rx="44" ry="42" fill="none" stroke={t.cuerpo2} strokeWidth="4" />
      {/* toms */}
      <ellipse cx="128" cy="96" rx="25" ry="21" fill={t.cuerpo} />
      <ellipse cx="128" cy="92" rx="25" ry="21" fill={t.brillo} />
      <ellipse cx="128" cy="92" rx="25" ry="21" fill="none" stroke={t.cuerpo2} strokeWidth="3" />
      <ellipse cx="163" cy="76" rx="18" ry="15" fill={t.cuerpo} />
      <ellipse cx="163" cy="73" rx="18" ry="15" fill={t.brillo} />
      {/* charles */}
      <ellipse cx="30" cy="96" rx="21" ry="17" fill={t.cuerpo} />
      <ellipse cx="30" cy="92" rx="21" ry="17" fill={t.brillo} />
      {/* platillo */}
      <ellipse cx="150" cy="44" rx="32" ry="8" fill={t.hardware} />
      <path d="M150 52 v56" stroke={t.hardware} strokeWidth="3" />
      <ellipse cx="44" cy="56" rx="26" ry="7" fill={t.hardware} />
      <ellipse cx="44" cy="63" rx="26" ry="7" fill={t.hardware} opacity="0.8" />
      <path d="M44 70 v40" stroke={t.hardware} strokeWidth="3" />
    </g>
  )
}

function Amplificador({ t }: { t: Tonos }) {
  return (
    <g>
      <rect x="84" y="44" width="32" height="12" rx="4" fill={t.hardware} />
      <rect x="32" y="54" width="136" height="110" rx="10" fill={t.cuerpo} />
      <rect x="42" y="76" width="116" height="78" rx="5" fill={t.cuerpo2} />
      {Array.from({ length: 11 }).map((_, i) => (
        <rect
          key={i}
          x="46"
          y={80 + i * 6.8}
          width="108"
          height="2.4"
          rx="1.2"
          fill={t.cuerpo}
          opacity="0.75"
        />
      ))}
      <rect x="42" y="58" width="116" height="18" rx="5" fill={t.cuerpo2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={56 + i * 17} cy="67" r="5" fill={t.hardware} />
      ))}
      <circle cx="146" cy="67" r="4" fill={t.brillo} />
      <rect x="36" y="160" width="14" height="8" rx="3" fill={t.cuerpo2} />
      <rect x="150" y="160" width="14" height="8" rx="3" fill={t.cuerpo2} />
    </g>
  )
}

function Bocina({ t }: { t: Tonos }) {
  return (
    <g>
      <path d="M58 56 h84 l14 106 h-112 z" fill={t.cuerpo} />
      <path d="M58 56 h84 l4 30 h-92 z" fill={t.cuerpo2} opacity="0.5" />
      <circle cx="100" cy="120" r="30" fill={t.cuerpo2} />
      <circle cx="100" cy="120" r="12" fill={t.hardware} />
      <circle cx="100" cy="120" r="4" fill={t.cuerpo2} />
      <circle cx="100" cy="80" r="12" fill={t.cuerpo2} />
      <circle cx="100" cy="80" r="4" fill={t.brillo} />
      <rect x="84" y="44" width="32" height="12" rx="4" fill={t.hardware} />
      <rect x="95" y="162" width="10" height="16" fill={t.hardware} />
    </g>
  )
}

function Interfaz({ t }: { t: Tonos }) {
  return (
    <g>
      <rect x="26" y="76" width="148" height="78" rx="11" fill={t.cuerpo} />
      <rect x="34" y="84" width="132" height="62" rx="7" fill={t.cuerpo2} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx={52 + i * 22} cy="102" r="6.5" fill={t.hardware} />
          <circle cx={52 + i * 22} cy="102" r="2.4" fill={t.cuerpo2} />
        </g>
      ))}
      <circle cx="152" cy="102" r="4.5" fill={t.brillo} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={48 + i * 20} y="120" width="4" height="22" rx="2" fill={t.hardware} opacity="0.45" />
          <rect
            x={45 + i * 20}
            y={124 + ((i * 7) % 9)}
            width="10"
            height="6"
            rx="2"
            fill={t.hardware}
          />
        </g>
      ))}
      <rect x="136" y="120" width="24" height="20" rx="4" fill={t.cuerpo} />
      <rect x="141" y="126" width="14" height="3" rx="1.5" fill={t.brillo} />
    </g>
  )
}

function Microfono({ t }: { t: Tonos }) {
  return (
    <g>
      <circle cx="100" cy="86" r="42" fill="none" stroke={t.hardware} strokeWidth="3.5" />
      <circle cx="100" cy="86" r="42" fill="none" stroke={t.hardware} strokeWidth="1.5" opacity="0.5" />
      <rect x="76" y="40" width="48" height="62" rx="22" fill={t.hardware} />
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={i}
          x1="80"
          y1={48 + i * 8}
          x2="120"
          y2={48 + i * 8}
          stroke={t.cuerpo2}
          strokeWidth="1.4"
          opacity="0.4"
        />
      ))}
      <rect x="82" y="100" width="36" height="34" rx="7" fill={t.cuerpo} />
      <circle cx="100" cy="114" r="4.5" fill={t.brillo} />
      <path d="M100 134 v22" stroke={t.hardware} strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="100" cy="162" rx="26" ry="7" fill={t.hardware} />
    </g>
  )
}

function Cable({ t }: { t: Tonos }) {
  return (
    <g>
      <path
        d="M46 138 C46 92 154 92 154 138"
        fill="none"
        stroke={t.cuerpo}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M60 148 C60 110 140 110 140 148"
        fill="none"
        stroke={t.cuerpo}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M74 158 C74 128 126 128 126 158"
        fill="none"
        stroke={t.cuerpo}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M46 138 C46 92 154 92 154 138"
        fill="none"
        stroke={t.hardware}
        strokeWidth="1.6"
        opacity="0.5"
      />
      {/* plug */}
      <g transform="rotate(-18 160 120)">
        <rect x="148" y="110" width="30" height="20" rx="6" fill={t.hardware} />
        <path d="M178 110 l16 10 l-16 10 z" fill={t.brillo} />
        <rect x="146" y="114" width="6" height="12" rx="3" fill={t.cuerpo} />
      </g>
    </g>
  )
}

function ControladorDj({ t }: { t: Tonos }) {
  return (
    <g>
      <rect x="22" y="70" width="156" height="90" rx="12" fill={t.cuerpo} />
      <circle cx="70" cy="115" r="32" fill={t.cuerpo2} />
      <circle cx="70" cy="115" r="24" fill={t.fondo1} />
      <circle cx="70" cy="115" r="27" fill="none" stroke={t.brillo} strokeWidth="2" />
      <circle cx="70" cy="115" r="3.5" fill={t.brillo} />
      <rect x="116" y="82" width="52" height="26" rx="4" fill={t.fondo3} />
      {Array.from({ length: 11 }).map((_, i) => (
        <rect
          key={i}
          x={120 + i * 4.4}
          y={86 + ((i * 5) % 12)}
          width="2.6"
          height={8 + ((i * 3) % 8)}
          rx="1.3"
          fill={t.cuerpo}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={120 + i * 18} y="120" width="3" height="24" rx="1.5" fill={t.hardware} opacity="0.45" />
          <rect x={116 + i * 18} y={126 + i * 5} width="11" height="6" rx="2" fill={t.hardware} />
        </g>
      ))}
      <circle cx="166" cy="134" r="7" fill={t.hardware} />
      <circle cx="166" cy="134" r="2.5" fill={t.cuerpo2} />
    </g>
  )
}

function Pedal({ t }: { t: Tonos }) {
  return (
    <g>
      <rect x="54" y="58" width="92" height="108" rx="12" fill={t.cuerpo} />
      <rect x="62" y="68" width="76" height="52" rx="7" fill={t.cuerpo2} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={80 + i * 20} cy="88" r="8" fill={t.hardware} />
          <rect x={79 + i * 20} y="82" width="2" height="7" fill={t.cuerpo2} />
        </g>
      ))}
      <circle cx="100" cy="110" r="4.5" fill={t.brillo} />
      <circle cx="100" cy="142" r="10" fill={t.hardware} />
      <circle cx="100" cy="142" r="5" fill={t.cuerpo2} />
      <rect x="44" y="80" width="10" height="8" rx="3" fill={t.hardware} />
      <rect x="146" y="98" width="10" height="8" rx="3" fill={t.hardware} />
    </g>
  )
}

function Saxofon({ t }: { t: Tonos }) {
  return (
    <g>
      <path
        d="M62 122 L62 156 C62 170 94 170 94 156 L94 122 Z"
        fill={t.cuerpo}
      />
      <ellipse cx="78" cy="158" rx="19" ry="6" fill={t.cuerpo2} />
      <path
        d="M84 126 L112 62 L140 62"
        fill="none"
        stroke={t.cuerpo}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M84 126 L112 62 L140 62"
        fill="none"
        stroke={t.brillo}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M140 62 l16 -10 l4 18 z" fill={t.cuerpo2} />
      {[
        [100, 106],
        [106, 94],
        [112, 82],
        [86, 112],
        [78, 134],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={t.hardware} />
      ))}
      <path d="M96 104 L74 132" stroke={t.hardware} strokeWidth="2.4" />
      <path d="M104 92 L82 140" stroke={t.hardware} strokeWidth="2.4" />
    </g>
  )
}

/* ── componente ─────────────────────────────────────────────── */

const SILUETAS: Record<CategoriaId, (props: { t: Tonos; variante: number }) => ReactNode> = {
  guitarras: (p) => <Guitarra {...p} />,
  bajos: (p) => <Guitarra {...p} />,
  teclados: (p) => <Teclado {...p} />,
  bateria: (p) => <Bateria {...p} />,
  amplificadores: (p) => <Amplificador {...p} />,
  audio: (p) => <Bocina {...p} />,
  grabacion: (p) => <Interfaz {...p} />,
  microfonos: (p) => <Microfono {...p} />,
  'cables-cuerdas': (p) => <Cable {...p} />,
  dj: (p) => <ControladorDj {...p} />,
  accesorios: (p) => <Pedal {...p} />,
  vientos: (p) => <Saxofon {...p} />,
}

/** Hash determinista: el mismo SKU siempre da la misma variación. */
function hash(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

interface Props {
  categoria: CategoriaId
  sku: string
  className?: string
}

export function IlustracionProducto({ categoria, sku, className = '' }: Props) {
  const t = TONOS[categoria]
  const semilla = hash(sku)

  const angulo = 100 + semilla * 60
  const giro = (semilla - 0.5) * 7
  const escala = 0.97 + semilla * 0.06

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(${angulo}deg, ${t.fondo1} 0%, ${t.fondo2} 100%)`,
      }}
    >
      {/* Luz cenital del estudio */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 34% 14%, rgba(255,255,255,0.55), rgba(255,255,255,0) 62%)',
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        aria-hidden
      >
        <ellipse cx="100" cy="174" rx="60" ry="10" fill="#0e1620" opacity="0.13" />
        <g
          transform={`rotate(${giro} 100 110) translate(100 108) scale(${escala}) translate(-100 -108)`}
        >
          {SILUETAS[categoria]({ t, variante: semilla > 0.5 ? 1 : 0 })}
        </g>
      </svg>
    </div>
  )
}
