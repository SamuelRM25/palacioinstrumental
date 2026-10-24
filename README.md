# Palacio Instrumental — Workspace de Ventas

CRM interno para el equipo de ventas de **Palacio Instrumental**. Gestiona el
pipeline de cotizaciones, la cartera de clientes, el inventario y el cotizador,
y genera la cotización en PDF o por WhatsApp.

Es una **aplicación de demostración**: los datos viven en el navegador
(`localStorage`), con un catálogo, una cartera y un pipeline de ejemplo. No hay
servidor ni base de datos.

![Panel](docs/capturas/panel.png)

---

## Guion de demo (5 minutos)

Este es el recorrido sugerido para mostrarle el avance al dueño.

| # | Pantalla | Qué mostrar | Qué decir |
|---|---|---|---|
| 1 | **Panel** | Los cinco indicadores, el embudo con su % de conversión, el gráfico de 8 semanas y la lista **“Requiere atención”** | *“Aquí el equipo sabe en qué está. Las dos cotizaciones sin respuesta y el stock bajo salen solos, con su enlace para resolverlas.”* |
| 2 | **Pipeline** | Arrastrar una tarjeta de “Negociando” a “Cerrada”. Con teclado: el botón **Mover** de la tarjeta | *“El embudo es el mismo para todos. Si no puedes arrastrar, el botón Mover hace lo mismo.”* |
| 3 | **Cotizador** | Elegir cliente, moverse por el **diapasón** (el capo de latón cambia de traste al cambiar de familia), agregar 2–3 instrumentos, cambiar cantidad y descuento, elegir plan de 6 meses | *“La navegación por familias es un diapasón: cada familia es un traste. En la versión final cada familia de instrumento tendrá su propia ficha técnica."* |
| 4 | **Ver como el cliente** | La cotización renderizada con el escudo, las especificaciones de cada equipo, el plan de pago y las condiciones | *“Esto es lo que recibe el cliente. No es un PDF frío: es una página que se puede mandar por WhatsApp.”* |
| 5 | **PDF / WhatsApp** | Botón **PDF** (abre el documento con el escudo, la tabla, los totales y el plan de pago) y botón **WhatsApp** (arma el mensaje con el resumen y el link `wa.me`) | *“De la cotización al WhatsApp del cliente en un clic.”* |
| 6 | **Inventario** | Ajustar existencias con **+ / −**, el filtro “Solo stock bajo” | *“El inventario y el cotizador están conectados: lo que se cotiza reserva stock.”* |
| 7 | **Configuración** | Cambiar el WhatsApp, los horarios, el IVA, los meses de crédito, el envío gratis desde cierto monto | *“Acá se cambian los datos de la tienda. Hoy son de ejemplo; con los reales, todo se actualiza solo.”* |

Atajo útil: **⌘K / Ctrl+K** abre el buscador global (secciones, clientes,
cotizaciones y productos).

---

## Capturas

| | |
|---|---|
| **Cotizador** — diapasón, líneas y totales | **Pipeline** — tablero kanban |
| ![Cotizador](docs/capturas/cotizador.png) | ![Pipeline](docs/capturas/pipeline.png) |

**Vista del cliente** (la superficie que sí vende):

![Vista del cliente](docs/capturas/vista-cliente.png)

---

## Correrlo en local

```bash
npm install
npm run dev      # http://localhost:5173
```

Otros comandos:

```bash
npm run build    # compila a dist/
npm run preview  # sirve el build de producción
npm run lint     # ESLint
```

Requiere Node 20 o superior.

---

## Publicar en Render

El repositorio incluye `render.yaml`, así que hay dos caminos.

### Opción A — Blueprint (un clic)

1. En Render: **New → Blueprint**.
2. Apunta al repositorio `SamuelRM25/palacioinstrumental`.
3. Render lee `render.yaml`, crea el sitio estático y lo despliega.

`render.yaml` ya define lo necesario:

- `runtime: static` con `type: web` (la forma que pide Render para sitios
  estáticos)
- `buildCommand: npm install && npm run build`
- `staticPublishPath: ./dist`
- un *rewrite* de `/*` → `/index.html`
- `Cache-Control: immutable` para `/assets/*`

Ese rewrite es lo que evita el error 404 al recargar en una ruta interna como
`/pipeline` o `/inventario`: la app es una SPA y Render tiene que devolverle
el `index.html` en vez de un 404.

Render **sólo aplica la regla cuando no existe un archivo en la ruta pedida**,
así que `/assets/index-xxxx.js` y `/logo.png` se sirven tal cual y el rewrite
no los intercepta.

> ⚠️ `notFoundPage` **no** es una clave válida del esquema de Render (el
> `staticService` es `additionalProperties: false`). Render rechaza el
> blueprint si aparece. El fallback de SPA se resuelve únicamente con el
> `rewrite` de arriba.

### Opción B — Manual

1. **New → Static Site**.
2. Build command: `npm install && npm run build`
3. Publish path: `dist`
4. En **Headers**, añade una regla para `/assets/*` con
   `Cache-Control: public, max-age=31536000, immutable`.

Después de publicar, la URL queda en `https://<nombre>.onrender.com`.

> **Nota:** si más adelante se quiere que los datos se compartan entredevices
> (no solo dentro de un navegador), hay que reemplazar `zustand/persist` por una
> API. La estructura de `src/store/crmStore.ts` está pensada para eso: las
> acciones ya son las que un backend expondría.

---

## De dónde viene el diseño

### Análisis de referencia (REA)

Se analizaron con REA (`capture_browser_scenario`: DOM, árbol de accesibilidad,
red y consola) las dos tiendas de referencia:

