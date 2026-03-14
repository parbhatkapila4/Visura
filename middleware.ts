import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard/(.*)",
  "/summaries(.*)",
  "/upload(.*)",
  "/chat(.*)",
  "/workspaces(.*)",
  "/chatbot(.*)",
  "/account",
  "/account/(.*)",
]);

const isPublicRoute = createRouteMatcher(["/share(.*)"]);

function stripRedirectUrlOnAuth(req: Request): NextResponse | null {
  const url = new URL(req.url);
  const path = url.pathname;
  const isSignIn = path === "/sign-in" || path.startsWith("/sign-in/");
  const isSignUp = path === "/sign-up" || path.startsWith("/sign-up/");
  if (!isSignIn && !isSignUp) return null;
  if (!url.searchParams.has("redirect_url")) return null;
  const clean = new URL(path, url.origin);
  url.searchParams.forEach((value, key) => {
    if (key !== "redirect_url") clean.searchParams.set(key, value);
  });
  return NextResponse.redirect(clean.toString());
}

export default clerkMiddleware(async (auth, req) => {
  const stripped = stripRedirectUrlOnAuth(req);
  if (stripped) return stripped;

  if (isPublicRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/(.*)",
    "/account",
    "/account/(.*)",
    "/upload",
    "/upload/(.*)",
    "/chat",
    "/chat/(.*)",
    "/workspaces",
    "/workspaces/(.*)",
    "/chatbot",
    "/chatbot/(.*)",
    "/summaries",
    "/summaries/(.*)",
    "/sign-in",
    "/sign-in/(.*)",
    "/sign-up",
    "/sign-up/(.*)",
    "/(api|trpc)(.*)",
  ],
};
