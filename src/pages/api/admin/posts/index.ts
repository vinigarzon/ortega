/**
 * POST /api/admin/posts  → crear post
 *
 * Body JSON: {
 *   title, slug?, date, type ("blog"|"videoteca"), category,
 *   excerpt?, body, featuredImage?, videoEmbed?, author?,
 *   seoTitle?, seoDescription?, draft?
 * }
 *
 * Si no se da `slug`, se genera desde el título.
 * Si el slug colisiona, se incrementa con sufijo numérico.
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";
import { slugify, uniqueSlug } from "@/lib/slug";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return j({ error: "JSON inválido" }, 400);
  }

  const title = String(body.title ?? "").trim();
  if (!title) return j({ error: "El título es obligatorio." }, 400);

  // Slug: usa el provisto si viene, sino derivar del título.
  // Asegurar unicidad consultando los existentes.
  const existing = await db.execute("SELECT slug FROM posts");
  const taken = new Set(existing.rows.map((r: any) => String(r.slug)));
  let slug = String(body.slug ?? "").trim();
  slug = slug ? slugify(slug) : slugify(title);
  if (!slug) return j({ error: "No se pudo generar el slug." }, 400);
  if (taken.has(slug)) slug = uniqueSlug(slug, taken);

  const date = normalizeDate(body.date);
  const type = body.type === "videoteca" ? "videoteca" : "blog";
  const draft = body.draft === true ? 1 : 0;

  const tagsArr = Array.isArray(body.tags)
    ? body.tags.map((t: any) => String(t).trim()).filter(Boolean).slice(0, 30)
    : [];

  await db.execute({
    sql: `INSERT INTO posts
            (slug, title, date, type, category, excerpt, body,
             featured_image, video_embed, author,
             seo_title, seo_description, draft, tags)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      slug,
      title,
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
    ],
  });

  return j({ ok: true, slug });
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
