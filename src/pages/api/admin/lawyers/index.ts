/**
 * POST /api/admin/lawyers — crear abogado
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); }
  catch { return j({ error: "JSON inválido" }, 400); }

  const name = String(body.name ?? "").trim();
  if (!name) return j({ error: "El nombre es obligatorio." }, 400);

  const existing = await db.execute("SELECT slug FROM lawyers");
  const taken = new Set(existing.rows.map((r: any) => String(r.slug)));
  let slug = String(body.slug ?? "").trim() || slugify(name);
  if (!slug) return j({ error: "No se pudo generar el slug." }, 400);
  if (taken.has(slug)) slug = uniqueSlug(slug, taken);

  await db.execute({
    sql: `INSERT INTO lawyers
            (slug, name, position, photo, photo_zoom, photo_focus_y,
             specialty, phone, email, bio, "order", active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      name,
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
    ],
  });

  return j({ ok: true, slug });
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
