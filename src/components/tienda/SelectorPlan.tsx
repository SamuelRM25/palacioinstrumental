import { useId } from 'react'
import { Check } from 'lucide-react'
import { moneda } from '../../lib/format'
import { totalConInteres } from '../../lib/tienda'

interface Props {
  /** Monto a financiar, sin interés. */
  base: number
  /** Meses elegidos; 0 = contado. */
  meses: number
  onChange: (meses: number) => void
  interesPct: number
  opciones: number[]
}

export function SelectorPlan({
  base,
  meses,
  onChange,
  interesPct,
  opciones,
}: Props) {
  const grupo = useId()

  return (
    <fieldset>
      <legend className="label-web text-texto-4">Plan de pago</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {opciones.map((m) => {
          const activo = m === meses
          const total = totalConInteres(base, m, interesPct)
          return (
            <label
              key={m}
              className={`relative flex min-h-11 cursor-pointer flex-col rounded-md border px-3 py-2.5 pb-6 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento-2 ${
                activo
                  ? 'border-acento bg-acento-3'
                  : 'border-borde-2 bg-white hover:border-texto-4'
              }`}
            >
              <input
                type="radio"
                name={grupo}
                checked={activo}
                onChange={() => onChange(m)}
                className="sr-only"
              />
              <span className="text-[12.5px] font-semibold text-texto">
                {m === 0 ? 'Contado' : `${m} cuotas`}
              </span>
              <span className="mt-0.5 text-[12px] text-texto-3 tabular-nums">
                {m === 0 ? moneda(base) : `${moneda(total / m)}/mes`}
              </span>
              {activo ? (
                <span className="absolute right-2 bottom-2 flex size-4 items-center justify-center rounded-full bg-acento text-texto">
                  <Check className="size-2.5" aria-hidden />
                </span>
              ) : null}
            </label>
          )
        })}
      </div>
      {meses > 0 ? (
        <p className="mt-2 text-[12px] text-texto-3">
          Total con interés {moneda(totalConInteres(base, meses, interesPct))} al{' '}
          {interesPct}% — sin cuota de manejo.
        </p>
      ) : null}
    </fieldset>
  )
}
