import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge guard: any /admin route (except /admin/login) and /api/admin/* require
 * the session cookie to be present. The cookie's HMAC signature is verified
 * server-side in lib/auth.ts on every admin page/API handler as well.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasCookie = Boolean(req.cookies.get("fm_session")?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!hasCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !isLogin && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (isLogin && hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
