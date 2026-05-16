/**
 * Netlify Function: recibe el formulario de contacto, envía 2 correos via Resend:
 *   1) Al despacho (CONTACT_TO) con los datos del lead.
 *   2) Al lead (acuse de recibo).
 *
 * Configuración (variables de entorno en Netlify y en .env local):
 *   - RESEND_API_KEY    = "re_..." (de https://resend.com/api-keys)
 *   - RESEND_FROM       = "Ortega & Ortega Abogados <ortega@gurumba.com>"
 *   - CONTACT_TO        = "orgabogados@hotmail.com"  (fallback)
 *   - SITE_URL          = "https://ortegaortegaabogados.com"  (para los enlaces y el logo)
 *
 * El destinatario REAL del lead se lee primero desde
 * src/content/settings/contact.json → contact.leadEmail (editable en /admin/).
 * Si no está definido, cae al env var CONTACT_TO.
 *
 * Configurar redirect en netlify.toml:
 *   /api/contact  → /.netlify/functions/contact
 */
import type { Handler } from "@netlify/functions";
import { Resend } from "resend";
import { createClient } from "@libsql/client";

/**
 * Lee el leadEmail desde Turso (tabla `settings` → key `contact` → contact.leadEmail).
 * Si no se puede, devuelve null y el handler cae al env var CONTACT_TO.
 */
async function getLeadEmailFromTurso(): Promise<string | null> {
  try {
    if (!process.env.TURSO_URL) return null;
    const db = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const r = await db.execute({
      sql: "SELECT value FROM settings WHERE key = ? LIMIT 1",
      args: ["contact"],
    });
    if (r.rows.length === 0) return null;
    const v = JSON.parse(String((r.rows[0] as any).value));
    const email = v?.contact?.leadEmail;
    return typeof email === "string" && email.includes("@") ? email : null;
  } catch (e) {
    console.error("[contact] No se pudo leer leadEmail de Turso:", e);
    return null;
  }
}

interface ContactPayload {
  nombre?: string;
  email?: string;
  celular?: string;
  asunto?: string;
  mensaje?: string;
  "bot-field"?: string; // honeypot
  "cf-turnstile-response"?: string; // Cloudflare Turnstile token (si está activo)
  _ts?: string; // timestamp del client (anti-bot: si llega antes de X ms es bot)
}

/**
 * Verifica el token de Cloudflare Turnstile. Si TURNSTILE_SECRET_KEY no está
 * definido, se considera el captcha "desactivado" y pasa siempre.
 */
