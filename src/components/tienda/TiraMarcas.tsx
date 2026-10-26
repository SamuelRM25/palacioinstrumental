import { Link } from 'react-router-dom'

/**
 * Las marcas del catálogo como tira de wordmarks. Cada una filtra el
 * catálogo por esa marca. Se escriben en Sora en lugar de usar logos
 * de terceros, que la tienda no tiene licenciados.
 */
export function TiraMarcas({ marcas }: { marcas: string[] }) {
  return (
    <section className="border-b border-borde bg-white">
      <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[17px]">Marcas en el local</h2>
          <p className="text-[13px] text-texto-3">
            {marcas.length} marcas con servicio y repuestos
          </p>
        </div>
        <ul className="sin-barra mt-5 flex gap-x-9 gap-y-3 overflow-x-auto pb-1">
          {marcas.map((nombre) => (
            <li key={nombre} className="shrink-0">
              <Link
                to={`/catalogo?marca=${encodeURIComponent(nombre)}`}
                className="font-sora text-[15px] font-semibold tracking-tight whitespace-nowrap text-texto-4 transition-colors hover:text-texto"
              >
                {nombre}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
