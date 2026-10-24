import { useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Field, Input } from '../components/ui/Field'
import { Badge } from '../components/ui/Badge'
import { useCrm } from '../store/crmStore'
import { useToast } from '../components/ui/toastContext'

export default function Configuracion() {
  const config = useCrm((s) => s.config)
  const actualizarConfig = useCrm((s) => s.actualizarConfig)
  const reiniciarDemo = useCrm((s) => s.reiniciarDemo)
  const clientes = useCrm((s) => s.clientes)
  const cotizaciones = useCrm((s) => s.cotizaciones)
  const avisar = useToast().avisar

  const [form, setForm] = useState({ ...config })
  const [confirmando, setConfirmando] = useState(false)

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const hayCambios = JSON.stringify(form) !== JSON.stringify(config)

  return (
    <>
      <div className="mb-5 max-w-2xl">
        <p className="text-[13px] leading-relaxed text-ink-3">
          Estos datos aparecen en las cotizaciones, en el PDF y en la vista que
          ve el cliente. Por ahora son valores de ejemplo: ajústalos con los
          reales de la tienda antes de usar la aplicación en serio.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader eyebrow="Identidad" titulo="Datos de la tienda" />
            <CardBody className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field etiqueta="Nombre comercial" htmlFor="c-nombre">
                  <Input
                    id="c-nombre"
                    value={form.nombre}
                    onChange={(e) => set('nombre', e.target.value)}
                  />
                </Field>
                <Field etiqueta="Lema" htmlFor="c-lema">
                  <Input
                    id="c-lema"
                    value={form.lema}
                    onChange={(e) => set('lema', e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  etiqueta="WhatsApp"
                  htmlFor="c-wa"
                  ayuda="Solo números. Se usa para armar los enlaces."
                >
                  <Input
                    id="c-wa"
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                    inputMode="numeric"
                  />
                </Field>
                <Field etiqueta="Teléfono" htmlFor="c-tel">
                  <Input
                    id="c-tel"
                    value={form.telefono}
                    onChange={(e) => set('telefono', e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field etiqueta="Correo" htmlFor="c-mail">
                  <Input
                    id="c-mail"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </Field>
                <Field etiqueta="Horarios" htmlFor="c-hor">
                  <Input
                    id="c-hor"
                    value={form.horarios}
                    onChange={(e) => set('horarios', e.target.value)}
                  />
                </Field>
              </div>
              <Field etiqueta="Dirección" htmlFor="c-dir">
                <Input
                  id="c-dir"
                  value={form.direccion}
                  onChange={(e) => set('direccion', e.target.value)}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Comercial"
              titulo="Condiciones de venta"
              descripcion="Se calculan al momento de cotizar."
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field etiqueta="IVA incluido (%)" htmlFor="c-iva">
                  <Input
                    id="c-iva"
                    type="number"
                    min={0}
                    max={30}
                    value={form.ivaPct}
                    onChange={(e) => set('ivaPct', Number(e.target.value))}
                  />
                </Field>
                <Field
                  etiqueta="Interés anual (%)"
                  htmlFor="c-int"
                  ayuda="Aplicado sobre el saldo en planes a meses."
                >
                  <Input
                    id="c-int"
                    type="number"
                    min={0}
                    max={60}
                    value={form.interesPct}
                    onChange={(e) => set('interesPct', Number(e.target.value))}
                  />
                </Field>
                <Field etiqueta="Garantía (meses)" htmlFor="c-gar">
                  <Input
                    id="c-gar"
                    type="number"
                    min={0}
                    max={60}
                    value={form.garantiaMeses}
                    onChange={(e) => set('garantiaMeses', Number(e.target.value))}
                  />
                </Field>
                <Field etiqueta="Envío local (Q)" htmlFor="c-env-local">
                  <Input
                    id="c-env-local"
                    type="number"
                    min={0}
                    value={form.envioLocal}
                    onChange={(e) => set('envioLocal', Number(e.target.value))}
                  />
                </Field>
                <Field etiqueta="Envío nacional (Q)" htmlFor="c-env-nac">
                  <Input
                    id="c-env-nac"
                    type="number"
                    min={0}
                    value={form.envioNacional}
                    onChange={(e) => set('envioNacional', Number(e.target.value))}
                  />
                </Field>
                <Field
                  etiqueta="Envío gratis desde (Q)"
                  htmlFor="c-env-min"
                >
                  <Input
                    id="c-env-min"
                    type="number"
                    min={0}
                    value={form.envioGratisDesde}
                    onChange={(e) =>
                      set('envioGratisDesde', Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <Field
                etiqueta="Planes de pago ofrecidos"
                htmlFor="c-meses"
                ayuda="Sepáralos con comas. 0 significa pago de contado."
                className="mt-3"
              >
                <Input
                  id="c-meses"
                  value={form.mesesCredito.join(', ')}
                  onChange={(e) =>
                    set(
                      'mesesCredito',
                      e.target.value
                        .split(',')
                        .map((s) => Number(s.trim()))
                        .filter((n) => !Number.isNaN(n)),
                    )
                  }
                />
              </Field>
            </CardBody>
          </Card>
        </div>

        <aside className="flex flex-col gap-3">
          <Card acento="oxblood">
            <CardHeader eyebrow="Datos de prueba" titulo="Estado" />
            <CardBody className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Clientes</span>
                <span className="font-mono text-[12px] text-ink">{clientes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-ink-3">Cotizaciones</span>
                <span className="font-mono text-[12px] text-ink">
                  {cotizaciones.length}
                </span>
              </div>
              <div className="mt-1">
                <Badge tono="brass">Los datos viven en este navegador</Badge>
              </div>
            </CardBody>
          </Card>

          <Button
            variante="primary"
            disabled={!hayCambios}
            onClick={() => {
              actualizarConfig(form)
              avisar('Configuración guardada.')
            }}
          >
            <Save className="size-3.5" aria-hidden />
            Guardar cambios
          </Button>

          <Card>
            <CardHeader eyebrow="Reinicio" titulo="Datos de demostración" />
            <CardBody>
              <p className="text-[12.5px] leading-relaxed text-ink-3">
                Devuelve el catálogo, la cartera y el pipeline a su estado
                original. Borra todo lo que hayas agregado.
              </p>
              {confirmando ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variante="danger"
                    onClick={() => {
                      reiniciarDemo()
                      setForm(useCrm.getState().config)
                      setConfirmando(false)
                      avisar('Datos de demostración restaurados.')
                    }}
                  >
                    Sí, reiniciar
                  </Button>
                  <Button variante="ghost" onClick={() => setConfirmando(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  variante="secondary"
                  className="mt-3"
                  onClick={() => setConfirmando(true)}
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Reiniciar todo
                </Button>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  )
}
