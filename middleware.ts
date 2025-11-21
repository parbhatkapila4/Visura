import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/summaries(.*)",
  "/upload(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/share(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public access to share routes
  if (isPublicRoute(req)) {
    return;
  }
  
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
