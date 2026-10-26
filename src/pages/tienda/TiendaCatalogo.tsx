import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, SearchX, SlidersHorizontal } from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { useCart } from '../../store/cartStore'
import { CATEGORIAS } from '../../data/config'
import { aplicarFiltros, type FiltrosCatalogo } from '../../lib/tienda'
import { Aviso, Boton, Hoja } from '../../components/tienda/Piezas'
import { PanelFiltros } from '../../components/tienda/PanelFiltros'
import { BarraCatalogo } from '../../components/tienda/BarraCatalogo'
import { FilaProducto, TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { HeroCategoria } from '../../components/tienda/HeroCategoria'

const POR_PAGINA = 24

export default function TiendaCatalogo() {
  const config = useCrm((s) => s.config)
  const productos = useCrm((s) => s.productos)
  const agregar = useCart((s) => s.agregar)
  const [params, setParams] = useSearchParams()

  const [vista, setVista] = useState<'cuadricula' | 'lista'>('cuadricula')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [visibles, setVisibles] = useState(POR_PAGINA)

  const consulta = params.get('q') ?? ''
  const filtros: FiltrosCatalogo = useMemo(
    () => ({
      familia: params.get('categoria') ?? 'todas',
      marca: params.get('marca') ?? '',
      rango: params.get('rango') ?? 'todos',
      solo: params.get('solo') === 'disponibles',
      orden: params.get('orden') ?? 'relevancia',
    }),
    [params],
  )

  // Al cambiar cualquier filtro se vuelve a la primera página. Se ajusta
  // durante el render en lugar de en un efecto: evita un segundo render.
  const firma = `${filtros.familia}|${filtros.marca}|${filtros.rango}|${filtros.solo}|${filtros.orden}|${consulta}`
  const [firmaPrevia, setFirmaPrevia] = useState(firma)
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma)
    setVisibles(POR_PAGINA)
  }

  const familiaActual = CATEGORIAS.find((c) => c.id === filtros.familia)
  const resultados = useMemo(
    () => aplicarFiltros(productos, filtros, consulta),
    [productos, filtros, consulta],
  )

  useEffect(() => {
    document.title = `${familiaActual?.nombre ?? 'Instrumentos'} · ${config.nombre}`
  }, [familiaActual, config.nombre])

  const cambiar = (cambio: Partial<FiltrosCatalogo>) => {
    const siguiente = { ...filtros, ...cambio }
    const nuevos = new URLSearchParams(params)
    const escribir = (clave: string, valor: string | undefined) => {
      if (!valor || valor === 'todas' || valor === '') nuevos.delete(clave)
      else nuevos.set(clave, valor)
    }
    escribir('categoria', siguiente.familia)
    escribir('marca', siguiente.marca)
    escribir('rango', siguiente.rango)
    escribir('solo', siguiente.solo ? 'disponibles' : undefined)
    escribir('orden', siguiente.orden === 'relevancia' ? undefined : siguiente.orden)
    setParams(nuevos, { replace: true })
  }

  const limpiar = () => {
    const nuevos = new URLSearchParams()
    if (consulta) nuevos.set('q', consulta)
    setParams(nuevos, { replace: true })
  }

  const filtrosActivos =
    (filtros.familia !== 'todas' ? 1 : 0) +
    (filtros.marca ? 1 : 0) +
    (filtros.rango !== 'todos' ? 1 : 0) +
    (filtros.solo ? 1 : 0)

  const panel = (
    <PanelFiltros
      productos={productos}
      filtros={filtros}
      onCambio={cambiar}
      onLimpiar={limpiar}
      ocultarFamilia={Boolean(familiaActual)}
    />
  )

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Migas */}
      <nav aria-label="Ruta" className="flex items-center gap-1.5 text-[12.5px] text-texto-4">
        <Link to="/" className="hover:text-texto">
          Inicio
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-texto-3">
          {familiaActual ? familiaActual.nombre : 'Instrumentos'}
        </span>
      </nav>

      {/* Encabezado */}
      <header className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-sora text-[30px] leading-tight font-extrabold tracking-tight sm:text-[38px]">
            {familiaActual?.nombre ?? 'Instrumentos'}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-texto-3">
            {consulta
              ? `Resultados para “${consulta}”. `
              : ''}
            {resultados.length} de {productos.length} referencias. Todos los
            precios están en quetzales, con IVA incluido.
          </p>
        </div>
      </header>

      {/* Portada de familia */}
      {familiaActual ? (
        <div className="mt-8">
          <HeroCategoria familia={familiaActual} total={resultados.length} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        {/* Filtros */}
        <aside className="hidden lg:block">
          <div className="sticky top-40">
            <p className="label-web border-b border-borde pb-3 text-texto">
              Filtros
            </p>
            {panel}
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <BarraCatalogo
            total={resultados.length}
            mostrados={Math.min(visibles, resultados.length)}
            orden={filtros.orden}
            onOrden={(orden) => cambiar({ orden })}
            vista={vista}
            onVista={setVista}
            onAbrirFiltros={() => setFiltrosAbiertos(true)}
            filtrosActivos={filtrosActivos}
          />

          {resultados.length === 0 ? (
            <div className="mt-8">
              <Aviso
                titulo="Ningún artículo coincide"
                texto="Probá con menos filtros o con otro término de búsqueda. En el local tenemos más de lo que aparece en pantalla."
                icono={<SearchX className="size-6" aria-hidden />}
                accion={
                  <Boton variante="secundario" onClick={limpiar}>
                    Limpiar filtros
                  </Boton>
                }
              />
            </div>
          ) : vista === 'cuadricula' ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {resultados.slice(0, visibles).map((producto) => (
                <li key={producto.id}>
                  <TarjetaProducto
                    producto={producto}
                    onAgregar={(p) => agregar(p.id)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-2">
              {resultados.slice(0, visibles).map((producto) => (
                <li key={producto.id}>
                  <FilaProducto
                    producto={producto}
                    onAgregar={(p) => agregar(p.id)}
                  />
                </li>
              ))}
            </ul>
          )}

          {visibles < resultados.length ? (
            <div className="mt-10 flex flex-col items-center gap-3">
              <Boton variante="secundario" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
                Ver más artículos ({resultados.length - visibles} restantes)
              </Boton>
              <p className="label-web text-texto-4">
                Mostrando {Math.min(visibles, resultados.length)} de {resultados.length}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Filtros en móvil */}
      <Hoja
        abierto={filtrosAbiertos}
        onCerrar={() => setFiltrosAbiertos(false)}
        titulo="Filtros"
        pie={
          <div className="flex gap-3">
            <Boton variante="secundario" className="flex-1" onClick={limpiar}>
              Limpiar
            </Boton>
            <Boton variante="primario" className="flex-1" onClick={() => setFiltrosAbiertos(false)}>
              Ver {resultados.length} artículos
            </Boton>
          </div>
        }
      >
        <div className="flex items-center gap-2 pb-3 text-[13px] font-semibold text-texto">
          <SlidersHorizontal className="size-4" aria-hidden />
          Afinar resultados
        </div>
        {panel}
      </Hoja>
    </div>
  )
}
