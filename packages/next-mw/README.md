<img src="https://next-mw-docs.vercel.app/logo-light.png" style="height:30px;" />

<br />

**NEXT MW** is a package that lets you compose multiple Next.js middlewares together.  
Each middleware can have its own configuration (using matchers similar to Next.js) and they are executed in the order you specify.

---

## Features

- **Compose multiple middlewares:** Run several middlewares sequentially and stop when one returns a response.
- **Advanced matcher support:** Use string, array, or object matchers (with conditions like `has` and `missing`) similar to Next.js.
- **Seamless Next.js integration:** Works with Next.js middleware system using the same configuration style.
- **TypeScript support:** Written in TypeScript with proper type definitions.

---

## Installation

Install via your favorite package manager:

```bash
npm install next-mw
# or
yarn add next-mw
# or
pnpm add next-mw
```

_Note: Next.js must be installed in your project (it's listed as a peer dependency)._

## Usage

### Compose Middlewares

Create a file `middleware.ts` at the root of your Next.js project:

```typescript
// middleware.ts
import { middlewares } from 'next-mw';

import * as authMiddleware from './middlewares/auth-middleware';
import * as adminMiddleware from './middlewares/admin-middleware';

export const middleware = middlewares(authMiddleware, adminMiddleware);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
```

### Example Middlewares

#### Authentication Middleware

```typescript
// middlewares/auth-middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

#### Admin Authorization Middleware with Complex Matcher

```typescript
// middlewares/admin-middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdmin = request.cookies.get('isAdmin');
  if (!isAdmin || isAdmin.value !== 'true') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  return NextResponse.next();
}

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
};
```

## License

This project is licensed under the MIT License.
