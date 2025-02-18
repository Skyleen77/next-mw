import type { Config } from 'next-mw';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication middleware.
 * Redirects to /login if no authToken cookie is present.
 * @param request - The NextRequest object.
 * @returns A redirect response or NextResponse.next() if authenticated.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

/**
 * Middleware configuration.
 * Applies to routes under /dashboard and /profile.
 */
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
} satisfies Config;
