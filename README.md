# Ortega & Ortega Abogados — sitio web

Sitio web de **Ortega & Ortega Abogados Penalistas Ecuador**, reconstruido con
Astro + Tailwind, administrable desde `/admin` con Decap CMS y listo para
desplegar en **Netlify**.

## Stack

- **Astro 4** — generador de sitio estático.
- **Tailwind CSS** — sistema de diseño.
- **Decap CMS** — panel de administración Git-based en `/admin`.
- **Netlify** — hosting, redirecciones y Netlify Forms para el formulario de
  contacto.

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
```

Compilación de producción:

```bash
npm run build
npm run preview
```

La carpeta resultante es `dist/` y es la que publica Netlify.

## Estructura

```
src/
├── components/      # Componentes reutilizables (.astro)
├── layouts/         # Layout base
├── content/
│   ├── blog/        # Publicaciones (.md)
│   ├── lawyers/     # Abogados (.md)
│   ├── gallery/     # Galería (.json)
│   └── settings/    # Configuración editable (.json)
├── pages/           # Rutas del sitio
├── lib/             # Utilidades
└── styles/

public/
├── admin/           # Decap CMS (index.html + config.yml)
├── uploads/         # Imágenes y archivos editables
├── robots.txt
└── forms.html       # Detección de Netlify Forms
```

## Administración (`/admin`)

El panel está construido con **Decap CMS** (sucesor de Netlify CMS) y usa
**Netlify Identity + Git Gateway** como backend.

### Activar el admin en Netlify

1. En el panel de Netlify del sitio, ir a **Site settings → Identity → Enable
   Identity**.
2. En **Identity → Registration**, dejar `Invite only`.
3. En **Identity → Services → Git Gateway**, activarlo.
4. Invitar al cliente desde **Identity → Users → Invite users**.

A partir de ese momento, el cliente entra a
`https://ortegaortegaabogados.com/admin/`, inicia sesión y puede editar:

- Hero, secciones y textos de la página de inicio.
- Equipo / abogados (alta, baja, orden, activo).
- Galería (subir imágenes, captions, categorías, orden).
- Blog (crear/editar/borrar publicaciones, SEO, categorías).
- Datos de contacto, redes sociales, footer y SEO global.

Todas las imágenes se suben a `/public/uploads/`.

### Probar el admin localmente

```bash
# en una terminal
npx decap-server
# en otra terminal
# editar public/admin/config.yml: descomentar `local_backend: true`
npm run dev
# visitar http://localhost:4321/admin/
```

## Netlify

`netlify.toml` ya está configurado con:

- `command = "npm run build"`
- `publish = "dist"`
- Redirecciones desde permalinks viejos de WordPress
  (`/index.php/...`) a las nuevas URLs.
- Reglas para el admin SPA (`/admin/*`).

### Despliegue

1. Subir el repo a GitHub.
2. En Netlify: **Add new site → Import an existing project**.
3. Conectar el repo. Netlify detecta `netlify.toml` automáticamente.
4. Activar **Identity** y **Git Gateway** como se describe arriba.
5. (Opcional) Habilitar **Forms** — Netlify detecta el formulario gracias a
   `public/forms.html`.

## SEO

- `<SEO />` (componente) genera meta tags por página, incluyendo Open Graph y
  Twitter Cards.
- Sitemap automático vía `@astrojs/sitemap` →
  `/sitemap-index.xml`.
- `robots.txt` permite indexación y enlaza al sitemap.
- Feed RSS del blog en `/rss.xml`.

## Reemplazar imágenes

El sitio referencia imágenes desde la URL de WordPress como contenido inicial.
Para migrar los archivos:

1. Descargar el contenido de `wp-content/uploads/` desde el sitio original.
2. Subirlos a `/public/uploads/` (o directamente desde Decap CMS al editar).
3. Actualizar las referencias en los archivos JSON de `src/content/settings/`
   o desde el admin.
