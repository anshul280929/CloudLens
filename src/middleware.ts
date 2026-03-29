import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");

  // Allow auth API routes always
  if (isAuthRoute) return NextResponse.next();

  // Redirect unauthenticated users from dashboard to homepage
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
