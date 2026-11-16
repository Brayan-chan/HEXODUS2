# Registro de cambios

## 2026-11-16 — Cards, Contacto, redes sociales y fotografías del Inicio

### Cards y navegación

- Las membresías del Inicio conservan el fondo azul oscuro compartido con las secciones de la marca. Las cards usan superficies azul pizarra, bordes y esquinas redondeadas; Gym Partners destaca con acento superior rojo y botón rojo.
- Los precios, nombres y beneficios se muestran en blanco. Los beneficios de estas cards usan palomitas rojas y Partners indica el precio por persona. Los estilos nuevos de las cards se limitan a `.memberships .plan` del Inicio.
- Los botones de acción comparten un radio de 12 px, con etiquetas centradas y sin las flechas decorativas de enlace. Los controles funcionales de navegación conservan sus iconos.
- El menú del header cambia el subrayado animado por una superficie azul redondeada en hover y estado activo, con foco de teclado visible.
- Los ajustes de contraste incluyen los estados hover y foco de los botones secundarios y de los botones rojos.

### Contacto y footer

- `/contacto/` reúne una portada azul oscuro con fotografía, acceso a WhatsApp, llamada y enlace de indicaciones. La sección siguiente organiza dirección, referencia de llegada y horarios junto al mapa interactivo de Google Maps.
- El diseño de Contacto se adapta a una columna en móvil; conserva los datos del negocio de `src/data/site.json`, las alternativas para movimiento reducido y la entrada del título sin recortes.
- El footer añade Facebook e Instagram debajo del texto de marca, con enlaces configurables en `site.socialLinks`, etiquetas accesibles, foco visible y apertura externa con `noopener noreferrer`.
- Facebook utiliza azul de marca; Instagram usa un SVG con su degradado y cámara centrada. Se incluye su licencia de SuperTinyIcons.

### Fotografías y referencias

| Cambio | Ruta pública actual | Lugar de uso |
|---|---|---|
| Renombre de `Hexodus71.webp` | `/assets/gallery/Orientacion.webp` | Card de Orientación y entrada `gallery-71` de `src/data/gallery.json` |
| Renombre de `Hexodus36.webp` | `/assets/gallery/LaFuerza.webp` | Filosofía del Inicio y entrada `gallery-36` de `src/data/gallery.json` |
| Reutilización de foto panorámica existente, 6000 × 4000 px | `/assets/gallery/HEXODUS_INFLUENCERS-9.webp` | Fondo del CTA «Hoy decides», con encuadre adaptable |
| Nuevo icono | `/assets/icons/instagram.svg` | Redes sociales del footer |

Los dos renombres incluyen los archivos de imagen y sus referencias para evitar enlaces rotos al clonar o desplegar. El fondo de «Hoy decides» se configura en `.final-cta__bg` de `src/styles/pages/home.css`; la imagen del hero inicial conserva su referencia independiente.

Se añaden las anclas `/#hoy-decides`, `/#footer` y `/contacto/#contacto`. Las cinco rutas de página existentes se mantienen; no se incorpora una página nueva.

### Carga del carrusel de reseñas

- Se elimina la entrada escalonada que ocultaba las cards al llegar a Comunidad. Se conservan la presentación visual y las animaciones de los demás elementos de la sección.
- La card inicial y su indicador se posicionan juntos antes del siguiente pintado. Las posiciones se calculan al iniciar y al cambiar el ancho, en lugar de leer las dimensiones de cada card durante todo el desplazamiento.
- Los controles se actualizan solo cuando cambia la reseña activa. Al redimensionar se conserva la selección; se cancelan los frames y se desconectan los observadores durante la limpieza del componente.
- El desplazamiento respeta `prefers-reduced-motion`. Se verificaron flechas, puntos, teclado y la expansión de reseñas en móvil.
- En pruebas locales con Chromium y CPU ralentizada 4×, la card activa alcanzó opacidad completa en aproximadamente 0,3 s frente a 1,4 s antes, a 1440 y 390 px. Durante un avance, las lecturas de dimensiones de cards pasaron de 194–218 a 0 y las mutaciones de atributos de 122–138 a 10. Son mediciones del componente en ese entorno, no métricas de carga global ni garantías de Core Web Vitals.

### Validación y revisión

- `npm run check` completado correctamente: ESLint, formato, compilación, validación de enlaces y recursos estáticos y las 21 pruebas de Playwright.
- Se comprobaron además 160 referencias a recursos en plantillas, estilos y datos, respetando las mayúsculas de sus rutas, sin archivos faltantes.
- La revisión visual cubre las cards, las fotografías, Contacto y los iconos del footer en móvil y escritorio.
- Los resultados locales de pruebas, compilados, dependencias y reportes de `.taste-skill/` quedan fuera del repositorio.
- La entrega se prepara en una rama nueva y un pull request hacia `main`; abrirlo no hace merge ni despliega el sitio.

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
