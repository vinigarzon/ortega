/**
 * scripts/db-check.ts — diagnóstico mínimo de la conexión a Turso.
 *
 * Corre 3 pruebas:
 *   1. SELECT 1           → confirma que el endpoint responde + auth OK.
 *   2. List tables        → muestra qué tablas existen ahora mismo.
 *   3. CREATE TEMP TABLE  → confirma que el servidor acepta DDL.
 *
 * Si la #1 falla → URL o token están mal.
 * Si la #1 pasa y la #3 falla → problema específico del schema o permisos.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log("URL :", url);
console.log("Token:", authToken ? `${authToken.slice(0, 20)}…(${authToken.length} chars)` : "(ausente)");
console.log("");

if (!url) {
  console.error("✗ Falta TURSO_URL en .env");
  process.exit(1);
}

const db = createClient({ url, authToken });

// ---------- Test 1: SELECT 1 -----------
try {
  const r = await db.execute("SELECT 1 AS ok");
  console.log("✔ Test 1 (SELECT 1):", r.rows[0]);
} catch (e: any) {
  console.error("✗ Test 1 falló:", e.message ?? e);
  process.exit(1);
}

// ---------- Test 2: list tables ----------
try {
  const r = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    "✔ Test 2 (tablas existentes):",
    r.rows.map((row) => row.name).join(", ") || "(ninguna)"
  );
} catch (e: any) {
  console.error("✗ Test 2 falló:", e.message ?? e);
}

// ---------- Test 3: CREATE TABLE de prueba ----------
try {
  await db.execute("CREATE TABLE IF NOT EXISTS _db_check (x INTEGER)");
  await db.execute("DROP TABLE _db_check");
  console.log("✔ Test 3 (CREATE/DROP TABLE): OK");
} catch (e: any) {
  console.error("✗ Test 3 falló:", e.message ?? e);
}

console.log("\nDiagnóstico completo.");
