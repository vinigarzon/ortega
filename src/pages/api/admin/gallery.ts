/**
 * PUT /api/admin/gallery
 *
 * Body JSON:
 * {
 *   config: { autoplay, intervalSeconds, transitionMs, showArrows, showDots, pauseOnHover },
 *   items:  [{ image, caption, category, order }, ...]   // reemplaza todos
 * }
 *
 * Estrategia: actualizar el singleton de config y reemplazar el array de items.
 */
import type { APIRoute } from "astro";
import { db } from "@/lib/db";

export const prerender = false;

export const PUT: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); }
  catch { return j({ error: "JSON inválido" }, 400); }

  const cfg = body.config ?? {};
  await db.execute({
    sql: `UPDATE gallery_config SET
            autoplay         = ?,
            interval_seconds = ?,
            transition_ms    = ?,
            show_arrows      = ?,
            show_dots        = ?,
            pause_on_hover   = ?
          WHERE id = 1`,
    args: [
      cfg.autoplay === false ? 0 : 1,
      Math.max(2, Math.min(30, Number(cfg.intervalSeconds) || 5)),
      Math.max(200, Math.min(3000, Number(cfg.transitionMs) || 700)),
      cfg.showArrows === false ? 0 : 1,
      cfg.showDots === false ? 0 : 1,
      cfg.pauseOnHover === false ? 0 : 1,
    ],
  });

  const items = Array.isArray(body.items) ? body.items : [];
  await db.execute("DELETE FROM gallery_items");
  let i = 0;
  for (const it of items) {
    if (!it.image) continue;
    i++;
    await db.execute({
      sql: `INSERT INTO gallery_items (image, caption, category, "order") VALUES (?, ?, ?, ?)`,
      args: [
        String(it.image),
        it.caption ? String(it.caption) : null,
        it.category ? String(it.category) : "oficina",
        typeof it.order === "number" ? it.order : i,
      ],
    });
  }

  return j({ ok: true, count: i });
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
