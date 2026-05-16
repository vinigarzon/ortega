/**
 * PUT /api/admin/settings/[key]
 *
 * Body JSON: el objeto entero que se guardará en `value` de la fila `key`.
 * No hay validación profunda — confiamos en que la UI mande la forma correcta.
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { invalidateSettingsCache } from "@/lib/queries";

export const prerender = false;

const ALLOWED = new Set(["site", "seo", "contact", "footer", "homepage"]);

export const PUT: APIRoute = async ({ params, request }) => {
  const key = String(params.key ?? "");
  if (!ALLOWED.has(key)) return j({ error: "Clave inválida" }, 400);

  let body: any;
  try { body = await request.json(); }
  catch { return j({ error: "JSON inválido" }, 400); }

  // Aceptamos tanto un objeto pelado como un objeto con la clave dentro
  // (e.g. { contact: { ... } }). Guardamos la forma completa: el "shape" del
  // archivo original respeta la clave por compatibilidad.
  await db.execute({
    sql: `INSERT INTO settings (key, value, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(key) DO UPDATE SET
            value      = excluded.value,
            updated_at = datetime('now')`,
    args: [key, JSON.stringify(body)],
  });

  invalidateSettingsCache(key);
  return j({ ok: true });
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