| | Casa Instrumental | Bemol Music |
|---|---|---|
| Stack | WordPress 7.1 + WooCommerce 11 + Elementor Pro + Swiper 8 | WordPress 6.8 + WooCommerce 10.3 + tema Audib + Slick + Slider Revolution |
| Paleta | `#1B2A4B` / `#003D81` / `#1CA3C2` / gradiente cian→índigo | `#0058B8` + `#1A1A1A`, un solo azul |
| Tipografía | Próxima Nova + Montserrat | DM Sans + “Audib Heading” |
| Estructura | 13 tiles de categoría, 8 carruseles, hero en video | 7 carruseles, masonry, badges circulares |
| Señales de confianza | **ninguna** | 4 badges genéricos (“Pago seguro”, “Envío Rápido”) |
| Deuda técnica | slugs duplicados (`/accesorios/` vs `/accesorios-2/`), typos (`cauelas`, `violn`, `micrfono-usb`) | horarios contradictorios entre footer y “Sobre Nosotros”, categoría `Uncategorized` visible, menú demo del tema sin rebrand |

Conclusión: **ambos son el mismo producto con distinto skin**. WooCommerce +
azul + carruseles. Eso deja libre el terreno para un workspace que no se parezca
a ninguno de los dos.

### Dirección visual

El logo de Palacio Instrumental (escudo de guitarra, tipografía serif, cintillo
“Family Music Store”) es de herencia. La referencia que se tomó no es la
tienda online sino la **serigrafía de equipo de audio** — Buchla, Moog, Teenage
Engineering — traducida a un taller de luthier.

- **Papel y tinta** — `#F4EFE5` papel, `#17130F` tinta, `#6E1F2C` oxblood,
  `#8A6A2E` latón, `#2F5D50` pino, `#A9661A` ámbar. Todo en `@theme` de
  Tailwind v4 (`src/index.css`).
- **Tipografía** — **Fraunces** solo en el escudo y los números grandes;
  **Archivo** en mayúsculas con tracking amplio para encabezados (voz técnica,
  no serif); **IBM Plex Mono** para todo dato tabular: precios, SKU, conteos.
- **Firmas** — ① *El diapasón*: hairline de trastes con incrustaciones de punto,
  y un **capo de latón** que se desliza hasta la familia activa (es la única
  pieza que se mueve en toda la app). ② Regla con punto de latón como sistema
  de divisores. ③ Cero gradientes decorativos, cero sombras en capas, cero
  cuadrícula uniforme de tarjetas iguales.
- **Radios casi planos** (2–8 px) y espaciado con escala fija.

### Accesibilidad

- Todo el flujo es navegable con teclado; el pipeline tiene alternativa al
  arrastrar y tarjetas.
- `aria-label` en los botones de sólo icono, `role="tab"` en el diapasón con
  navegación por flechas, foco atrapado en modales.
- El color nunca es el único indicador: cada estado lleva texto.
- Se respeta `prefers-reduced-motion`.

---

## Estructura

```
src/
├── App.tsx                    rutas
├── index.css                  tokens de marca (@theme) + base
├── types/                     Producto, Cliente, Cotizacion, Etapa…
├── data/                      catálogo, clientes, cotizaciones, config
├── store/crmStore.ts          zustand + persist (localStorage)
├── lib/
│   ├── format.ts              moneda, fechas, teléfonos
│   ├── analytics.ts           KPIs, embudo, semanas, "requiere atención"
│   ├── whatsapp.ts            enlaces wa.me y mensajes
│   └── pdf.ts                 PDF con jsPDF + autoTable (carga diferida)
├── components/
│   ├── brand/                 Logo, Fretboard (el diapasón)
│   ├── charts/                gráficos en CSS/SVG, sin librerías
│   ├── layout/                AppShell, CommandPalette
│   └── ui/                    kit de componentes
└── pages/
    ├── Panel.tsx              indicadores y resumen
    ├── Pipeline.tsx           kanban
    ├── Cotizador.tsx          cotizador
    ├── Cotizaciones.tsx       historial
    ├── Clientes.tsx           cartera
    ├── ClienteDetalle.tsx     ficha
    ├── Inventario.tsx         existencias
    ├── Configuracion.tsx      datos de la tienda
    └── CotizacionPublica.tsx  vista que ve el cliente
```

## Stack

Vite 7 · React 19 · TypeScript · Tailwind CSS v4 · React Router 7 · Zustand 5 ·
jsPDF + autoTable · lucide-react.

Sin librerías de gráficos: los tres gráficos del Panel son CSS y SVG propios,
para que el peso y el estilo queden bajo control.

---

## Datos de demostración

- **54 productos** con marcas y especificaciones reales (Yamaha, Fender,
  Ibanez, Roland, Korg, Pearl, Marshall, Orange, Mackie, Shure, Rode, QSC,
  Pioneer DJ, Audio-Technica…), precios en quetzales, costo y existencias.
- **14 clientes** de distintos perfiles: consumidores, bandas, estudios,
  salones de eventos e instituciones.
- **16 cotizaciones** repartidas por las seis etapas del pipeline.

**Son datos ficticios.** Para cargar el inventario real hay que reemplazar
`src/data/catalogo.ts` (o exponerlo desde una API). Los datos de la tienda
—WhatsApp, dirección, horarios, IVA, meses de crédito— se editan desde
**Configuración** y se propagan a las cotizaciones, al PDF y a la vista del
cliente.

## Limitaciones conocidas

- Los datos son locales al navegador: no se sincronizan entre dispositivos.
- No hay autenticación; todas las secciones son accesibles.
- El PDF es un documento de demostración, sin valor fiscal.
- No hay envío real de correo ni integración con el punto de venta.
