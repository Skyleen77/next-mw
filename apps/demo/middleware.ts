import { middlewares } from 'next-mw/src/index';
// import { middlewares, config } from 'next-mw';

import * as authMiddleware from './middlewares/auth-middleware';
import * as adminMiddleware from './middlewares/admin-middleware';

export const middleware = middlewares(authMiddleware, adminMiddleware);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
