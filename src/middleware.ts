import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // Import the Edge-safe config

// Initialize NextAuth with only the Edge-safe config for the middleware bouncer
export default NextAuth(authConfig).auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/history');

  if (!isLoggedIn && isProtectedRoute) {
    return Response.redirect(new URL('/', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};