# Cotizador Diésel HD

Cotizador de refacciones diésel **heavy-duty**. App estática, autocontenida e
independiente de Truckdesc: un solo archivo `index.html` con HTML, CSS y JavaScript
embebidos. Sin build, sin dependencias, sin backend.

## Qué hace

- Captura por refacción: **número de parte, marca, cantidad y precio unitario (USD)**.
- **Catálogo embebido** de refacciones HD comunes (Cummins, Detroit Diesel, Bosch,
  Fleetguard, Donaldson, Bendix, Gates, Dayco, Wabco, Stemco): al escribir un número
  de parte se autollenan marca, descripción y precio (todo editable).
- Calcula **subtotal por partida** y **total estimado en USD** en vivo.
- **Copiar** la cotización como texto o **enviarla** por WhatsApp / compartir del
  dispositivo (Web Share API en móvil).
- La cotización en curso se guarda en `localStorage` (sobrevive al refresco);
  "Nueva cotización" la reinicia.

> Los precios del catálogo son **estimados y editables**. La cotización no es factura.

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
