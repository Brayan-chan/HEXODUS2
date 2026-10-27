# Hexodus Fitness Center — Vanilla Web Architecture

Sitio comercial de alto rendimiento para **Hexodus Fitness Center** (San Francisco de Campeche, México), migrado desde WordPress/Elementor a una arquitectura estática moderna en **Vanilla HTML/CSS/JavaScript**, compilado con **Vite** y pre-renderizado con **Nunjucks**.

---

## 🚀 1. Resumen de la Migración (WordPress → Vanilla)

El cliente solicitó la transición completa desde la web previa en WordPress (`https://hexodus.mx/`) hacia código nativo limpio. 

### Beneficios clave de la migración:
- **Rendimiento extremo**: Se eliminaron más de 30 scripts bloqueantes de WordPress/Elementor y dependencias de PHP. El peso total del CSS se redujo a solo **6.8 KB gzipped** y el JS crítico a **0.9 KB gzipped**.
- **Core Web Vitals sobresalientes**: Tiempos de primer pintado (FCP/LCP) de ~132ms en móvil y ~216ms en escritorio, superando los umbrales de Google por más de 10x.
- **Control total de la experiencia**: Animaciones a 60 FPS con GSAP 3 y ScrollTrigger calibradas al milímetro, sin parpadeos ni tirones de layout.
- **Paleta de Colores Neón**: Se actualizaron los estilos para incorporar los tonos azul eléctrico, cian neón y rojo vibrante solicitados para revitalizar la identidad visual de la marca.
- **SEO y Schema.org**: Datos estructurados nativos `ExerciseGym` integrados en el HTML base para posicionamiento local en Campeche.

---

## 📊 2. Auditoría de Rendimiento & Core Web Vitals

Mediciones realizadas en entorno de producción (`dist/`) utilizando Chromium y Playwright:

| Métrica | Escritorio (1440x900) | Móvil (iPhone 14/15) | Estándar "Bueno" de Google |
|---|---|---|---|
| **TTFB** *(Time to First Byte)* | **8.7 ms** | **1.9 ms** | < 800 ms |
| **FCP** *(First Contentful Paint)* | **216.0 ms** | **132.0 ms** | < 1,800 ms |
| **LCP** *(Largest Contentful Paint)* | **216.0 ms** | **132.0 ms** | < 2,500 ms |
| **CLS** *(Cumulative Layout Shift)* | **0.0285** | **0.0400** | < 0.100 |
| **TBT** *(Total Blocking Time)* | **49.0 ms** | **31.0 ms** | < 200 ms |
| **DOMContentLoaded** | **135.7 ms** | **100.0 ms** | < 1,000 ms |
| **FPS Promedio en Scroll** | **59.8 FPS** | **60.5 FPS** | 60 FPS |
| **Fotogramas fluidos (> 50 FPS)**| **98.9%** | **98.9%** | > 95% |

---

## 🎨 3. Paleta de Colores y Tokens de Diseño

Definidos en `src/styles/tokens.css`:

```css
:root {
  --ink: #080a0f;           /* Fondo principal ultra oscuro */
  --navy: #071b3c;          /* Acento azul marino */
  --blue: #0047ba;          /* Azul corporativo */
  --blue-neon: #0066ff;     /* Azul neón brillante */
  --blue-electric: #00d2ff; /* Azul cian eléctrico */
  --blue-glow: rgba(0, 102, 255, 0.35);
  --cyan-glow: rgba(0, 210, 255, 0.2);
  --red: #ea0029;           /* Rojo acento */
  --red-neon: #ff1744;      /* Rojo neón brillante */
  --red-glow: rgba(234, 0, 41, 0.35);
  --white: #fff;
  --paper: #f5f6f7;
  --muted: #a4adba;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --wrap: min(1264px, calc(100% - 48px));
}
```

---

## 🎬 4. Motor de Animaciones (GSAP 3 + ScrollTrigger)

