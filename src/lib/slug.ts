/**
 * Slugifica un string al estilo WP / Astro (lowercase, sin acentos, kebab).
 *   "El Caso Belén"  →  "el-caso-belen"
 */
export function slugify(input: string): string {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // quita puntuación
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

/**
 * Garantiza unicidad chocando contra una lista de slugs existentes.
 * Si ya existe, agrega -2, -3, etc.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  let s = slugify(base) || "publicacion";
  if (!taken.has(s)) return s;
  let i = 2;
  while (taken.has(`${s}-${i}`)) i++;
  return `${s}-${i}`;
}
