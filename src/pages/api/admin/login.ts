/**
 * POST /api/admin/login
 *
 * Body JSON: { email, password }
 * Respuesta exitosa: 200 { ok: true } + Set-Cookie oo_session=...
 * Respuesta error:   401 { error: "Credenciales inválidas." }
 */
import type { APIRoute } from "astro";
import {
  loginWithEmailPassword,
  signSession,
  buildSessionCookie,
} from "@/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return json({ error: "Faltan credenciales" }, 400);
  }

  const session = await loginWithEmailPassword(email, password);
  if (!session) {
    // Pequeño delay para frenar fuerza bruta (no es defensa real, solo molesta).
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: "Correo o contraseña incorrectos." }, 401);
  }

  const token = await signSession(session);
  return new Response(JSON.stringify({ ok: true, email: session.email }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildSessionCookie(token),
    },
  });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
