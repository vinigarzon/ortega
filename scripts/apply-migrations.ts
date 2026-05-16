/**
 * scripts/apply-migrations.ts
 * Aplica todas las migraciones SQL en db/migrations/ en orden.
 * Es idempotente: detecta y salta las que ya están aplicadas.
 */
import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Detecta si una columna existe en una tabla.
async function columnExists(table: string, column: string): Promise<boolean> {
  const r = await db.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((row: any) => String(row.name) === column);
}

// Aplica una migración con detección específica para ALTER TABLE ADD COLUMN.
async function applyMigration(name: string, sql: string) {
  // Caso especial: ALTER TABLE posts ADD COLUMN tags ...
  if (/ALTER TABLE\s+posts\s+ADD COLUMN\s+tags\b/i.test(sql)) {
    if (await columnExists("posts", "tags")) {
      console.log(`  • ${name}  (columna tags ya existe — skip)`);
      return;
    }
  }
  await db.executeMultiple(sql);
  console.log(`  ✔ ${name}`);
}

const dir = resolve(ROOT, "db/migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
console.log(`→ Aplicando ${files.length} migración(es)…`);
for (const f of files) {
  const sql = readFileSync(resolve(dir, f), "utf8");
  await applyMigration(f, sql);
}
console.log("\n✅ Migraciones completadas.\n");
