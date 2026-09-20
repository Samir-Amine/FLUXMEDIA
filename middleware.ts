import { NextResponse, type NextRequest } from "next/server";

/**
 * Protect admin pages and admin API routes.
 *
 * The actual session validity is checked server-side in lib/auth.ts.
 * We intentionally do not redirect /admin/login just because a cookie exists,
 * because an expired/invalid cookie can otherwise create a redirect loop.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/admin/login";
  const hasCookie = Boolean(req.cookies.get("fm_session")?.value);

  // Protect admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!hasCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Protect admin pages
  if (pathname.startsWith("/admin") && !isLogin && !hasCookie) {
    const url = req.nextUrl.clone();

    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  // IMPORTANT:
  // Do not redirect /admin/login when a cookie exists.
  // The server-side auth check handles invalid/expired sessions.
  //
  // This prevents:
  // /admin → /admin/login → /admin → /admin/login → ...
  //
  // when an old fm_session cookie is present.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};