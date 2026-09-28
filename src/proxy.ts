import { NextResponse, type NextRequest } from "next/server";
import { PREVIEW_COOKIE, isValidPreviewToken } from "@/lib/preview-cookie";

/**
 * Maintenance mode.
 *
 * When it is switched on under Features → Maintenance, every public page is
 * answered with the maintenance notice and a 503 status. The 503 matters: it
 * tells search engines the site is temporarily unavailable, so they keep the
 * pages they have indexed instead of replacing them with the notice (brief §31).
 *
 * The admin, the API, the notice itself and static files are never touched, and
 * an admin holding a valid preview cookie sees the real site.
 *
 * The proxy cannot read the database itself, so it asks /site-status, which is
 * cached at the edge. Anything going wrong there leaves the site open — a
 * failed check must never take the website down by accident.
 */
export async function proxy(request: NextRequest) {
  let maintenance = false;
  try {
    const res = await fetch(new URL("/site-status", request.url), {
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) maintenance = (await res.json()).maintenance === true;
  } catch {
    return NextResponse.next();
  }
  if (!maintenance) return NextResponse.next();

  if (await isValidPreviewToken(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const res = NextResponse.rewrite(new URL("/maintenance", request.url), { status: 503 });
  res.headers.set("Retry-After", "3600");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  // Everything except the admin, the API, Next's own files, the notice, the
  // status and country checks, and anything with a file extension (images, icons, robots.txt).
  matcher: ["/((?!admin|api|_next|maintenance|site-status|geo|.*\\..*).*)"],
};