Ubicado en `src/js/animations/home-animations.js`:

1. **Eliminación del Parpadeo (*Flicker-Free*)**:
   - Se reemplazó el patrón imperativo `onEnter: () => gsap.fromTo(..., {opacity: 0})` por la inicialización declarativa de GSAP `gsap.from(..., { scrollTrigger: { ... } })`.
   - Con esto, GSAP prepara el estado inicial oculto antes de que el usuario haga scroll, evitando que los elementos aparezcan momentáneamente y parpadeen.

2. **Suavidad y Cero Tirones**:
   - Curva de desaceleración calibrada a `power3.out`.
   - Desplazamientos sutiles (`y: 20px` a `32px`) con `stagger` de 0.07s a 0.1s entre elementos hijos.
   - Aislamiento de selectores por sección, evitando colisiones entre disparadores de encabezados y tarjetas hijas.
   - `clearProps: "transform,opacity"` al finalizar cada animación para mantener limpios los estilos en línea.

3. **Accesibilidad (a11y)**:
   - Envuelto en `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
   - Si el usuario tiene habilitada la reducción de movimiento, las animaciones se desactivan automáticamente y el contenido se presenta visible de inmediato sin retrasos.
   - Respaldo 100% funcional si JavaScript está deshabilitado en el navegador.

---

## 🗺️ 5. Flujo de Secciones del Home

El diseño replica y optimiza la estructura del template original de Elementor (`elementor-2447-2026-10-26.json`):

1. **Hero**: Declaración de valor *"Aquí no vienes a improvisar. Vienes a entrenar con estructura..."*, visual de atleta con parallax y botones de acción rápida.
2. **Cintillo / Beneficios**: Marquee continuo accesible con pausa en hover/focus (*Campeche • Clima controlado • Coaches certificados...*).
3. **¿Qué obtienes? (Experiencia)**: 3 pilares de entrenamiento con tarjetas visuales optimizadas.
4. **Membresías**: Planes Individual, Gym Partners y Estudiantes, con enlaces directos a WhatsApp precargados con mensajes contextuales por tipo de plan.
5. **Nosotros / Filosofía**: *"La fuerza no se improvisa. Se construye."* con badges de Head Coach y comunidad, enlazado con `data-route="/nosotros/"` apuntando a `#equipo`.
6. **Tu Equipo / Coaches**: Presentación del equipo técnico y perfil de entrenadores certificados.
7. **Galería**: Visor interactivo de instalaciones con selección de miniaturas y manejo de fallos en carga de imagen.
8. **Comunidad / Reseñas**: Voces y testimonios de atletas del team.
9. **FAQ**: Acordeón interactivo accesible con teclado (`<details>` / `<summary>`) para resolver dudas frecuentes sobre horarios y pases diarios.
10. **Hoy Decides (CTA Final)**: Sección panorámica a pantalla completa (*full-width*, `border-radius: 64px 64px 0 0`), fondo de atleta con parallax, titular en escala imponente con punto rojo brillante y botones estilo píldora para WhatsApp y Planes.
11. **Footer**: Cuadrícula de 4 columnas expandida a 1680px con enlaces de navegación, horarios detallados, dirección y botón flotante de WhatsApp.

---

## 📁 6. Estructura del Proyecto

