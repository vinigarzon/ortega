/**
 * scripts/download-yt-thumbs.ts
 *
 * Para cada post tipo "videoteca" en Turso cuya `featured_image` apunte a
 * i.ytimg.com:
 *   1. Descarga la imagen a `public/uploads/yt-thumbs/<VIDEO_ID>.jpg`
 *   2. Actualiza la fila en Turso reemplazando la URL externa por la ruta local.
 *
 * Es idempotente: si el archivo ya existe localmente, no lo redescarga.
 * Si el post ya apunta a /uploads/yt-thumbs/, no se toca.
 *
 * Ejecutar:
 *   npx tsx scripts/download-yt-thumbs.ts
 */
import "dotenv/config";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "public/uploads/yt-thumbs");

mkdirSync(OUT, { recursive: true });

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function extractYouTubeId(url: string): string | null {
  // i.ytimg.com/vi/<ID>/hqdefault.jpg  →  <ID>
  const m = url.match(/\/vi\/([a-zA-Z0-9_-]+)\//);
  return m ? m[1] : null;
}

async function downloadOne(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
}

const res = await db.execute(
  "SELECT id, slug, featured_image FROM posts WHERE featured_image LIKE '%i.ytimg.com%'"
);
console.log(`→ Encontrados ${res.rows.length} posts con thumbs externas de YouTube`);

let downloaded = 0;
let skipped = 0;
let failed = 0;
let updated = 0;

for (const r of res.rows) {
  const id = Number((r as any).id);
  const slug = String((r as any).slug);
  const url = String((r as any).featured_image);
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    console.log(`  ⚠ ${slug}: no se pudo extraer video ID de ${url}`);
    continue;
  }
  const filename = `${videoId}.jpg`;
  const localPath = resolve(OUT, filename);
  const newUrl = `/uploads/yt-thumbs/${filename}`;

  if (!existsSync(localPath)) {
    process.stdout.write(`  • ${slug}  descargando…  `);
    const ok = await downloadOne(url, localPath);
    if (!ok) {
      // Intentar con maxresdefault si falla
      const fallback = url.replace("hqdefault.jpg", "maxresdefault.jpg");
      const ok2 = await downloadOne(fallback, localPath);
      if (!ok2) { console.log("✗"); failed++; continue; }
    }
    console.log("✓");
    downloaded++;
  } else {
    skipped++;
  }

  // Actualizar Turso
  await db.execute({
    sql: "UPDATE posts SET featured_image = ?, updated_at = datetime('now') WHERE id = ?",
    args: [newUrl, id],
  });
  updated++;
}

console.log("");
console.log(`Descargadas: ${downloaded}`);
console.log(`Ya existían: ${skipped}`);
console.log(`Fallidas:    ${failed}`);
console.log(`URLs actualizadas en BD: ${updated}`);
console.log("\n✅ Listo. Las thumbs ahora se sirven desde /uploads/yt-thumbs/");
