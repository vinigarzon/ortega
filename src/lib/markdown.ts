/**
 * Markdown rendering helpers.
 *
 *  - renderInline()  → tiny renderer para strings cortos del admin (no usa marked).
 *  - renderBody()    → renderiza Markdown completo a HTML usando marked.
 *                      El input puede ser Markdown puro o HTML — marked
 *                      acepta ambos (las etiquetas HTML pasan al output).
 */
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderInline(input: string | undefined | null): string {
  if (!input) return "";
  let html = String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  const paragraphs = html.split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br>"));
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
}

/**
 * Renderiza el cuerpo de un post o biografía a HTML.
 *
 * Acepta:
 *   - Markdown puro (## Título, **negrita**, etc.)
 *   - HTML ya construido (como los posts migrados de WordPress)
 *   - Una mezcla de ambos
 */
export function renderBody(input: string | undefined | null): string {
  if (!input) return "";
  const txt = String(input).trim();
  if (!txt) return "";
  return marked.parse(txt, { async: false }) as string;
}
