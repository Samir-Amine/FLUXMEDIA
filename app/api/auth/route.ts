import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { adminPassword, createSessionCookie, SESSION_COOKIE } from "@/lib/auth";

const attempts = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const a = attempts.get(ip) || { n: 0, t: Date.now() };
  if (Date.now() - a.t > 15 * 60_000) { a.n = 0; a.t = Date.now(); }
  if (a.n >= 10) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = adminPassword();
  const ok =
    typeof password === "string" &&
    password.length === expected.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(expected));

  if (!ok) {
    a.n += 1;
    attempts.set(ip, a);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  attempts.delete(ip);
  const s = createSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, s.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: s.maxAge,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
