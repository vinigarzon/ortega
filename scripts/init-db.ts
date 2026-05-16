/**
 * scripts/init-db.ts
 * -------------------------------------------------------------------
 * Bootstrap de la BD Turso:
 *   1. Ejecuta `db/schema.sql` con `executeMultiple` (un solo request).
 *   2. Inserta los usuarios admin definidos en ADMIN_BOOTSTRAP_USERS.
 *   3. Inserta la fila singleton de gallery_config (id=1) si no existe.
 *
 * Ejecutar:
 *   npm run db:init
 *
 * Es IDEMPOTENTE: se puede correr varias veces sin perder datos.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error("✗ Falta TURSO_URL en .env");
  process.exit(1);
}
const db = createClient({ url, authToken });

// ---------- 1. Schema ---------------------------------------------------------
console.log("→ Aplicando schema…");
const schemaSql = readFileSync(resolve(ROOT, "db/schema.sql"), "utf8");

// `executeMultiple` corre todos los statements en un solo request HTTP, lo que
// evita el problema de streams Hrana cerrándose entre statements (404).
try {
  await db.executeMultiple(schemaSql);
  console.log("  ✔ schema aplicado");
} catch (e: any) {
  console.error("✗ Error aplicando schema:", e.message ?? e);
  throw e;
}

// ---------- 2. Singleton gallery_config --------------------------------------
console.log("→ Sembrando gallery_config (singleton)…");
await db.execute({
  sql: `INSERT OR IGNORE INTO gallery_config
        (id, autoplay, interval_seconds, transition_ms, show_arrows, show_dots, pause_on_hover)
        VALUES (1, 1, 5, 700, 1, 1, 1)`,
  args: [],
});
console.log("  ✔ gallery_config listo");

// ---------- 3. Usuarios admin -------------------------------------------------
const adminList = (process.env.ADMIN_BOOTSTRAP_USERS ?? "").trim();
if (!adminList) {
  console.warn("⚠ ADMIN_BOOTSTRAP_USERS está vacío — no se sembrarán usuarios.");
} else {
  console.log("→ Sembrando usuarios admin…");
  const pairs = adminList
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const idx = p.indexOf(":");
      if (idx < 0) return null;
      const email = p.slice(0, idx).trim().toLowerCase();
      const password = p.slice(idx + 1).trim();
      if (!email || !password) return null;
      return { email, password };
    })
    .filter((x): x is { email: string; password: string } => x !== null);

  for (const { email, password } of pairs) {
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ? LIMIT 1",
      args: [email],
    });
    if (existing.rows.length > 0) {
      console.log(`  • ${email}  (ya existía, sin cambios)`);
      continue;
    }
    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')`,
      args: [email, hash],
    });
    console.log(`  ✔ ${email}  (creado)`);
  }
}

console.log("\n✅ Base de datos inicializada correctamente.\n");
