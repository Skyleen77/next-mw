import { NextResponse } from 'next/server';
import type { Config } from 'next-mw';
import type { NextRequest } from 'next/server';

/**
 * Admin authorization middleware.
 * Redirects to /unauthorized if the user is not an admin.
 * @param request - The NextRequest object.
 * @returns A redirect response or NextResponse.next() if authorized.
 */
export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('isAdmin');
  if (!isAdmin || isAdmin.value !== 'true') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  return NextResponse.next();
}

/**
 * Middleware configuration using a complex matcher.
 *
 * Complex matcher:
 * - Applies to routes starting with /admin.
 * - Uses a regexp to further validate the path.
 * - Requires the presence of header "x-admin-check" with value "check".
 * - Requires the absence of cookie "bypassAdmin" with value "true".
 * - Additionally, it applies to any other /admin routes as a fallback.
 */
export const config = {
  matcher: [
    {
      source: '/admin/:path*',
      regexp: '^/admin/(.*)$',
      locale: false,
      has: [{ type: 'header', key: 'x-admin-check', value: 'check' }],
      missing: [{ type: 'cookie', key: 'bypassAdmin', value: 'true' }],
    },
    '/admin/:path*',
  ],
} satisfies Config;
