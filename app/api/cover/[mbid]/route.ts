import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies cover art through our own origin. The Cover Art Archive's
 * release-group endpoint 307-redirects to archive.org, and that final
 * response doesn't reliably carry CORS headers — fine for a plain <img>,
 * but WebGLRenderer.texImage2D() refuses to use a cross-origin image
 * without them (the canvas gets "tainted" and the texture silently fails).
 * Fetching it server-side and re-serving it same-origin avoids the whole
 * problem.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mbid: string }> }
) {
  const { mbid } = await params;

  if (!mbid || mbid.length !== 36) {
    return new NextResponse(null, { status: 400 });
  }

  const size = request.nextUrl.searchParams.get("size") ?? "250";
  const safeSize = ["250", "500", "1200"].includes(size) ? size : "250";

  const upstream = await fetch(
    `https://coverartarchive.org/release-group/${mbid}/front-${safeSize}.jpg`,
    {
      headers: {
        "User-Agent": "grant-website (https://github.com/rstr1/grant-website)",
      },
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
