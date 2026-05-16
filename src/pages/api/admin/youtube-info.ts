/**
 * GET /api/admin/youtube-info?url=<youtube_url>
 *
 * Devuelve metadatos públicos del video usando YouTube oEmbed (sin API key):
 *   { id, title, author, thumbnail, suggestedTitle, suggestedExcerpt }
 *
 * También puede invocar a Claude para generar un resumen real (1-2 frases)
 * si la variable de entorno ANTHROPIC_API_KEY está configurada.
 */
import type { APIRoute } from "astro";

export const prerender = false;

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/|v\/)([a-zA-Z0-9_-]{11})/,
    /i\.ytimg\.com\/vi\/([a-zA-Z0-9_-]{11})\//,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function getEnv(k: string): string | undefined {
  return (typeof process !== "undefined" && process.env?.[k]) ||
    (import.meta as any).env?.[k] ||
    undefined;
}

async function generateExcerptWithClaude(title: string, author: string): Promise<string | null> {
  const key = getEnv("ANTHROPIC_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Eres redactor de un despacho de abogados en Ecuador. Te paso el título de un video de YouTube de una entrevista o análisis legal. Devuelve UNA O DOS frases en español neutro, sin marcas ni hashtags, que sirvan como resumen breve para el listado del sitio web.

Título: "${title}"
Canal: "${author}"

Responde solo con el resumen, sin comillas ni introducción.`
        }],
      }),
    });
    const data = await res.json() as any;
    const text = data?.content?.[0]?.text;
    if (typeof text === "string") return text.trim();
    return null;
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ url }) => {
  const ytUrl = url.searchParams.get("url") ?? "";
  const id = extractYouTubeId(ytUrl);
  if (!id) return j({ error: "URL de YouTube no válida" }, 400);

  // oEmbed público de YouTube
  let title = "", author = "";
  try {
    const oRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
    if (oRes.ok) {
      const oData = await oRes.json() as any;
      title = String(oData?.title ?? "").trim();
      author = String(oData?.author_name ?? "").trim();
    }
  } catch {
    // ignoramos, devolveremos lo que tengamos
  }

  // Resumen mejorado vía Claude (si está configurado)
  let suggestedExcerpt = "";
  if (title) {
    const aiExcerpt = await generateExcerptWithClaude(title, author);
    suggestedExcerpt = aiExcerpt ||
      (author ? `${title} — Entrevista en ${author}.` : title);
  }

  return j({
    ok: true,
    id,
    title,
    author,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    suggestedTitle: title,
    suggestedExcerpt,
    aiUsed: !!getEnv("ANTHROPIC_API_KEY"),
  });
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
