/**
 * Capa de queries tipadas sobre Turso. La usan tanto el admin como las
 * páginas públicas, de modo que cambiar la BD se refleja al instante.
 *
 * Convención: las funciones devuelven objetos planos JS, listos para .astro.
 */
import { db } from "./db";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
export interface Post {
  id: number;
  slug: string;
  title: string;
  date: string;
  type: "blog" | "videoteca";
  category: string;
  tags: string[];
  excerpt: string | null;
  body: string;
  featuredImage: string | null;
  videoEmbed: string | null;
  author: string;
  seoTitle: string | null;
  seoDescription: string | null;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lawyer {
  id: number;
  slug: string;
  name: string;
  position: string;
  photo: string | null;
  photoZoom: number;
  photoFocusY: number;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  bio: string;
  order: number;
  active: boolean;
}

export interface GalleryItem {
  id: number;
  image: string;
  caption: string | null;
  category: string;
  order: number;
}

export interface GalleryConfig {
  autoplay: boolean;
  intervalSeconds: number;
  transitionMs: number;
  showArrows: boolean;
  showDots: boolean;
  pauseOnHover: boolean;
}

// ---------------------------------------------------------------------------
// Helpers de mapeo
// ---------------------------------------------------------------------------
function mapPost(r: any): Post {
  let tags: string[] = [];
  try { tags = r.tags ? JSON.parse(String(r.tags)) : []; if (!Array.isArray(tags)) tags = []; } catch { tags = []; }
  return {
    id: Number(r.id),
    slug: String(r.slug),
    title: String(r.title),
    date: String(r.date),
    type: r.type === "videoteca" ? "videoteca" : "blog",
    category: String(r.category ?? "Entrevistas"),
    tags,
    excerpt: r.excerpt ?? null,
    body: String(r.body ?? ""),
    featuredImage: r.featured_image ?? null,
    videoEmbed: r.video_embed ?? null,
    author: String(r.author ?? "Ortega & Ortega Abogados"),
    seoTitle: r.seo_title ?? null,
    seoDescription: r.seo_description ?? null,
    draft: Number(r.draft) === 1,
    createdAt: String(r.created_at ?? ""),
    updatedAt: String(r.updated_at ?? ""),
  };
}

function mapLawyer(r: any): Lawyer {
  return {
    id: Number(r.id),
    slug: String(r.slug),
    name: String(r.name),
    position: String(r.position ?? ""),
    photo: r.photo ?? null,
    photoZoom: Number(r.photo_zoom ?? 1),
    photoFocusY: Number(r.photo_focus_y ?? 18),
    specialty: r.specialty ?? null,
    phone: r.phone ?? null,
    email: r.email ?? null,
    bio: String(r.bio ?? ""),
    order: Number(r.order ?? 99),
    active: Number(r.active) === 1,
  };
}

function mapGalleryItem(r: any): GalleryItem {
  return {
    id: Number(r.id),
    image: String(r.image),
    caption: r.caption ?? null,
    category: String(r.category ?? "oficina"),
    order: Number(r.order ?? 99),
  };
}

// ---------------------------------------------------------------------------
// POSTS
// ---------------------------------------------------------------------------
export async function listPosts(opts?: {
  type?: "blog" | "videoteca";
  includeDrafts?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const where: string[] = [];
  const args: any[] = [];
  if (!opts?.includeDrafts) where.push("draft = 0");
  if (opts?.type) {
    where.push("type = ?");
    args.push(opts.type);
  }
  if (opts?.category) {
    where.push("category = ?");
    args.push(opts.category);
  }
  const sql = `SELECT * FROM posts
               ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY date DESC, id DESC
               ${opts?.limit ? "LIMIT ?" : ""}
               ${opts?.limit && opts?.offset ? "OFFSET ?" : ""}`;
  if (opts?.limit) args.push(opts.limit);
  if (opts?.limit && opts?.offset) args.push(opts.offset);
  const res = await db.execute({ sql, args });
  return res.rows.map(mapPost);
}

export async function countPosts(opts?: {
  type?: "blog" | "videoteca";
  includeDrafts?: boolean;
  category?: string;
}): Promise<number> {
  const where: string[] = [];
  const args: any[] = [];
  if (!opts?.includeDrafts) where.push("draft = 0");
  if (opts?.type) {
    where.push("type = ?");
    args.push(opts.type);
  }
  if (opts?.category) {
    where.push("category = ?");
    args.push(opts.category);
  }
  const res = await db.execute({
    sql: `SELECT COUNT(*) AS n FROM posts ${where.length ? "WHERE " + where.join(" AND ") : ""}`,
    args,
  });
  return Number((res.rows[0] as any).n ?? 0);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const res = await db.execute({
    sql: "SELECT * FROM posts WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (res.rows.length === 0) return null;
  return mapPost(res.rows[0]);
}

export async function listCategories(type?: "blog" | "videoteca"): Promise<string[]> {
  const where = ["draft = 0"];
  const args: any[] = [];
  if (type) {
    where.push("type = ?");
    args.push(type);
  }
  const res = await db.execute({
    sql: `SELECT DISTINCT category FROM posts WHERE ${where.join(" AND ")} ORDER BY category`,
    args,
  });
  return res.rows.map((r: any) => String(r.category));
}

// ---------------------------------------------------------------------------
// LAWYERS
// ---------------------------------------------------------------------------
export async function listLawyers(opts?: { activeOnly?: boolean }): Promise<Lawyer[]> {
  const sql = `SELECT * FROM lawyers
               ${opts?.activeOnly ? "WHERE active = 1" : ""}
               ORDER BY "order" ASC, name ASC`;
  const res = await db.execute(sql);
  return res.rows.map(mapLawyer);
}

export async function getLawyerBySlug(slug: string): Promise<Lawyer | null> {
  const res = await db.execute({
    sql: "SELECT * FROM lawyers WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  if (res.rows.length === 0) return null;
  return mapLawyer(res.rows[0]);
}

// ---------------------------------------------------------------------------
// GALLERY
// ---------------------------------------------------------------------------
export async function getGalleryConfig(): Promise<GalleryConfig> {
  const res = await db.execute("SELECT * FROM gallery_config WHERE id = 1");
  const r: any = res.rows[0] ?? {};
  return {
    autoplay: Number(r.autoplay ?? 1) === 1,
    intervalSeconds: Number(r.interval_seconds ?? 5),
    transitionMs: Number(r.transition_ms ?? 700),
    showArrows: Number(r.show_arrows ?? 1) === 1,
    showDots: Number(r.show_dots ?? 1) === 1,
    pauseOnHover: Number(r.pause_on_hover ?? 1) === 1,
  };
}

export async function listGalleryItems(): Promise<GalleryItem[]> {
  const res = await db.execute(
    'SELECT * FROM gallery_items ORDER BY "order" ASC, id ASC'
  );
  return res.rows.map(mapGalleryItem);
}

// ---------------------------------------------------------------------------
// SETTINGS (k/v JSON)
// ---------------------------------------------------------------------------
const settingsCache = new Map<string, unknown>();

export async function getSetting<T = any>(key: string): Promise<T | null> {
  // Cache muy ligero in-memory por proceso (Netlify Functions ya hace cold start
  // por instancia, así no martillamos la BD desde footer/header en cada render).
  if (settingsCache.has(key)) return settingsCache.get(key) as T;
  const res = await db.execute({
    sql: "SELECT value FROM settings WHERE key = ? LIMIT 1",
    args: [key],
  });
  if (res.rows.length === 0) return null;
  try {
    const v = JSON.parse(String((res.rows[0] as any).value));
    settingsCache.set(key, v);
    return v as T;
  } catch {
    return null;
  }
}

/** Invalida el caché de settings (llamar tras un PUT en admin). */
export function invalidateSettingsCache(key?: string) {
  if (key) settingsCache.delete(key);
  else settingsCache.clear();
}
