/**
 * PUT    /api/admin/posts/[slug] → actualizar
 * DELETE /api/admin/posts/[slug] → eliminar
 *
 * Para cambiar el slug, manda `newSlug` en el body del PUT.
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const slug = String(params.slug ?? "");
  if (!slug) return j({ error: "Falta slug" }, 400);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return j({ error: "JSON inválido" }, 400);
  }

  // Confirmar que el post existe
  const cur = await db.execute({
    sql: "SELECT id FROM posts WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (cur.rows.length === 0) return j({ error: "No encontrado" }, 404);

  // Cambio de slug opcional
  let finalSlug = slug;
  const newSlugRaw = String(body.newSlug ?? "").trim();
  if (newSlugRaw) {
    const cand = slugify(newSlugRaw);
    if (cand !== slug) {
      const others = await db.execute({
        sql: "SELECT slug FROM posts WHERE slug != ?",
        args: [slug],
      });
      const taken = new Set(others.rows.map((r: any) => String(r.slug)));
      finalSlug = taken.has(cand) ? uniqueSlug(cand, taken) : cand;
    }
  }

  const date = normalizeDate(body.date);
  const type = body.type === "videoteca" ? "videoteca" : "blog";
  const draft = body.draft === true ? 1 : 0;

  const tagsArr = Array.isArray(body.tags)
    ? body.tags.map((t: any) => String(t).trim()).filter(Boolean).slice(0, 30)
    : [];

  await db.execute({
    sql: `UPDATE posts SET
            slug            = ?,
            title           = ?,
            date            = ?,
            type            = ?,
            category        = ?,
            excerpt         = ?,
            body            = ?,
            featured_image  = ?,
            video_embed     = ?,
            author          = ?,
            seo_title       = ?,
            seo_description = ?,
            draft           = ?,
            tags            = ?,
            updated_at      = datetime('now')
          WHERE slug = ?`,
    args: [
      finalSlug,
      String(body.title ?? "").trim(),
      date,
      type,
      body.category ? String(body.category).trim() : "Entrevistas",
      body.excerpt ? String(body.excerpt) : null,
      body.body ?? "",
      body.featuredImage ? String(body.featuredImage) : null,
      body.videoEmbed ? String(body.videoEmbed) : null,
      body.author ? String(body.author) : "Ortega & Ortega Abogados",
      body.seoTitle ? String(body.seoTitle) : null,
      body.seoDescription ? String(body.seoDescription) : null,
      draft,
      JSON.stringify(tagsArr),
      slug,
    ],
  });

  return j({ ok: true, slug: finalSlug });
};

export const DELETE: APIRoute = async ({ params }) => {
  const slug = String(params.slug ?? "");
  if (!slug) return j({ error: "Falta slug" }, 400);
  const r = await db.execute({
    sql: "DELETE FROM posts WHERE slug = ?",
    args: [slug],
  });
  if (r.rowsAffected === 0) return j({ error: "No encontrado" }, 404);
  return j({ ok: true });
};

function normalizeDate(raw: unknown): string {
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "string" && raw.length >= 10) return raw.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function j(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
