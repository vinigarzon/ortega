# Despliegue — Ortega & Ortega Abogados

Guía corta para llevar el sitio a producción en Netlify y probar que todo
funciona de punta a punta.

## 1. Variables de entorno en Netlify

Site settings → Environment variables. Copia exactamente los mismos valores
que tienes en `.env`:

| Variable                       | Valor                                                    |
|--------------------------------|----------------------------------------------------------|
| `TURSO_URL`                    | `libsql://ortega-ortega-vinolino.aws-us-east-2.turso.io` |
| `TURSO_AUTH_TOKEN`             | (token JWT largo de Turso)                               |
| `CLOUDINARY_CLOUD_NAME`        | `dgmqlmfxv`                                              |
| `CLOUDINARY_API_KEY`           | `196298567437744`                                        |
| `CLOUDINARY_API_SECRET`        | (secret de Cloudinary)                                   |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | `dgmqlmfxv`                                              |
| `JWT_SECRET`                   | (cadena aleatoria larga — **distinta** a la local)       |
| `ADMIN_BOOTSTRAP_USERS`        | (solo si necesitas sembrar usuarios nuevos en prod)      |
| `RESEND_API_KEY`               | `re_...`                                                 |
| `RESEND_FROM`                  | `Ortega & Ortega Abogados <ortega@gurumba.com>`          |
| `CONTACT_TO`                   | `orgabogados@hotmail.com`  *(fallback)*                  |
| `SITE_URL`                     | `https://ortegaortegaabogados.com`                       |
| `PUBLIC_TURNSTILE_SITE_KEY`    | *(opcional)*                                             |
| `TURNSTILE_SECRET_KEY`         | *(opcional)*                                             |

> Genera un `JWT_SECRET` distinto al de desarrollo con:
> `openssl rand -base64 48`

## 2. Build settings en Netlify

Ya están en `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20`

No requiere `db:init` ni `db:migrate` en el deploy — la BD ya está sembrada
desde tu máquina local. Si quieres re-correrlos en producción (por ejemplo
para agregar usuarios admin), `npm run db:init` localmente leyendo del mismo
`.env` apunta al mismo Turso de producción.

## 3. Push a GitHub

Conecta el repo a Netlify (si no lo está aún) y haz push de `main`. El primer
build va a tardar ~2 minutos. Después:

```
https://ortegaortegaabogados.com/        — Home
https://ortegaortegaabogados.com/blog/   — Blog
https://ortegaortegaabogados.com/admin/  — Login del panel
```

## 4. Checklist E2E

Después del primer deploy, prueba en este orden:

### Sitio público
- [ ] `/` carga con hero, equipo, galería y secciones
- [ ] `/blog/` lista publicaciones, paginación funciona (página 2, 3…)
- [ ] `/blog/<slug>/` abre un post con cuerpo formateado correctamente
- [ ] `/blog/categoria/legal/` filtra por categoría
- [ ] `/videoteca/` y `/videoteca/<slug>/` igual con videos YouTube
- [ ] `/contacto/` envía un mensaje real → llegan dos correos (cliente y despacho)
- [ ] `/rss.xml` devuelve XML válido

### Admin
- [ ] `/admin/` redirige a login si no hay sesión
- [ ] Login con `vinicio.garzon@gmail.com` / `Garzon1975` funciona
- [ ] Dashboard muestra contadores correctos
- [ ] Crear un post nuevo → aparece en `/blog/` al refrescar
- [ ] Editar un post → cambio refleja al refrescar la URL pública
- [ ] Eliminar un post → 404 en su URL pública
- [ ] Subir una imagen desde un campo de imagen (botón "Subir") → URL queda guardada
- [ ] Cambiar `leadEmail` en Ajustes → Contacto → próximo envío del form va al email nuevo
- [ ] Reordenar / agregar items en Galería → cambia el home
- [ ] Cerrar sesión vuelve a login

### Seguridad
- [ ] `/admin/*` en `robots.txt` o headers (ya está como `noindex,nofollow`)
- [ ] Acceso directo a `/api/admin/posts` sin cookie devuelve 401
- [ ] El token de Turso rotó después del primer deploy exitoso
- [ ] El API Secret de Cloudinary rotó después del primer deploy exitoso

## 5. Mantenimiento

- **Agregar un nuevo admin**: edita `ADMIN_BOOTSTRAP_USERS` en `.env` local con
  el nuevo email/contraseña y corre `npm run db:init`. El script salta los
  usuarios existentes y crea solo el nuevo.

- **Rotar tokens**: actualízalos en Turso/Cloudinary, actualiza en Netlify
  env vars, redeploy.

- **Backup de BD**: Turso CLI permite `turso db dump ortega-ortega > backup.sql`.
  Recomendado hacerlo periódicamente.
