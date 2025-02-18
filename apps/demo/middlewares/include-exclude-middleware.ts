import type { Config } from 'next-mw';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🚀 pathname: ', request.nextUrl.pathname);
}

export const config = {
  include: ['/', '/dashboard', '/admin/:path*'],
  exclude: ['/profile'],
} satisfies Config;
