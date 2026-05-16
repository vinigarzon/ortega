/**
 * scripts/migrate-content.ts
 * -------------------------------------------------------------------
 * Migra el contenido actual del sitio (Content Collections de Astro)
 * hacia las tablas de Turso:
 *
 *   src/content/blog/*.md          → tabla `posts`
 *   src/content/lawyers/*.md       → tabla `lawyers`
 *   src/content/gallery/main.json  → tabla `gallery_items` + `gallery_config`
 *   src/content/settings/*.json    → tabla `settings` (k/v JSON)
 *
 * IDEMPOTENTE: blog y lawyers usan INSERT OR REPLACE keyed por `slug`;
 * gallery_items se trunca antes de insertar (no tiene clave natural);
 * settings usa INSERT OR REPLACE keyed por `key`.
 *
 * Ejecutar:
 *   npm run db:migrate
 */
import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CONTENT = resolve(ROOT, "src/content");

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error("✗ Falta TURSO_URL en .env");
  process.exit(1);
}
const db = createClient({ url, authToken });

// ============================================================================
// 1) POSTS  (src/content/blog/*.md → posts)
// ============================================================================
async function migratePosts() {
  const dir = resolve(CONTENT, "blog");
  if (!existsSync(dir)) {
    console.warn("⚠ src/content/blog no existe, salto posts.");
    return;
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  console.log(`→ Migrando ${files.length} posts…`);

  let ok = 0;
  let skipped = 0;
  for (const file of files) {
    const raw = readFileSync(resolve(dir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/i, "");

    if (!data.title) {
      console.warn(`  • ${slug}  ⚠ sin título — saltado`);
      skipped++;
      continue;
    }

    // Date: puede venir como Date object o string. Lo normalizamos a YYYY-MM-DD.
    let date: string;
    if (data.date instanceof Date) {
      date = data.date.toISOString().slice(0, 10);
    } else if (typeof data.date === "string") {
      date = data.date.slice(0, 10);
    } else {
      date = new Date().toISOString().slice(0, 10);
    }

    const draft = data.draft === true ? 1 : 0;

    await db.execute({
      sql: `INSERT INTO posts
              (slug, title, date, type, category, excerpt, body,
               featured_image, video_embed, author,
               seo_title, seo_description, draft, updated_at)
            VALUES
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(slug) DO UPDATE SET
              title           = excluded.title,
              date            = excluded.date,
              type            = excluded.type,
              category        = excluded.category,
              excerpt         = excluded.excerpt,
              body            = excluded.body,
              featured_image  = excluded.featured_image,
              video_embed     = excluded.video_embed,
              author          = excluded.author,
              seo_title       = excluded.seo_title,
              seo_description = excluded.seo_description,
              draft           = excluded.draft,
              updated_at      = datetime('now')
            `,
      args: [
        slug,
        String(data.title),
        date,
        data.type === "videoteca" ? "videoteca" : "blog",
        data.category ? String(data.category) : "Entrevistas",
        data.excerpt ? String(data.excerpt) : null,
        content ?? "",
        data.featuredImage ? String(data.featuredImage) : null,
        data.videoEmbed ? String(data.videoEmbed) : null,
        data.author ? String(data.author) : "Ortega & Ortega Abogados",
        data.seoTitle ? String(data.seoTitle) : null,
        data.seoDescription ? String(data.seoDescription) : null,
        draft,
      ],
    });
    ok++;
  }
  console.log(`  ✔ ${ok} posts migrados (saltados: ${skipped})`);
}

// ============================================================================
// 2) LAWYERS  (src/content/lawyers/*.md → lawyers)
// ============================================================================
async function migrateLawyers() {
  const dir = resolve(CONTENT, "lawyers");
  if (!existsSync(dir)) {
    console.warn("⚠ src/content/lawyers no existe, salto lawyers.");
    return;
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  console.log(`→ Migrando ${files.length} abogados…`);

  for (const file of files) {
    const raw = readFileSync(resolve(dir, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/i, "");

    await db.execute({
      sql: `INSERT INTO lawyers
              (slug, name, position, photo, photo_zoom, photo_focus_y,
               specialty, phone, email, bio, "order", active, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(slug) DO UPDATE SET
              name          = excluded.name,
              position      = excluded.position,
              photo         = excluded.photo,
              photo_zoom    = excluded.photo_zoom,
              photo_focus_y = excluded.photo_focus_y,
              specialty     = excluded.specialty,
              phone         = excluded.phone,
              email         = excluded.email,
              bio           = excluded.bio,
              "order"       = excluded."order",
              active        = excluded.active,
              updated_at    = datetime('now')
            `,
      args: [
        slug,
        String(data.name ?? slug),
        String(data.position ?? ""),
        data.photo ? String(data.photo) : null,
        typeof data.photoZoom === "number" ? data.photoZoom : 1,
        typeof data.photoFocusY === "number" ? data.photoFocusY : 18,
        data.specialty ? String(data.specialty) : null,
        data.phone ? String(data.phone) : null,
        data.email ? String(data.email) : null,
        content ?? "",
        typeof data.order === "number" ? data.order : 99,
        data.active === false ? 0 : 1,
      ],
    });
  }
  console.log(`  ✔ ${files.length} abogados migrados`);
}

// ============================================================================
// 3) GALLERY  (src/content/gallery/main.json → gallery_config + gallery_items)
// ============================================================================
async function migrateGallery() {
  const file = resolve(CONTENT, "gallery/main.json");
  if (!existsSync(file)) {
    console.warn("⚠ gallery/main.json no existe, salto galería.");
    return;
  }
  console.log("→ Migrando galería…");
  const data = JSON.parse(readFileSync(file, "utf8"));

  // 3a. config (singleton id=1)
  await db.execute({
    sql: `INSERT INTO gallery_config
            (id, autoplay, interval_seconds, transition_ms,
             show_arrows, show_dots, pause_on_hover)
          VALUES (1, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            autoplay         = excluded.autoplay,
            interval_seconds = excluded.interval_seconds,
            transition_ms    = excluded.transition_ms,
            show_arrows      = excluded.show_arrows,
            show_dots        = excluded.show_dots,
            pause_on_hover   = excluded.pause_on_hover`,
    args: [
      data.autoplay === false ? 0 : 1,
      typeof data.intervalSeconds === "number" ? data.intervalSeconds : 5,
      typeof data.transitionMs === "number" ? data.transitionMs : 700,
      data.showArrows === false ? 0 : 1,
      data.showDots === false ? 0 : 1,
      data.pauseOnHover === false ? 0 : 1,
    ],
  });

  // 3b. items: limpiar y re-insertar
  await db.execute("DELETE FROM gallery_items");
  const items = Array.isArray(data.items) ? data.items : [];
  for (const it of items) {
    if (!it.image) continue;
    await db.execute({
      sql: `INSERT INTO gallery_items (image, caption, category, "order")
            VALUES (?, ?, ?, ?)`,
      args: [
        String(it.image),
        it.caption ? String(it.caption) : null,
        it.category ? String(it.category) : "oficina",
        typeof it.order === "number" ? it.order : 99,
      ],
    });
  }
  console.log(`  ✔ config + ${items.length} items de galería`);
}

// ============================================================================
// 4) SETTINGS  (src/content/settings/*.json → tabla settings k/v JSON)
// ============================================================================
async function migrateSettings() {
  const dir = resolve(CONTENT, "settings");
  if (!existsSync(dir)) {
    console.warn("⚠ src/content/settings no existe, salto settings.");
    return;
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  console.log(`→ Migrando ${files.length} settings…`);

  for (const file of files) {
    const key = basename(file, ".json"); // site, seo, contact, footer, homepage
    const raw = readFileSync(resolve(dir, file), "utf8");
    // Validamos que sea JSON parseable antes de insertar
    const obj = JSON.parse(raw);
    await db.execute({
      sql: `INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET
              value      = excluded.value,
              updated_at = datetime('now')`,
      args: [key, JSON.stringify(obj)],
    });
  }
  console.log(`  ✔ ${files.length} settings migrados`);
}

// ============================================================================
// Run all
// ============================================================================
try {
  await migrateSettings();
  await migrateLawyers();
  await migrateGallery();
  await migratePosts();
  console.log("\n✅ Migración completada.\n");
} catch (e: any) {
  console.error("\n✗ Error en migración:", e.message ?? e);
  process.exit(1);
}
