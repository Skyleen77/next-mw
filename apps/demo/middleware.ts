import { middlewares } from 'next-mw/src/index';

import * as includeExcludeMiddleware from './middlewares/include-exclude-middleware';
import * as authMiddleware from './middlewares/auth-middleware';
import * as adminMiddleware from './middlewares/admin-middleware';

export const middleware = middlewares(
  includeExcludeMiddleware,
  authMiddleware,
  adminMiddleware,
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
