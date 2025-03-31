// middleware.js (root level)

import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protect these routes from unauthenticated access
console.log("Middleware Added");
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// ✅ Fix: Ensure runtime is Node.js (Arcjet needs this)
export const runtime = "nodejs";

// ✅ Arcjet middleware setup
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
        "GO_HTTP", // For Inngest and DevTools
      ],
    }),
  ],
});

// ✅ Clerk middleware setup
const clerk = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

// ✅ Combine Arcjet → then Clerk middleware
export default createMiddleware(aj, clerk);

// ✅ Define which routes the middleware should apply to
export const config = {
  matcher: [
    // Match all except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always include API routes
    "/(api|trpc)(.*)",
  ],
};
