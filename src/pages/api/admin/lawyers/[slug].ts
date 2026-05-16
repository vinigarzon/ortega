/**
 * PUT    /api/admin/lawyers/[slug] — actualizar
 * DELETE /api/admin/lawyers/[slug] — eliminar
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const slug = String(params.slug ?? "");
  if (!slug) return j({ error: "Falta slug" }, 400);

  let body: any;
  try { body = await request.json(); }
  catch { return j({ error: "JSON inválido" }, 400); }

  const cur = await db.execute({
    sql: "SELECT id FROM lawyers WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (cur.rows.length === 0) return j({ error: "No encontrado" }, 404);

  let finalSlug = slug;
  const newSlugRaw = String(body.newSlug ?? "").trim();
  if (newSlugRaw) {
    const cand = slugify(newSlugRaw);
    if (cand !== slug) {
      const others = await db.execute({
        sql: "SELECT slug FROM lawyers WHERE slug != ?",
        args: [slug],
      });
      const taken = new Set(others.rows.map((r: any) => String(r.slug)));
      finalSlug = taken.has(cand) ? uniqueSlug(cand, taken) : cand;
    }
  }

  await db.execute({
    sql: `UPDATE lawyers SET
            slug          = ?,
            name          = ?,
            position      = ?,
            photo         = ?,
            photo_zoom    = ?,
            photo_focus_y = ?,
            specialty     = ?,
            phone         = ?,
            email         = ?,
            bio           = ?,
            "order"       = ?,
            active        = ?,
            updated_at    = datetime('now')
          WHERE slug = ?`,
    args: [
      finalSlug,
      String(body.name ?? "").trim(),
      String(body.position ?? ""),
      body.photo ? String(body.photo) : null,
      typeof body.photoZoom === "number" ? body.photoZoom : 1,
      typeof body.photoFocusY === "number" ? body.photoFocusY : 18,
      body.specialty ? String(body.specialty) : null,
      body.phone ? String(body.phone) : null,
      body.email ? String(body.email) : null,
      body.bio ?? "",
      typeof body.order === "number" ? body.order : 99,
      body.active === false ? 0 : 1,
      slug,
    ],
  });

  return j({ ok: true, slug: finalSlug });
};

export const DELETE: APIRoute = async ({ params }) => {
  const slug = String(params.slug ?? "");
  if (!slug) return j({ error: "Falta slug" }, 400);
  const r = await db.execute({
    sql: "DELETE FROM lawyers WHERE slug = ?",
    args: [slug],
  });
  if (r.rowsAffected === 0) return j({ error: "No encontrado" }, 404);
  return j({ ok: true });
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
