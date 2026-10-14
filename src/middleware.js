import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation.
    "/((?!_next/static|_next/image|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
