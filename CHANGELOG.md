# Registro de cambios

## 2026-11-02 — Páginas, navegación y ajustes visuales

Esta entrega reúne las páginas de Membresías y Nosotros que ya estaban en la rama local y los ajustes posteriores de navegación, presentación y pruebas. El destino es un pull request hacia `main`; su apertura no integra ni publica los cambios.

### Páginas y contenido

- Se incorporan `/membresias/` y `/nosotros/` al sitio estático, con plantillas, estilos y controladores independientes.
- Membresías presenta planes mensuales, pases flexibles, beneficios y asesoría por WhatsApp. La capa de contenido de Sanity conserva los datos remotos y añade valores de respaldo para las nuevas tarjetas.
- Nosotros incorpora las secciones editoriales, instalaciones, equipo, comunidad y controles del video de marca.
- Contacto conserva su contenido y mapa y actualiza la presentación de portada, encabezados y tarjetas.
- La navegación principal y los enlaces de Galería y del bloque de filosofía llevan a las páginas dedicadas.

### Header y barra de promociones

- El header mantiene una altura de 76 px y elimina los cambios de tamaño o apariencia asociados al scroll. El logo reserva sus dimensiones desde el HTML.
- El header y la barra usan tipografía del sistema para conservar sus medidas al navegar. El botón del header conserva la respuesta de color sin desplazarse al recibir el cursor o el foco.
- La barra azul permanece debajo del header y sincroniza su recorrido de 24 segundos entre documentos mediante una fase calculada al cargar cada página. El sitio conserva la navegación entre documentos completos.
- El scroll a anclas contempla la altura de ambos elementos. Se conservan la pausa de la barra al interactuar y la alternativa para movimiento reducido.

### Identidad visual y fuentes

- Se añade `public/assets/hexodus-pattern.svg`, construido a partir del símbolo de marca de la referencia facilitada. Aparece en la portada y tarjetas de Membresías, con cambios suaves de intensidad al interactuar.
- Se corrige el contraste del botón secundario de asesoría de Membresías en hover y foco de teclado.
- Inter y Barlow Condensed se sirven desde `public/assets/fonts/`, con sus licencias SIL Open Font License. Se elimina la activación diferida de Google Fonts y se precargan las fuentes principales.
- El fondo inicial del documento es oscuro; las secciones claras conservan su presentación.
- La entrega incluye dos imágenes de la página Nosotros y una versión optimizada de `_MG_5450-HDR.webp` que ya formaban parte de los commits locales.

### Estado final de las animaciones

- Se conservan las entradas GSAP y los reveals al hacer scroll en las cinco páginas, respetando `prefers-reduced-motion`.
- Los títulos parten de `y: 0, yPercent: 110` y terminan en cero. La entrada dura 0,85 s, comienza en 0,2 s y separa las líneas 0,12 s; Galería utiliza 0,14 s.
- La clase `hero-ready` libera el estado inicial al completar la portada o cuando se solicita movimiento reducido.
- Las transiciones entre documentos conservan el fundido de 0,24 s y mantienen el header y la barra en grupos sin duración de animación.
- Esta configuración corresponde a la versión restaurada solicitada por el usuario. Los experimentos posteriores de temporización y arranque compartido se revirtieron y no están incluidos.

### Protección de SEO y Open Graph

Se comparó la entrega con `origin/main` (`f7df32cd15d6aedee26d74060abb29f3271e0fc5`):

- Los títulos, descripciones e imágenes SEO existentes de Inicio, Contacto y Galería conservan sus valores.
- Las etiquetas compartidas de título, descripción, canonical, robots, Open Graph y Twitter son idénticas.
- El JSON-LD compartido y el de las páginas que ya existían en `main` conserva su contenido.
- `scripts/render.mjs` y `scripts/build.mjs` conservan el comportamiento de canonical, indexación, robots y sitemap.
- Las claves SEO y el JSON-LD de Membresías y Nosotros proceden de los commits locales previos que incorporaron esas páginas. No sustituyen las claves existentes ni se modifican en el commit de ajustes visuales.

La plantilla base cambia exclusivamente el fondo inicial y la carga de fuentes fuera de sus metadatos y datos estructurados.

### Validación y revisión

Ejecutar `npm run check` para comprobar ESLint, formato, compilación, rutas, recursos y las 18 pruebas de Playwright. La cobertura incluye navegación, títulos y fuentes locales, carga lenta en móvil y escritorio, geometría del header y la barra, contraste del botón, menú de teclado, mapa, galería, movimiento reducido y desbordamientos.

La comprobación automatizada se complementa con una revisión visual de las cinco portadas. No constituye una medición de rendimiento en todos los dispositivos; las cifras históricas del README deben interpretarse con su entorno de medición.
