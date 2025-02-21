import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
} from 'next/server';
import { matchRequest, Matcher } from './matcher';

/**
 * Type for a Next.js middleware result.
 */
export type NextMiddlewareResult =
  | NextResponse
  | Response
  | null
  | undefined
  | void;

/**
 * Type for a Next.js middleware function.
 */
export type NextMiddleware = (
  req: NextRequest,
  ev: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

/**
 * Configuration option that uses only the "matcher" property.
 */
export type ConfigMatcher = {
  matcher: Matcher;
  include?: never;
  exclude?: never;
};

/**
 * Configuration option that uses "include" and/or "exclude".
 */
export type ConfigIncludeExclude = {
  matcher?: never;
  include?: Matcher;
  exclude?: Matcher;
};

/**
 * Configuration option type.
 */
export type Config = ConfigMatcher | ConfigIncludeExclude;

/**
 * Middleware module type.
 * You can either use the "matcher" configuration
 * or the "include"/"exclude" configuration, but not both.
 */
export type MiddlewareModule = {
  middleware: NextMiddleware;
  config?: Config;
};

/**
 * Composes multiple middlewares into a single middleware.
 * Matching logic:
 * - If "matcher" is defined, it is used exclusively.
 * - Otherwise, if "include" is defined, the request must match at least one pattern.
 * - And if "exclude" is defined, the request must not match any of the patterns.
 *
 * @param modules - List of imported middleware modules.
 * @returns The composed middleware function.
 */
export function middlewares(...modules: MiddlewareModule[]): NextMiddleware {
  // Immediate validation of middleware configurations
  for (const module of modules) {
    if (module.config) {
      // Check that both 'matcher' and 'include/exclude' are not defined simultaneously
      if (
        module.config.matcher !== undefined &&
        (module.config.include !== undefined ||
          module.config.exclude !== undefined)
      ) {
        throw new Error(
          "Cannot define both 'matcher' and 'include/exclude' in middleware config.",
        );
      }
    }
  }

  // Return the composed middleware function
  return async function (req: NextRequest, ev: NextFetchEvent) {
    for (const module of modules) {
      if (module.config) {
        // Use 'matcher' if it is defined
        if (module.config.matcher !== undefined) {
          if (!matchRequest(req, module.config.matcher)) {
            continue;
          }
        } else {
          // Otherwise, check 'include' and 'exclude' conditions
          if (
            module.config.include !== undefined &&
            !matchRequest(req, module.config.include)
          ) {
            continue;
          }
          if (
            module.config.exclude !== undefined &&
            matchRequest(req, module.config.exclude)
          ) {
            continue;
          }
        }
      }
      const result = await module.middleware(req, ev);
      if (result) {
        return result;
      }
    }
    return NextResponse.next();
  };
}
