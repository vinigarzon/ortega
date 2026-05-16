/**
 * Cliente libSQL para Turso.
 *
 * Lee TURSO_URL + TURSO_AUTH_TOKEN de las variables de entorno.
 *
 * Uso:
 *   import { db } from "@/lib/db";
 *   const rows = await db.execute("SELECT * FROM posts WHERE draft = 0");
 */
import { createClient, type Client } from "@libsql/client";

const url = process.env.TURSO_URL ?? import.meta.env?.TURSO_URL;
const authToken =
  process.env.TURSO_AUTH_TOKEN ?? import.meta.env?.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "[db] Falta TURSO_URL en las variables de entorno. Copia .env.example a .env y completa los valores."
  );
}

export const db: Client = createClient({
  url,
  authToken,
});

/** Helper: convierte una fila libSQL a objeto plano tipado. */
export function row<T = Record<string, unknown>>(r: unknown): T {
  return r as T;
}
