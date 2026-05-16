/**
 * POST /api/admin/upload
 *
 * Recibe un FormData con un campo `file` (imagen) y opcionalmente `folder`.
 * Sube a Cloudinary y devuelve { url, width, height }.
 *
 * Solo accesible para usuarios autenticados (protegido por middleware).
 */
import type { APIRoute } from "astro";
import { uploadBuffer } from "@/lib/cloudinary";

export const prerender = false;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export const POST: APIRoute = async ({ request }) => {
  const ct = request.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("multipart/form-data")) {
    return j({ error: "Debe enviarse como multipart/form-data" }, 400);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return j({ error: "FormData inválido" }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return j({ error: "Falta el archivo (campo `file`)" }, 400);
  if (file.size > MAX_BYTES) return j({ error: "El archivo excede 10 MB" }, 413);
  if (!ACCEPTED.includes(file.type)) {
    return j({ error: `Tipo no permitido: ${file.type}` }, 415);
  }

  const folder = (form.get("folder") as string) || "ortega-ortega";

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buf, { folder, filename: file.name });
    return j({
      ok: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const httpCode = e?.http_code;
    console.error("[upload] error:", msg, e);
    // Devolver detalle al cliente — este endpoint está protegido por auth admin.
    return j({
      error: `Cloudinary: ${msg}${httpCode ? ` (HTTP ${httpCode})` : ""}`,
      detail: {
        msg,
        httpCode,
        cloud_name_set: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key_set: !!process.env.CLOUDINARY_API_KEY,
        api_secret_set: !!process.env.CLOUDINARY_API_SECRET,
      },
    }, 500);
  }
};

function j(p: unknown, s = 200) {
  return new Response(JSON.stringify(p), { status: s, headers: { "Content-Type": "application/json" } });
}
