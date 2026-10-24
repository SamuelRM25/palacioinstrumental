interface Props {
  /** `marca` = escudo + nombre; `escudo` = solo el emblema. */
  variante?: 'marca' | 'escudo'
  alto?: number
  className?: string
}

/**
 * Emblema de la tienda. El archivo fuente es el logo entregado por el
 * propietario (PNG con canal alfa, 447×447) y se muestra sobre el papel
 * del app, donde el negro del escudo rinde sin sombras añadidas.
 */
export function Logo({ variante = 'marca', alto = 34, className = '' }: Props) {
  if (variante === 'escudo') {
    return (
      <img
        src="/logo.png"
        alt="Palacio Instrumental"
        width={alto}
        height={alto}
        className={`shrink-0 object-contain ${className}`}
        style={{ height: alto, width: alto }}
      />
    )
  }

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        width={alto}
        height={alto}
        className="shrink-0 object-contain"
        style={{ height: alto, width: alto }}
      />
      <span className="flex flex-col leading-none">
        <span
          className="font-display font-semibold tracking-tight text-ink"
          style={{ fontSize: alto * 0.5 }}
        >
          Palacio Instrumental
        </span>
        <span className="label-tech mt-1 text-ink-4">Workspace de ventas</span>
      </span>
    </span>
  )
}
