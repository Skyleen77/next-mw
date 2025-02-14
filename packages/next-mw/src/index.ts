import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
} from 'next/server';
import { matchRequest, Matcher } from './matcher';

/**
 * Type for a Next.js middleware function.
 */
export type NextMiddleware = (
  req: NextRequest,
  ev: NextFetchEvent,
) => Promise<NextResponse | void> | NextResponse | void;

/**
 * Type for a middleware module that includes the middleware function and optional configuration.
 */
export type MiddlewareModule = {
  middleware: NextMiddleware;
  config?: {
    matcher?: Matcher;
    [key: string]: any;
  };
};

/**
 * Composes multiple middlewares into a single middleware.
 * Middlewares are executed in the order provided.
 * If a middleware returns a response, execution stops and that response is returned.
 *
 * @param modules - List of imported middleware modules.
 * @returns The composed middleware function.
 */
export function middlewares(...modules: MiddlewareModule[]) {
  return async function (req: NextRequest, ev: NextFetchEvent) {
    for (const module of modules) {
      // If a matcher is defined, check if it matches the request.
      if (module.config?.matcher && !matchRequest(req, module.config.matcher)) {
        continue;
      }
      const result = await module.middleware(req, ev);
      if (result) {
        return result;
      }
    }
    return NextResponse.next();
  };
}

/**
 * Default configuration to be exported in middleware.ts.
 * This configuration avoids processing static files, API routes, etc.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
