/**
 * scripts/fill-empty-bodies.ts
 *
 * Para cada post tipo 'videoteca' cuyo `body` esté vacío o tenga menos de 20
 * caracteres reales de texto (descartando tags HTML), copia el `excerpt` al
 * `body` envuelto en <p>...</p>.
 *
 * Es idempotente: si el post ya tiene contenido real, se salta.
 *
 * Ejecutar:
 *   npx tsx scripts/fill-empty-bodies.ts
 */
import "dotenv/config";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[c]!));
}

// Cuenta caracteres reales (sin tags ni whitespace excesivo)
function textLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")    // quita tags
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .length;
}

console.log("→ Buscando posts videoteca con contenido vacío…");
const res = await db.execute(
  "SELECT id, slug, title, excerpt, body FROM posts WHERE type = 'videoteca'"
);

let updated = 0;
let skipped_has_body = 0;
let skipped_no_excerpt = 0;

for (const r of res.rows as any[]) {
  const id = Number(r.id);
  const slug = String(r.slug);
  const excerpt = String(r.excerpt ?? "").trim();
  const body = String(r.body ?? "");
  const realLen = textLength(body);

  if (realLen >= 20) {
    skipped_has_body++;
    continue;
  }
  if (!excerpt) {
    console.log(`  ⚠ ${slug}  body vacío + sin excerpt — no hay nada que copiar`);
    skipped_no_excerpt++;
    continue;
  }

  // Convertir el excerpt en HTML simple. Si tiene saltos de línea, los volvemos párrafos.
  const paragraphs = excerpt.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const newBody = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  await db.execute({
    sql: "UPDATE posts SET body = ?, updated_at = datetime('now') WHERE id = ?",
    args: [newBody, id],
  });
  console.log(`  ✔ ${slug}  (${excerpt.slice(0, 60)}${excerpt.length > 60 ? "…" : ""})`);
  updated++;
}

console.log("");
console.log(`Actualizados:                ${updated}`);
console.log(`Saltados (ya tenían texto):  ${skipped_has_body}`);
console.log(`Saltados (sin excerpt):       ${skipped_no_excerpt}`);
console.log("\n✅ Listo.");
