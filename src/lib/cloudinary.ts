/**
 * Helper de Cloudinary — subida server-side via `cloudinary` SDK.
 *
 * Usa unsigned upload no — usamos las credenciales server-side
 * (CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET) para autenticar.
 *
 * Las imágenes suben a la carpeta "ortega-ortega/" en Cloudinary.
 */
import { v2 as cloudinary } from "cloudinary";

let configured = false;
function env(key: string): string | undefined {
  // En Astro dev (Vite) las variables del .env solo viven en import.meta.env.
  // En producción (Netlify) viven en process.env. Soportamos ambos.
  return (
    (typeof process !== "undefined" && process.env?.[key]) ||
    (import.meta as any).env?.[key] ||
    undefined
  );
}

function ensureConfig() {
  if (configured) return;
  const cloud_name = env("CLOUDINARY_CLOUD_NAME");
  const api_key = env("CLOUDINARY_API_KEY");
  const api_secret = env("CLOUDINARY_API_SECRET");
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      `[cloudinary] Faltan credenciales en .env. cloud_name=${cloud_name ? "✓" : "✗"} api_key=${api_key ? "✓" : "✗"} api_secret=${api_secret ? "✓" : "✗"}`
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export interface UploadResult {
  url: string;            // https://res.cloudinary.com/.../image/upload/v.../public_id.jpg
  publicId: string;       // ortega-ortega/abc123
  width: number;
  height: number;
  format: string;         // jpg/png/webp
  bytes: number;
}

/**
 * Sube un buffer a Cloudinary. `folder` opcional, default "ortega-ortega".
 */
export async function uploadBuffer(
  buffer: Buffer,
  opts?: { folder?: string; filename?: string }
): Promise<UploadResult> {
  ensureConfig();
  const folder = opts?.folder ?? "ortega-ortega";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Optimización: subimos en máxima calidad pero Cloudinary entrega WebP/AVIF al cliente.
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        public_id: opts?.filename
          ? opts.filename.replace(/\.[^.]+$/, "").replace(/[^\w-]/g, "-")
          : undefined,
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Sin respuesta de Cloudinary"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}
