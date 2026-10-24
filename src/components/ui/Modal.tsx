import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './Button'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  eyebrow?: string
  descripcion?: string
  children: ReactNode
  pie?: ReactNode
  ancho?: 'sm' | 'md' | 'lg'
}

const ANCHOS = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }

export function Modal({
  abierto,
  onCerrar,
  titulo,
  eyebrow,
  descripcion,
  children,
  pie,
  ancho = 'md',
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    botonRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCerrar()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const focusables = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const primero = focusables[0]
      const ultimo = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previo?.focus()
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 backdrop-blur-[1px] sm:p-8">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`animate-rise w-full ${ANCHOS[ancho]} border border-rule bg-paper shadow-[0_18px_40px_-24px_rgba(23,19,15,0.45)]`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-rule px-5 py-4">
          <div>
            {eyebrow ? <p className="label-tech mb-1 text-ink-4">{eyebrow}</p> : null}
            <h2 className="text-[15px] font-semibold text-ink">{titulo}</h2>
            {descripcion ? (
              <p className="mt-1 text-[12px] text-ink-3">{descripcion}</p>
            ) : null}
          </div>
          <IconButton ref={botonRef} etiqueta="Cerrar" onClick={onCerrar}>
            <X className="size-4" />
          </IconButton>
        </header>
        <div className="px-5 py-4">{children}</div>
        {pie ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-rule bg-paper-2 px-5 py-3">
            {pie}
          </footer>
        ) : null}
      </div>
    </div>
  )
}

interface DrawerProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
  pie?: ReactNode
  ancho?: 'sm' | 'md'
}

export function Drawer({
  abierto,
  onCerrar,
  titulo,
  children,
  pie,
  ancho = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto, onCerrar])

  if (!abierto) return null

  const anchoClase = ancho === 'sm' ? 'max-w-md' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`animate-fade flex h-full w-full ${anchoClase} flex-col border-l border-rule bg-paper`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-rule px-5 py-4">
          <h2 className="text-[15px] font-semibold text-ink">{titulo}</h2>
          <IconButton etiqueta="Cerrar" onClick={onCerrar}>
            <X className="size-4" />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-rule bg-paper-2 px-5 py-3">
            {pie}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