```text
HEXODUS2-main/
├── dist/                      # Salida del build estático de producción
├── public/                    # Archivos estáticos directos (imágenes, fuentes, favicons)
│   └── assets/
├── src/
│   ├── components/            # Componentes reutilizables (header, footer, plan-card, ticker)
│   ├── data/                  # Fuente única de verdad (JSON: site, routes, gallery, memberships, faq, seo)
│   ├── js/
│   │   ├── animations/        # home-animations.js (GSAP), existing-effects.js (parallax/hover)
│   │   ├── components/        # active-navigation, card-highlight, gallery, header, menu
│   │   └── pages/             # Controladores independientes por página (home.js, contact.js, galeria.js)
│   ├── layouts/               # Plantilla base HTML con Schema.org y meta tags
│   ├── pages/                 # Plantillas Nunjucks de páginas (home.html, contacto.html, galeria.html)
│   ├── sections/home/         # Módulos de sección individuales del home
│   └── styles/                # tokens.css, base.css, layout.css, components/, pages/ (home, contact, galeria)
├── scripts/
│   ├── build.mjs              # Compilador Nunjucks + Vite SSG
│   ├── check.mjs              # Suite completa de verificación estática, lint, formato y tests
│   ├── dev.mjs                # Servidor de desarrollo con recarga en vivo
│   └── render.mjs             # Motor de renderizado Nunjucks
└── tests/
    └── home.test.mjs          # Pruebas automatizadas con Playwright (a11y, mobile, responsive, no-JS)
```

---

## 🛠️ 7. Instalación y Comandos

### Requisitos
- **Node.js**: v22.12.0 o superior (verificado en Node.js v24.18.0).
- **NPM**: v10 o superior.

### Comandos de Ejecución

```bash
# 1. Instalar dependencias exactas
npm ci

# 2. Iniciar servidor de desarrollo con Hot Module Replacement (HMR)
npm run dev

# 3. Compilar para producción (genera carpeta dist/)
npm run build

# 4. Probar la compilación estática de producción localmente
npm run preview

# 5. Ejecutar análisis de linter (ESLint)
npm run lint

# 6. Comprobar formato de código (Prettier)
npm run format:check

# 7. Ejecutar suite de tests en navegadores reales (Playwright)
npm test

# 8. Verificación integral de calidad previa a despliegue
npm run check
```

---

## 👥 8. Guía de Colaboración en Equipo (Desarrollo Modular Sin Conflictos)

El proyecto está diseñado bajo una **Arquitectura Desacoplada de Cero Colisiones (*Zero-Collision Architecture*)**. Cada página y cada módulo del sitio cuenta con sus propios archivos físicos de plantilla HTML, hojas de estilo CSS, controladores de JavaScript y fuentes de datos JSON. Esto permite que varios desarrolladores trabajen en paralelo en diferentes funcionalidades o secciones de manera 100% aislada, sin generar conflictos de fusión (*merge conflicts*) en Git.

### 📐 Matriz de Aislamiento por Módulos y Roles

| Desarrollador / Asignación | Archivos que modifica el desarrollador | Archivos que NO debe tocar |
|---|---|---|
| **👨‍💻 Dev A: Módulo Contacto**<br>*(Formulario, validaciones accesibles, mapa)* | • `src/pages/contacto.html`<br>• `src/styles/pages/contact.css`<br>• `src/js/pages/contact.js`<br>• `src/data/seo.json` *(clave `"contacto"`)* | No tocar `home.*`, `galeria.*`, ni `sections/home/`. |
| **👩‍💻 Dev B: Módulo Galería & Medios**<br>*(Grid masonry, lightbox, filtros, videos)* | • `src/pages/galeria.html`<br>• `src/styles/pages/galeria.css`<br>• `src/js/pages/galeria.js`<br>• `src/data/gallery.json`<br>• `public/assets/images/gallery/` | No tocar `contact.*`, `home.*`, ni `sections/home/`. |
| **🧑‍💻 Dev C: Secciones del Home**<br>*(Módulos individuales: Hero, Membresías, FAQ, Equipo)* | • `src/sections/home/[seccion].html`<br>• `src/styles/pages/home.css`<br>• `src/js/animations/home-animations.js`<br>• `src/data/memberships.json` o `faq.json` | No tocar `contacto.*` ni `galeria.*`. |
| **🎨 Dev D: Identidad & Globales**<br>*(Header, footer, tokens de diseño)* | • `src/components/header.html`<br>• `src/components/footer.html`<br>• `src/styles/tokens.css`<br>• `src/styles/components/shared.css` | Coordinar con el equipo antes de modificar tokens globales. |