async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // sin Turnstile configurado
  if (!token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function adminEmail(data: ContactPayload, siteUrl: string): string {
  const logo = `${siteUrl}/uploads/brand/logo-horizontal.png`;
  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:8px 12px;background:#f3f3f3;font-family:Inter,Arial,sans-serif;font-size:13px;color:#5a5a5a;width:140px;border-bottom:1px solid #e0e0e0;vertical-align:top;text-transform:uppercase;letter-spacing:.06em;">${escapeHtml(label)}</td>
           <td style="padding:8px 12px;background:#ffffff;font-family:Inter,Arial,sans-serif;font-size:14px;color:#1f233f;border-bottom:1px solid #e0e0e0;">${escapeHtml(value)}</td>
         </tr>`
      : "";

  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f3f3;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f3f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border:1px solid #e0e0e0;">
        <tr>
          <td style="padding:24px 28px;background:#434c8c;text-align:left;">
            <img src="${logo}" alt="Ortega & Ortega Abogados" width="220" style="display:block;height:auto;border:0;"/>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;font-family:Inter,Arial,sans-serif;color:#434c8c;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ccbc54;font-weight:600;">Nuevo contacto desde el sitio</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#434c8c;font-weight:600;">${escapeHtml(data.asunto || "Mensaje del formulario de contacto")}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">
              ${row("Nombre", data.nombre || "")}
              ${row("Email", data.email || "")}
              ${row("Celular", data.celular || "")}
              ${row("Asunto", data.asunto || "")}
            </table>

            <div style="margin-top:18px;padding:18px;background:#f9f8f1;border-left:4px solid #ccbc54;">
              <p style="margin:0 0 6px;font-family:Inter,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a89829;">Mensaje</p>
              <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f233f;white-space:pre-wrap;">${escapeHtml(data.mensaje || "")}</p>
            </div>

            <p style="margin:24px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;color:#5a5a5a;">
              Para responder: <a href="mailto:${escapeHtml(data.email || "")}" style="color:#434c8c;text-decoration:underline;">${escapeHtml(data.email || "")}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background:#f3f3f3;font-family:Inter,Arial,sans-serif;font-size:11px;color:#7a7a7a;text-align:center;letter-spacing:.06em;text-transform:uppercase;">
            Notificación automática · <a href="${siteUrl}" style="color:#a89829;text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//,""))}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function leadEmail(data: ContactPayload, siteUrl: string): string {
  const logo = `${siteUrl}/uploads/brand/logo-horizontal.png`;
  const firstName = (data.nombre || "").split(" ")[0] || "estimado/a";

  return `<!doctype html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f3f3f3;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f3f3;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border:1px solid #e0e0e0;">
        <tr>
          <td style="padding:24px 28px;background:#434c8c;text-align:left;">
            <img src="${logo}" alt="Ortega & Ortega Abogados" width="220" style="display:block;height:auto;border:0;"/>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px 8px;font-family:Inter,Arial,sans-serif;color:#1f233f;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ccbc54;font-weight:600;">Hemos recibido su mensaje</p>
            <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:24px;color:#434c8c;font-weight:600;">Gracias por contactarnos, ${escapeHtml(firstName)}.</h1>
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f233f;">
              En <strong>Ortega &amp; Ortega Abogados</strong> recibimos su consulta y le responderemos a la
              brevedad. Nuestro equipo revisará el caso y se pondrá en contacto con usted por el medio
              que indicó.
            </p>
            <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1f233f;">
              Para su referencia, este es el mensaje que nos envió:
            </p>
            <div style="padding:18px;background:#f9f8f1;border-left:4px solid #ccbc54;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#1f233f;white-space:pre-wrap;">${escapeHtml(data.mensaje || "")}</p>
            </div>
            <p style="margin:0;font-size:15px;line-height:1.6;color:#1f233f;">
              Saludos cordiales,<br/>
              <strong style="color:#434c8c;">Equipo Ortega &amp; Ortega Abogados</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px 28px;font-family:Inter,Arial,sans-serif;font-size:13px;color:#5a5a5a;border-top:1px solid #e0e0e0;">
            <p style="margin:0 0 4px;"><strong style="color:#434c8c;">ORTEGA &amp; ORTEGA ABOGADOS</strong></p>
            <p style="margin:0 0 4px;">Calle Portugal No. E10-77 y Av. Rep. del Salvador, Edif. Ámbar, Of. 701, Quito — Ecuador</p>
            <p style="margin:0 0 4px;">Tel: +(593) 2 601 9970 · Móvil: +(593) 99 980 8183</p>
            <p style="margin:0;"><a href="mailto:orgabogados@hotmail.com" style="color:#a89829;text-decoration:none;">orgabogados@hotmail.com</a> · <a href="${siteUrl}" style="color:#a89829;text-decoration:none;">${escapeHtml(siteUrl.replace(/^https?:\/\//,""))}</a></p>
          </td>
        </tr>
      </table>
      <p style="margin:14px 0 0;font-family:Inter,Arial,sans-serif;font-size:11px;color:#9a9a9a;text-align:center;">
        Este es un mensaje automático de confirmación. Por favor no responda a este correo.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Parse form data (application/x-www-form-urlencoded) or JSON
  let data: ContactPayload;
  try {
    const ct = (event.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/json")) {
      data = JSON.parse(event.body || "{}");
    } else {
      const params = new URLSearchParams(event.body || "");
      data = Object.fromEntries(params.entries()) as ContactPayload;
    }
  } catch {
    return { statusCode: 400, body: "Invalid body" };
  }

  // Honeypot: si lleno, ignoramos silenciosamente (bots lo completan, humanos no lo ven)
  if (data["bot-field"]) {
    return { statusCode: 200, body: "ok" };
  }

  // Anti-bot por tiempo: si llegó en menos de 2 segundos desde que se mostró el form, es bot
  if (data._ts) {
    const elapsed = Date.now() - Number(data._ts);
    if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2000) {
      return { statusCode: 200, body: "ok" }; // silencioso
    }
  }

  // Validación mínima
  if (!data.nombre || !data.email || !data.mensaje) {
    return { statusCode: 400, body: "Faltan campos requeridos" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { statusCode: 400, body: "Email inválido" };
  }

  // Cloudflare Turnstile (si está configurado)
  const ip = (event.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  const turnstileOk = await verifyTurnstile(data["cf-turnstile-response"], ip);
  if (!turnstileOk) {
    return { statusCode: 400, body: "Verificación anti-spam fallida. Intente de nuevo." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Ortega & Ortega Abogados <ortega@gurumba.com>";
  // Prioridad: Turso (editable desde /admin/) → env var → fallback hardcoded
  const tursoLead = await getLeadEmailFromTurso();
  const adminTo =
    tursoLead ||
    process.env.CONTACT_TO ||
    "orgabogados@hotmail.com";
  const siteUrl = process.env.SITE_URL || "https://ortegaortegaabogados.com";

  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    return { statusCode: 500, body: "Server config error" };
  }

  const resend = new Resend(apiKey);

  try {
    // 1) Mail al despacho con los datos
    await resend.emails.send({
      from,
      to: [adminTo],
      replyTo: data.email,
      subject: `[Web] Nuevo contacto: ${data.asunto || data.nombre}`,
      html: adminEmail(data, siteUrl),
    });

    // 2) Confirmación al lead
    await resend.emails.send({
      from,
      to: [data.email],
      subject: "Hemos recibido su mensaje — Ortega & Ortega Abogados",
      html: leadEmail(data, siteUrl),
    });
  } catch (err) {
    console.error("Resend error:", err);
    return { statusCode: 500, body: "No se pudo enviar el mensaje. Intente de nuevo." };
  }

  // Redirect to gracias si vino de form HTML, sino JSON
  const accept = (event.headers["accept"] || "").toLowerCase();
  if (accept.includes("application/json")) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  }
  return {
    statusCode: 303,
    headers: { Location: `${siteUrl}/gracias/` },
    body: "",
  };
};
