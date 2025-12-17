import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Firebase auth state is client-side only, so we can't check auth in middleware
// The actual auth check happens in the dashboard layout component
// This middleware just handles basic routing logic

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication (handled client-side)
  const protectedRoutes = ['/dashboard'];

  // Auth routes (login, signup, etc.)
  const authRoutes = ['/login', '/signup', '/forgot-password', '/auth'];

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if this is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // For now, just pass through all requests
  // The actual auth check is done client-side in the dashboard layout
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*$).*)',
  ],
};
