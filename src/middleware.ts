/**
 * Middleware global Astro.
 *
 * Protege todo lo bajo /admin/* excepto:
 *   /admin/login           (página pública)
 *   /api/admin/login       (POST de login)
 *
 * Si no hay sesión válida → redirect a /admin/login?next=<originalPath>
 *
 * También inyecta `locals.user` para que las páginas admin sepan quién está
 * conectado sin repetir la verificación del JWT.
 */
import { defineMiddleware } from "astro:middleware";
import { getSessionFromCookies } from "./lib/auth";

const ADMIN_PREFIX = "/admin";
const PUBLIC_ADMIN_PATHS = new Set<string>([
  "/admin/login",
  "/admin/login/",
]);
const PUBLIC_ADMIN_API = new Set<string>([
  "/api/admin/login",
]);

export const onRequest = defineMiddleware(async (ctx, next) => {
  const url = new URL(ctx.request.url);
  const path = url.pathname;

  // ¿Es una ruta protegida?
  const isAdminPage = path.startsWith(ADMIN_PREFIX) && !PUBLIC_ADMIN_PATHS.has(path);
  const isAdminApi =
    path.startsWith("/api/admin/") && !PUBLIC_ADMIN_API.has(path);

  if (isAdminPage || isAdminApi) {
    const session = await getSessionFromCookies(ctx.cookies);
    if (!session) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const nextUrl = encodeURIComponent(path + (url.search || ""));
      return ctx.redirect(`/admin/login?next=${nextUrl}`);
    }
    // @ts-ignore — extendemos locals para las páginas
    ctx.locals.user = session;
  }

  return next();
});
