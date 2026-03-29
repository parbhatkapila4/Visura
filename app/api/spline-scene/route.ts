import { NextResponse } from "next/server";
import { getSplineSceneUpstreamUrl } from "@/lib/spline-scene-upstream";

export async function GET() {
  const upstream = getSplineSceneUpstreamUrl();

  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: {
        Accept: "*/*",
        "User-Agent":
          "Mozilla/5.0 (compatible; VisuraSplineProxy/1.0; +https://visura.app)",
      },
      next: { revalidate: 300 },
    });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!res.ok) {
    return new NextResponse(`Spline returned ${res.status}`, {
      status: res.status,
    });
  }

  const body = res.body;
  if (!body) {
    return new NextResponse(null, { status: 502 });
  }

  const contentType =
    res.headers.get("Content-Type") ?? "application/octet-stream";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
