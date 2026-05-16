/**
 * Helpers de autenticación para el admin custom.
 *
 *  - hashPassword / verifyPassword: bcryptjs (pure-JS, funciona en serverless).
 *  - signJWT / verifyJWT:           jose (HS256), token vive en cookie HttpOnly.
 *  - getSessionFromCookie:          decodifica la cookie y devuelve el usuario o null.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const SESSION_COOKIE = "oo_session";
const SESSION_DAYS = 7;

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ?? import.meta.env?.JWT_SECRET ?? "";
  if (!secret || secret.length < 16) {
    throw new Error(
      "[auth] JWT_SECRET ausente o muy corto. Define uno largo en .env (usa: openssl rand -base64 48)."
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------
export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "number" || typeof payload.email !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      role: typeof payload.role === "string" ? payload.role : "admin",
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers (Astro API routes)
// ---------------------------------------------------------------------------
export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

export function buildSessionCookie(token: string): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Devuelve la sesión activa a partir de las cookies de un Request.
 * Compatible con Astro (Astro.cookies.get) y con cualquier Headers.
 */
export async function getSessionFromCookies(
  cookies: { get: (n: string) => { value: string } | undefined } | undefined
): Promise<SessionPayload | null> {
  const raw = cookies?.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySession(raw);
}

// ---------------------------------------------------------------------------
// Login: busca user por email y verifica password
// ---------------------------------------------------------------------------
export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<SessionPayload | null> {
  const res = await db.execute({
    sql: "SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    args: [email.toLowerCase().trim()],
  });
  if (res.rows.length === 0) return null;
  const u = res.rows[0] as unknown as {
    id: number;
    email: string;
    password_hash: string;
    role: string;
  };
  const ok = await verifyPassword(password, u.password_hash);
  if (!ok) return null;
  return { userId: Number(u.id), email: String(u.email), role: String(u.role) };
}
