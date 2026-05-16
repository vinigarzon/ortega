# Panel de administración `/admin/`

El sitio incluye un panel administrativo (Decap CMS) en `/admin/` desde el que
**cualquier persona autorizada puede editar todo el sitio sin tocar código**:
hero, secciones de la home, equipo, galería, blog, videoteca, contacto, footer
y SEO.

## Acceso

### En producción (cuando esté en Netlify)

1. Visita `https://[tu-dominio]/admin/`
2. Se abre un widget de login (Netlify Identity).
3. Si es la primera vez, ingresas con el email al que llegó la invitación.
4. Una vez dentro: barra lateral con todas las colecciones editables.

### En local (mientras se desarrolla)

1. En una terminal, dentro de la carpeta del proyecto:
   ```
   npm install
   npx decap-server
   ```
   Eso levanta un servidor proxy en `localhost:8081`.
2. En **otra** terminal:
   ```
   npm run dev
   ```
3. Abre `http://localhost:4321/admin/` → entras directo, sin login.

> El modo local solo funciona porque tenemos `local_backend: true` en
> `public/admin/config.yml`. Esa línea no afecta producción.

## ¿Cuántos usuarios pueden entrar?

**Ilimitados.** Cada uno tiene su cuenta propia (email + contraseña).
Se invita a cada usuario desde el dashboard de Netlify una sola vez.

### Cómo invitar a un nuevo usuario (cuando estés en Netlify)

1. Entra a Netlify → tu sitio → **Identity** → **Invite users**.
2. Pones el email de la persona.
3. Le llega un correo con un enlace de invitación.
4. Hace click, crea su contraseña, y ya queda registrado.
5. Esa persona luego entra siempre por `/admin/` con su email + password.

### Cómo eliminar un usuario

Identity → Users → click en el usuario → **Delete**.

### ¿Quién puede editar qué?

Decap CMS no tiene roles avanzados por defecto. Todo usuario invitado puede:
- Crear, editar y borrar cualquier post de blog o videoteca.
- Editar los datos del equipo, galería, contacto, SEO, hero, footer.
- Subir nuevas imágenes al gestor de medios.

Si más adelante quieres roles diferenciados (ej. "solo redactor",
"solo administrador") se puede instalar un plugin pero no es necesario por
ahora.

## Qué se puede editar (resumen)

| Sección | Qué edita |
|---|---|
| **Configuración del sitio → Sitio** | Nombre, lema, logo, favicon |
| **Configuración del sitio → SEO** | Meta título, meta descripción, imagen OG |
| **Configuración del sitio → Contacto y redes** | Teléfonos (fijo + 2 móviles), email, dirección, Maps embed, WhatsApp, redes sociales |
| **Configuración del sitio → Pie de página** | Copyright y texto adicional |
| **Página de inicio** | Hero (imagen, título, subtítulo, botón) + secciones de la home (historia, valores, misión, fortalezas) |
| **Abogados / Equipo** | Crear, editar, desactivar, reordenar. Foto, nombre, cargo, especialidad, teléfono, email, biografía |
| **Galería** | Subir/quitar imágenes, ordenarlas, configurar **velocidad** del carrusel (segundos entre imágenes, duración del fundido, mostrar flechas/puntos, pausar al pasar el mouse) |
| **Blog** | Crear/editar/eliminar artículos escritos. Título, fecha, **tipo** (blog/videoteca), categoría, extracto, imagen destacada, video YouTube, body, SEO |
| **Videoteca** | Es la misma colección "Blog" filtrada por `tipo = videoteca`. Para que un post aparezca en videoteca, cambias el campo "Tipo de publicación" en el editor |

## Cómo cambia el contenido

Cada vez que alguien guarda un cambio desde `/admin/`:

1. Decap escribe los cambios en el repositorio Git (via Git Gateway).
2. Netlify detecta el commit y **dispara un build automático**.
3. En 30-60 segundos el sitio público ya muestra los cambios.

Toda la historia de cambios queda en Git: se puede ver quién hizo qué y cuándo,
y revertir si fuera necesario.

## Resolver dudas comunes

- **No me llega el email de invitación**: revisa spam y verifica que el dominio
  de Identity esté correcto en Netlify.
- **Subo una imagen y no aparece**: el build tarda ~30-60s. Recarga la página
  pública pasados 1-2 minutos.
- **Quiero deshacer un cambio**: en Netlify → Deploys → busca un deploy
  anterior y dale "Publish deploy". O en GitHub revierte el commit.
- **Olvidé mi contraseña**: en el login de `/admin/`, click en "Forgot
  password?" y sigue el flujo.
