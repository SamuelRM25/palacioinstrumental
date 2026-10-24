import { createContext, useContext } from 'react'

export type ToastTono = 'ok' | 'info' | 'error'

export interface ToastContextValue {
  avisar: (texto: string, tono?: ToastTono) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

/** Muestra un aviso efímero en la esquina inferior. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
