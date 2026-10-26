import { Link } from 'react-router-dom'
import { MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useCrm } from '../../store/crmStore'
import { enlaceWhatsappTienda } from '../../lib/whatsapp'
import { CATEGORIAS } from '../../data/config'

export function PieTienda() {
  const config = useCrm((s) => s.config)

  return (
    <footer id="contacto" className="bg-texto text-white">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img
            src="/logo-blanco.png"
            alt={config.nombre}
            width={263}
            height={235}
            className="h-28 w-auto"
          />
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/60">
            {config.lema}. Instrumentos de las marcas que ya conocés, asesoría
            técnica honesta y garantía real en cada venta.
          </p>
          <a
            href={enlaceWhatsappTienda(config)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-acento px-4 text-[13px] font-semibold text-texto transition-colors hover:bg-acento-2 hover:text-white"
          >
            <MessageCircle className="size-4" aria-hidden />
            Escribir por WhatsApp
          </a>
        </div>

        <div>
          <p className="label-web text-white/40">Comprar</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-[13.5px] text-white/70">
            <li>
              <Link to="/catalogo" className="transition-colors hover:text-white">
                Todo el catálogo
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo?solo=disponibles"
                className="transition-colors hover:text-white"
              >
                Disponibles ahora
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo?orden=nuevos"
                className="transition-colors hover:text-white"
              >
                Novedades
              </Link>
            </li>
            <li>
              <Link
                to="/#como-comprar"
                className="transition-colors hover:text-white"
              >
                Cuotas y formas de pago
              </Link>
            </li>
            <li>
              <Link
                to="/#transparencia"
                className="transition-colors hover:text-white"
              >
                Garantía y envío
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-web text-white/40">Familias</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13.5px] text-white/70">
            {CATEGORIAS.map((familia) => (
              <li key={familia.id}>
                <Link
                  to={`/catalogo?categoria=${familia.id}`}
                  className="transition-colors hover:text-white"
                >
                  {familia.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="label-web text-white/40">Visitanos</p>
          <ul className="mt-4 flex flex-col gap-3.5 text-[13.5px] text-white/70">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
              <span className="leading-relaxed">{config.direccion}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
              <a href={`tel:${config.telefono.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                {config.telefono}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
              <a href={`mailto:${config.email}`} className="hover:text-white">
                {config.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-acento" aria-hidden />
              <span className="leading-relaxed">{config.horarios}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <p className="label-web text-white/35">
            © {new Date().getFullYear()} {config.nombre}
          </p>
          <p className="label-web text-white/35">
            Envío gratis desde Q{config.envioGratisDesde.toLocaleString('es-GT')} ·
            Hasta {Math.max(...config.mesesCredito)} cuotas
          </p>
        </div>
      </div>
    </footer>
  )
}
