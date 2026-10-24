import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Cliente,
  ConfigTienda,
  Cotizacion,
  Etapa,
  LineaCotizacion,
  Producto,
} from '../types'
import { CATALOGO } from '../data/catalogo'
import { CLIENTES } from '../data/clientes'
import { COTIZACIONES, calcularTotales, siguienteFolio } from '../data/cotizaciones'
import { CONFIG_TIENDA, VENDEDORES } from '../data/config'

interface CrmState {
  productos: Producto[]
  clientes: Cliente[]
  cotizaciones: Cotizacion[]
  config: ConfigTienda
  vendedores: typeof VENDEDORES

  moverEtapa: (cotizacionId: string, etapa: Etapa) => void
  actualizarCotizacion: (cotizacionId: string, cambios: Partial<Cotizacion>) => void
  actualizarLineas: (cotizacionId: string, lineas: LineaCotizacion[]) => void
  crearCotizacion: (datos: {
    clienteId: string
    lineas: LineaCotizacion[]
    plan: Cotizacion['plan']
    notas: string
    vendedor: string
    etapa?: Etapa
  }) => Cotizacion
  eliminarCotizacion: (cotizacionId: string) => void

  crearCliente: (datos: Omit<Cliente, 'id' | 'creadoEn' | 'ultimaActividad'>) => Cliente
  actualizarCliente: (clienteId: string, cambios: Partial<Cliente>) => void

  ajustarStock: (productoId: string, delta: number) => void
  reservarStock: (productoId: string, delta: number) => void

  actualizarConfig: (cambios: Partial<ConfigTienda>) => void
  reiniciarDemo: () => void
}

const estadoInicial = {
  productos: CATALOGO,
  clientes: CLIENTES,
  cotizaciones: COTIZACIONES,
  config: CONFIG_TIENDA,
  vendedores: VENDEDORES,
}

export const useCrm = create<CrmState>()(
  persist(
    (set, get) => ({
      ...estadoInicial,

      moverEtapa: (cotizacionId, etapa) =>
        set((s) => ({
          cotizaciones: s.cotizaciones.map((c) => {
            if (c.id !== cotizacionId) return c
            const ahora = new Date().toISOString().slice(0, 10)
            return {
              ...c,
              etapa,
              enviadaEn:
                etapa !== 'nuevo' && !c.enviadaEn ? ahora : c.enviadaEn,
              cerradaEn:
                etapa === 'cerrada' ? (c.cerradaEn ?? ahora) : undefined,
            }
          }),
        })),

      actualizarCotizacion: (cotizacionId, cambios) =>
        set((s) => ({
          cotizaciones: s.cotizaciones.map((c) =>
            c.id === cotizacionId ? { ...c, ...cambios } : c,
          ),
        })),

      actualizarLineas: (cotizacionId, lineas) =>
        set((s) => ({
          cotizaciones: s.cotizaciones.map((c) => {
            if (c.id !== cotizacionId) return c
            const totales = calcularTotales(lineas, c.envio)
            return { ...c, lineas, ...totales }
          }),
        })),

      crearCotizacion: ({ clienteId, lineas, plan, notas, vendedor, etapa }) => {
        const id = `q${Date.now().toString(36)}`
        const folio = siguienteFolio(get().cotizaciones)
        const totales = calcularTotales(lineas)
        const ahora = new Date().toISOString().slice(0, 10)
        const nueva: Cotizacion = {
          id,
          folio,
          clienteId,
          lineas,
          ...totales,
          plan,
          etapa: etapa ?? 'nuevo',
          vendedor,
          creadaEn: ahora,
          notas,
        }
        set((s) => ({
          cotizaciones: [nueva, ...s.cotizaciones],
          productos: s.productos.map((p) => {
            const enCotizacion = lineas
              .filter((l) => l.productoId === p.id)
              .reduce((a, l) => a + l.cantidad, 0)
            if (!enCotizacion) return p
            return { ...p, reservado: p.reservado + enCotizacion }
          }),
        }))
        return nueva
      },

      eliminarCotizacion: (cotizacionId) =>
        set((s) => ({
          cotizaciones: s.cotizaciones.filter((c) => c.id !== cotizacionId),
        })),

      crearCliente: (datos) => {
        const id = `c${Date.now().toString(36)}`
        const ahora = new Date().toISOString().slice(0, 10)
        const cliente: Cliente = {
          ...datos,
          id,
          creadoEn: ahora,
          ultimaActividad: ahora,
        }
        set((s) => ({ clientes: [cliente, ...s.clientes] }))
        return cliente
      },

      actualizarCliente: (clienteId, cambios) =>
        set((s) => ({
          clientes: s.clientes.map((c) =>
            c.id === clienteId
              ? { ...c, ...cambios, ultimaActividad: new Date().toISOString().slice(0, 10) }
              : c,
          ),
        })),

      ajustarStock: (productoId, delta) =>
        set((s) => ({
          productos: s.productos.map((p) =>
            p.id === productoId ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
          ),
        })),

      reservarStock: (productoId, delta) =>
        set((s) => ({
          productos: s.productos.map((p) =>
            p.id === productoId
              ? { ...p, reservado: Math.max(0, p.reservado + delta) }
              : p,
          ),
        })),

      actualizarConfig: (cambios) =>
        set((s) => ({ config: { ...s.config, ...cambios } })),

      reiniciarDemo: () => set({ ...estadoInicial }),
    }),
    {
      name: 'palacio-instrumental-crm',
      version: 1,
    },
  ),
)

/** Selectores memoizables para no recalcular en cada render. */
export const selectProductoPorId = (id: string) => (s: CrmState) =>
  s.productos.find((p) => p.id === id)

export const selectClientePorId = (id: string) => (s: CrmState) =>
  s.clientes.find((c) => c.id === id)

export const selectCotizacionPorId = (id: string) => (s: CrmState) =>
  s.cotizaciones.find((c) => c.id === id)
