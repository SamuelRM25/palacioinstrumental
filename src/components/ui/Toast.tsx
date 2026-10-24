import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Check, Info, X } from 'lucide-react'
import { ToastContext, type ToastTono } from './toastContext'

interface Aviso {
  id: number
  texto: string
  tono: ToastTono
}

let contador = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const cerrar = useCallback((id: number) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const avisar = useCallback(
    (texto: string, tono: ToastTono = 'ok') => {
      const id = ++contador
      setAvisos((prev) => [...prev, { id, texto, tono }])
      window.setTimeout(() => cerrar(id), 4200)
    },
    [cerrar],
  )

  const valor = useMemo(() => ({ avisar }), [avisar])

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      >
        {avisos.map((a) => (
          <div
            key={a.id}
            role="status"
            className="animate-rise pointer-events-auto flex items-start gap-2.5 border border-rule bg-ink px-3 py-2.5 text-paper shadow-[0_10px_24px_-16px_rgba(23,19,15,0.7)]"
          >
            <span
              aria-hidden
              className={`mt-0.5 ${a.tono === 'ok' ? 'text-brass-hi' : a.tono === 'error' ? 'text-oxblood-hi' : 'text-paper-3'}`}
            >
              {a.tono === 'ok' ? (
                <Check className="size-3.5" />
              ) : a.tono === 'error' ? (
                <X className="size-3.5" />
              ) : (
                <Info className="size-3.5" />
              )}
            </span>
            <p className="flex-1 text-[12.5px] leading-snug">{a.texto}</p>
            <button
              type="button"
              onClick={() => cerrar(a.id)}
              aria-label="Descartar aviso"
              className="shrink-0 text-paper-3 transition-colors hover:text-paper"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
