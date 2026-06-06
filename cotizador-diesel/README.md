# Cotizador Diésel HD

Cotizador de refacciones diésel **heavy-duty**. App estática, autocontenida e
independiente de Truckdesc: un solo archivo `index.html` con HTML, CSS y JavaScript
embebidos. Sin build, sin dependencias, sin backend.

## Qué hace

- Captura por refacción: **número de parte, marca, cantidad y precio unitario (USD)**.
- **Catálogo embebido de ~160 refacciones HD reales** (Cummins, Detroit Diesel,
  PACCAR, Caterpillar, Volvo/Mack, Bosch, Holset, Fleetguard, Donaldson, Baldwin,
  WIX, Bendix, Haldex, Wabco, Meritor, Stemco, SKF, Hendrickson, Gabriel, Delco Remy,
  Leece-Neville, Eaton Fuller, Spicer/Dana, Truck-Lite, Grote, Gates, Dayco…) con
  números de parte y precios tomados de **listados públicos de tiendas en línea
  (junio 2026)**. Al escribir un número de parte se autollenan marca, descripción y
  precio (todo editable).
- **Buscador** por número de parte, marca o descripción para agregar partidas rápido.
- **Importa tu propia lista de precios (CSV)** para escalar a miles de partes con
  precios exactos; tu catálogo se guarda en el dispositivo. Exporta el catálogo y
  descarga una plantilla CSV.
- Calcula **subtotal por partida** y **total estimado en USD** en vivo.
- **Copiar** la cotización como texto o **enviarla** por WhatsApp / compartir del
  dispositivo (Web Share API en móvil).
- La cotización en curso se guarda en `localStorage` (sobrevive al refresco);
  "Nueva cotización" la reinicia.

> Los precios del catálogo provienen de listados públicos y **varían por vendedor,
> condición (nuevo/reman) y fecha**; son **estimados y editables**. La cotización no
> es factura. Para precios exactos, importa tu lista en CSV.

## Formato del CSV de importación

Encabezados aceptados (en español o inglés, en cualquier orden):
`numParte, marca, descripcion, categoria, precio` (también `partNumber/sku`,
`brand`, `description`, `category`, `price`). Si el archivo no trae encabezados, se
asume ese mismo orden de columnas. Usa el botón **"Plantilla CSV"** para un ejemplo.

## Uso local

Abre `index.html` directamente en el navegador (doble clic). No requiere servidor.

## Despliegue en Netlify (sitio independiente)

1. En Netlify: **Add new site → Import an existing project** y selecciona este repo.
2. Configura:
   - **Base directory:** `cotizador-diesel`
   - **Build command:** *(vacío)*
   - **Publish directory:** `cotizador-diesel`
3. Deploy. El sitio queda separado del de Truckdesc.

El archivo `netlify.toml` de esta carpeta ya define `publish = "."` para cuando el
base directory apunta aquí.