---

### 🛡️ Reglas de Oro para Mantener el Proyecto Limpio y Escalable

1. **Uso Obligatorio de Design Tokens (`src/styles/tokens.css`)**:
   - Nunca escribas colores hexadecimales arbitrarios o espaciados en duro en tus archivos CSS.
   - Utiliza siempre las variables globales establecidas para la marca:
     - Azules: `var(--blue-neon)`, `var(--blue-electric)`, `var(--blue-glow)`
     - Rojos: `var(--red)`, `var(--red-neon)`, `var(--red-glow)`
     - Fondos y textos: `var(--ink)`, `var(--paper)`, `var(--muted)`, `var(--white)`
     - Ancho de contenedor estándar: `var(--wrap)`

2. **Fuente Única de Verdad de la Empresa (`src/data/site.json`)**:
   - Los datos oficiales de la empresa (teléfono, enlace oficial de WhatsApp, horarios, dirección física en Campeche, redes sociales) están centralizados en `src/data/site.json`.
   - **Regla**: Nunca hardcodees un número de teléfono o enlace a WhatsApp en el HTML. Siempre consúmelo vía template Nunjucks: `{{ site.whatsapp.url }}` o `{{ site.phone }}`. De esta manera, si la gerencia cambia de número, se actualiza en 1 segundo en todo el sitio sin riesgo de enlaces rotos.

3. **Encapsulamiento Estricto de Estilos**:
   - Cada página tiene su archivo CSS exclusivo en `src/styles/pages/`:
     - `contact.css`: Únicamente estilos del formulario y layout de contacto.
     - `galeria.css`: Únicamente estilos de la cuadrícula masonry, filtros y lightbox visor.
     - `home.css`: Estilos de las secciones de la página de inicio.
   - No agregues estilos específicos de una sola página en `shared.css` o `base.css`.

4. **SEO & Pre-renderizado SSG (Nunjucks First)**:
   - Todo el contenido textual, imágenes con etiquetas `alt`, encabezados jerárquicos (`h1`-`h4`) y tarjetas deben ser generados por Nunjucks en tiempo de compilación estática.
   - JavaScript solo se utiliza para la mejora progresiva interactiva (animaciones GSAP, filtrado dinámico en cliente, lightbox, validación de formularios). **Nunca generes contenido crítico de SEO exclusivamente con JavaScript en el navegador del cliente**.

---

### 🌿 Flujo de Trabajo en Git Recomendado

Para colaborar en equipo sin fricciones ni colisiones:

```bash
# 1. Crear una rama específica para la tarea asignada
git checkout -b feature/contacto-formulario
# (o para otro desarrollador: git checkout -b feature/galeria-videos)

# 2. Levantar el entorno local y trabajar en los archivos de tu módulo
npm run dev

# 3. Antes de commitear, verificar que todo cumpla con los estándares de calidad
npm run check

# 4. Hacer commit de tus archivos modificados
git add src/pages/contacto.html src/styles/pages/contact.css src/js/pages/contact.js
git commit -m "feat(contacto): implementar formulario accesible y validacion nativa"

# 5. Fusionar con main
# Dado que los archivos son independientes por vista, la integración se realiza de forma limpia y automática.
```

---

## 🔍 9. Conexión de Páginas Futuras y Extensibilidad

Para publicar las páginas secundarias (`/nosotros/`, `/planes-y-promociones/`) en fases siguientes:
1. Crear el template en `src/pages/[nombre].html`.
2. Registrar la ruta en `src/data/routes.json` con `"published": true`.
3. Agregar sus metadatos específicos en `src/data/seo.json`.
4. El sistema `scripts/build.mjs` y Vite la incluirán automáticamente en el build estático y en el sitemap.

---

© Hexodus Fitness Center. Desarrollado con estándares web modernos, accesibilidad y máxima optimización de velocidad.
