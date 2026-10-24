import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calculator, Search, User, FileText, Package, CornerDownLeft } from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { moneda } from '../../lib/format'

interface Comando {
  id: string
  titulo: string
  detalle?: string
  grupo: string
  icono: React.ReactNode
  ejecutar: () => void
}

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function CommandPalette({ abierto, onCerrar }: Props) {
  const navegar = useNavigate()
  const [consulta, setConsulta] = useState('')
  const [indice, setIndice] = useState(0)
  const listaRef = useRef<HTMLUListElement>(null)

  const clientes = useCrm((s) => s.clientes)
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const productos = useCrm((s) => s.productos)

  // Ajuste de estado al cambiar la propped, en tiempo de render y no en un
  // efecto: así se evita un segundo ciclo de pintado.
  const [prevAbierto, setPrevAbierto] = useState(abierto)
  if (abierto !== prevAbierto) {
    setPrevAbierto(abierto)
    if (abierto) {
      setConsulta('')
      setIndice(0)
    }
  }

  const comandos = useMemo<Comando[]>(() => {
    const base: Comando[] = [
      {
        id: 'nav-panel',
        titulo: 'Panel',
        grupo: 'Ir a',
        icono: <Search className="size-3.5" />,
        ejecutar: () => navegar('/'),
      },
      {
        id: 'nav-pipeline',
        titulo: 'Pipeline de cotizaciones',
        grupo: 'Ir a',
        icono: <Search className="size-3.5" />,
        ejecutar: () => navegar('/pipeline'),
      },
      {
        id: 'nav-cotizador',
        titulo: 'Cotizador',
        grupo: 'Ir a',
        icono: <Calculator className="size-3.5" />,
        ejecutar: () => navegar('/cotizador'),
      },
      {
        id: 'nav-cotizaciones',
        titulo: 'Listado de cotizaciones',
        grupo: 'Ir a',
        icono: <FileText className="size-3.5" />,
        ejecutar: () => navegar('/cotizaciones'),
      },
      {
        id: 'nav-clientes',
        titulo: 'Clientes',
        grupo: 'Ir a',
        icono: <User className="size-3.5" />,
        ejecutar: () => navegar('/clientes'),
      },
      {
        id: 'nav-inventario',
        titulo: 'Inventario',
        grupo: 'Ir a',
        icono: <Package className="size-3.5" />,
        ejecutar: () => navegar('/inventario'),
      },
      {
        id: 'accion-nueva',
        titulo: 'Nueva cotización',
        grupo: 'Acciones',
        icono: <Calculator className="size-3.5" />,
        ejecutar: () => navegar('/cotizador'),
      },
    ]

    for (const c of clientes) {
      base.push({
        id: `cli-${c.id}`,
        titulo: c.nombre,
        detalle: `${c.telefono} · ${c.ciudad}`,
        grupo: 'Clientes',
        icono: <User className="size-3.5" />,
        ejecutar: () => navegar(`/clientes/${c.id}`),
      })
    }

    for (const cot of cotizaciones) {
      base.push({
        id: `cot-${cot.id}`,
        titulo: cot.folio,
        detalle: moneda(cot.total),
        grupo: 'Cotizaciones',
        icono: <FileText className="size-3.5" />,
        ejecutar: () => navegar(`/pipeline?cotizacion=${cot.id}`),
      })
    }

    for (const p of productos) {
      base.push({
        id: `prod-${p.id}`,
        titulo: p.nombre,
        detalle: `${p.sku} · ${moneda(p.precio)}`,
        grupo: 'Inventario',
        icono: <Package className="size-3.5" />,
        ejecutar: () => navegar(`/inventario?producto=${p.id}`),
      })
    }

    return base
  }, [clientes, cotizaciones, productos, navegar])

  const filtrados = useMemo(() => {
    const q = consulta.trim().toLowerCase()
    if (!q) return comandos.slice(0, 12)
    return comandos
      .filter(
        (c) =>
          c.titulo.toLowerCase().includes(q) ||
          c.detalle?.toLowerCase().includes(q) ||
          c.grupo.toLowerCase().includes(q),
      )
      .slice(0, 14)
  }, [comandos, consulta])

  const [prevConsulta, setPrevConsulta] = useState(consulta)
  if (consulta !== prevConsulta) {
    setPrevConsulta(consulta)
    setIndice(0)
  }

  if (!abierto) return null

  const ejecutar = (c: Comando) => {
    onCerrar()
    c.ejecutar()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndice((i) => (i + 1) % Math.max(filtrados.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndice((i) => (i - 1 + filtrados.length) % Math.max(filtrados.length, 1))
    } else if (e.key === 'Enter' && filtrados[indice]) {
      e.preventDefault()
      ejecutar(filtrados[indice])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCerrar()
    }
  }

  let ultimoGrupo = ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/45 p-4 pt-[12vh] backdrop-blur-[1px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el workspace"
        className="animate-rise w-full max-w-xl border border-rule bg-paper shadow-[0_18px_40px_-24px_rgba(23,19,15,0.45)]"
      >
        <div className="flex items-center gap-2.5 border-b border-rule px-3.5 py-3">
          <Search aria-hidden className="size-4 shrink-0 text-ink-4" />
          <input
            autoFocus
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar secciones, clientes, cotizaciones o productos…"
            aria-label="Buscar"
            className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-4 focus:outline-none"
          />
          <kbd className="label-mono hidden shrink-0 border border-rule-2 px-1.5 py-0.5 text-ink-4 sm:inline">
            ESC
          </kbd>
        </div>

        <ul ref={listaRef} className="max-h-[52vh] overflow-y-auto py-1.5">
          {filtrados.length === 0 ? (
            <li className="px-3.5 py-6 text-center text-[13px] text-ink-3">
              Sin resultados para “{consulta}”.
            </li>
          ) : (
            filtrados.map((c, i) => {
              const nuevoGrupo = c.grupo !== ultimoGrupo
              ultimoGrupo = c.grupo
              return (
                <li key={c.id}>
                  {nuevoGrupo ? (
                    <p className="label-tech px-3.5 pt-2.5 pb-1 text-ink-4">
                      {c.grupo}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setIndice(i)}
                    onClick={() => ejecutar(c)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors ${
                      i === indice ? 'bg-paper-3' : 'hover:bg-paper-2'
                    }`}
                  >
                    <span aria-hidden className="shrink-0 text-ink-4">
                      {c.icono}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink">
                        {c.titulo}
                      </span>
                      {c.detalle ? (
                        <span className="block truncate font-mono text-[10.5px] text-ink-4">
                          {c.detalle}
                        </span>
                      ) : null}
                    </span>
                    {i === indice ? (
                      <CornerDownLeft aria-hidden className="size-3.5 shrink-0 text-ink-4" />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-rule bg-paper-2 px-3.5 py-2">
          <span className="label-mono text-ink-4">↑ ↓ navegar · ⏎ abrir</span>
          <span className="label-mono text-ink-4">{filtrados.length} resultados</span>
        </div>
      </div>
    </div>
  )
}
