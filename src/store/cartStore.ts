import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LineaCarrito {
  productoId: string
  cantidad: number
}

interface CartState {
  lineas: LineaCarrito[]
  agregar: (productoId: string, cantidad?: number) => void
  cambiar: (productoId: string, cantidad: number) => void
  quitar: (productoId: string) => void
  vaciar: () => void
  unidades: () => number
}

const CLAVE = 'palacio-carrito'

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lineas: [],

      agregar: (productoId, cantidad = 1) =>
        set((s) => {
          const existente = s.lineas.find((l) => l.productoId === productoId)
          if (existente) {
            return {
              lineas: s.lineas.map((l) =>
                l.productoId === productoId
                  ? { ...l, cantidad: l.cantidad + cantidad }
                  : l,
              ),
            }
          }
          return { lineas: [...s.lineas, { productoId, cantidad }] }
        }),

      cambiar: (productoId, cantidad) =>
        set((s) => ({
          lineas:
            cantidad <= 0
              ? s.lineas.filter((l) => l.productoId !== productoId)
              : s.lineas.map((l) =>
                  l.productoId === productoId ? { ...l, cantidad } : l,
                ),
        })),

      quitar: (productoId) =>
        set((s) => ({
          lineas: s.lineas.filter((l) => l.productoId !== productoId),
        })),

      vaciar: () => set({ lineas: [] }),

      unidades: () =>
        get().lineas.reduce((a, l) => a + l.cantidad, 0),
    }),
    {
      name: CLAVE,
      version: 1,
      partialize: (s) => ({ lineas: s.lineas }),
    },
  ),
)
