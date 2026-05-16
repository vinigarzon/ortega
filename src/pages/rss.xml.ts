import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { listPosts } from "@/lib/queries";

// SSR para que el feed siempre refleje el estado actual de Turso.
export const prerender = false;

export async function GET(context: APIContext) {
  const posts = await listPosts(); // solo publicados, ambos tipos
  return rss({
    title: "Ortega & Ortega Abogados — Blog",
    description:
      "Entrevistas, análisis y novedades jurídicas de Ortega & Ortega Abogados.",
    site: context.site!,
    items: posts.map((p) => ({
      title: p.title,
      pubDate: new Date(p.date),
      description: p.excerpt ?? "",
      link: `/${p.type === "videoteca" ? "videoteca" : "blog"}/${p.slug}/`,
      categories: p.category ? [p.category] : [],
    })),
  });
}
