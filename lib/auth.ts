import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "fluxmedia-demo-secret-rotate-in-production";
const COOKIE = "fm_session";
const DAY = 86400;

export const adminPassword = () => process.env.ADMIN_PASSWORD || "fluxmedia-admin";

const sign = (payload: string) =>
  createHmac("sha256", SECRET).update(payload).digest("base64url");

export function createSessionCookie(): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + 7 * DAY;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload)}`, maxAge: 7 * DAY };
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  if (role !== "admin") return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${role}.${exp}`);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function requireAdmin(): boolean {
  return isValidSession(cookies().get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;
